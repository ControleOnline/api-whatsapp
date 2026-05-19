const amqp = require('amqplib')
const axios = require('axios')
const logger = require('../../utils/logger.js')
const env = require('../../utils/Env.js')
const sendMessage = require('../helpers/sendMessage.js')

const RECONNECT_DELAY_MS = 5000
const BUFFER_MARKER = '__queueBuffer'

let connection = null
let channel = null
let initializingPromise = null
let consumersStarted = false
let shuttingDown = false
let reconnectTimeout = null

const isRabbitMQEnabled = () => env.RABBITMQ_ENABLED && !!env.RABBITMQ_URL

const isPlainObject = (value) =>
  Object.prototype.toString.call(value) === '[object Object]'

const serializePayloadForQueue = (value) => {
  if (Buffer.isBuffer(value)) {
    return { [BUFFER_MARKER]: value.toString('base64') }
  }

  if (Array.isArray(value)) {
    return value.map(serializePayloadForQueue)
  }

  if (isPlainObject(value)) {
    return Object.fromEntries(
      Object.entries(value).map(([key, nestedValue]) => [
        key,
        serializePayloadForQueue(nestedValue),
      ]),
    )
  }

  return value
}

const deserializePayloadFromQueue = (value) => {
  if (Array.isArray(value)) {
    return value.map(deserializePayloadFromQueue)
  }

  if (isPlainObject(value)) {
    if (
      Object.keys(value).length === 1 &&
      typeof value[BUFFER_MARKER] === 'string'
    ) {
      return Buffer.from(value[BUFFER_MARKER], 'base64')
    }

    return Object.fromEntries(
      Object.entries(value).map(([key, nestedValue]) => [
        key,
        deserializePayloadFromQueue(nestedValue),
      ]),
    )
  }

  return value
}

const assertQueues = async (targetChannel) => {
  await targetChannel.assertQueue(env.RABBITMQ_WEBHOOK_QUEUE, { durable: true })
  await targetChannel.assertQueue(env.RABBITMQ_OUTBOUND_QUEUE, { durable: true })
}

const clearReconnectTimeout = () => {
  if (!reconnectTimeout) return

  clearTimeout(reconnectTimeout)
  reconnectTimeout = null
}

const scheduleReconnect = () => {
  if (!isRabbitMQEnabled() || shuttingDown || reconnectTimeout) return

  reconnectTimeout = setTimeout(() => {
    reconnectTimeout = null
    void initRabbitMQ()
  }, RECONNECT_DELAY_MS)

  logger.warn(
    `Nova tentativa de conexao com RabbitMQ agendada para ${RECONNECT_DELAY_MS / 1000}s.`,
  )
}

const resetState = () => {
  channel = null
  connection = null
  consumersStarted = false
}

const deliverWebhook = async ({ webhookUrl, data }) => {
  await axios.post(webhookUrl, data, {
    headers: {
      'api-token': env.API_KEY,
    },
  })
}

const deliverOutboundMessage = async ({ phone, number, content }) => {
  await sendMessage({ phone, number, content })
  return true
}

const startConsumers = async (targetChannel) => {
  if (consumersStarted) return

  await targetChannel.prefetch(env.RABBITMQ_PREFETCH)

  await targetChannel.consume(
    env.RABBITMQ_WEBHOOK_QUEUE,
    async (message) => {
      if (!message) return

      try {
        const payload = deserializePayloadFromQueue(
          JSON.parse(message.content.toString()),
        )
        await deliverWebhook(payload)
        targetChannel.ack(message)
      } catch (error) {
        logger.error(
          `Erro ao processar webhook da fila ${env.RABBITMQ_WEBHOOK_QUEUE}: ${error.message}`,
        )
        targetChannel.nack(message, false, false)
      }
    },
    { noAck: false },
  )

  await targetChannel.consume(
    env.RABBITMQ_OUTBOUND_QUEUE,
    async (message) => {
      if (!message) return

      try {
        const payload = deserializePayloadFromQueue(
          JSON.parse(message.content.toString()),
        )
        await deliverOutboundMessage(payload)
        targetChannel.ack(message)
      } catch (error) {
        logger.error(
          `Erro ao processar envio da fila ${env.RABBITMQ_OUTBOUND_QUEUE}: ${error.message}`,
        )
        targetChannel.nack(message, false, false)
      }
    },
    { noAck: false },
  )

  consumersStarted = true
}

async function initRabbitMQ() {
  if (!isRabbitMQEnabled()) return null
  if (channel) return channel
  if (initializingPromise) return initializingPromise

  initializingPromise = (async () => {
    try {
      const nextConnection = await amqp.connect(env.RABBITMQ_URL)
      const nextChannel = await nextConnection.createChannel()

      nextConnection.on('error', (error) => {
        logger.error(`Erro de conexao com RabbitMQ: ${error.message}`)
      })

      nextConnection.on('close', () => {
        resetState()

        if (!shuttingDown) {
          logger.warn(
            'Conexao RabbitMQ encerrada. A API continuara com fallback para envio direto ate religar o broker.',
          )
          scheduleReconnect()
        }
      })

      await assertQueues(nextChannel)
      await startConsumers(nextChannel)

      clearReconnectTimeout()
      connection = nextConnection
      channel = nextChannel

      logger.info('RabbitMQ conectado. Filas de webhooks e mensagens habilitadas.')

      return channel
    } catch (error) {
      resetState()
      logger.error(`Nao foi possivel conectar ao RabbitMQ: ${error.message}`)
      scheduleReconnect()
      return null
    } finally {
      initializingPromise = null
    }
  })()

  return initializingPromise
}

const publishJob = async ({ queueName, payload, fallback, description }) => {
  if (!isRabbitMQEnabled()) {
    return fallback(payload)
  }

  try {
    const targetChannel = await initRabbitMQ()

    if (!targetChannel) {
      logger.warn(`RabbitMQ indisponivel. ${description} sera processado diretamente.`)
      return fallback(payload)
    }

    targetChannel.sendToQueue(
      queueName,
      Buffer.from(JSON.stringify(serializePayloadForQueue(payload))),
      {
        persistent: true,
      },
    )

    return true
  } catch (error) {
    logger.error(
      `Erro ao publicar ${description} na fila ${queueName}: ${error.message}`,
    )
    return fallback(payload)
  }
}

const enqueueWebhookDelivery = async ({ webhookUrl, data }) => {
  return publishJob({
    queueName: env.RABBITMQ_WEBHOOK_QUEUE,
    payload: { webhookUrl, data },
    fallback: deliverWebhook,
    description: 'o webhook',
  })
}

const enqueueOutboundMessage = async ({ phone, number, content }) => {
  return publishJob({
    queueName: env.RABBITMQ_OUTBOUND_QUEUE,
    payload: { phone, number, content },
    fallback: deliverOutboundMessage,
    description: 'o envio de mensagem',
  })
}

const closeRabbitMQ = async () => {
  shuttingDown = true
  clearReconnectTimeout()

  if (!connection) {
    resetState()
    shuttingDown = false
    return
  }

  try {
    await connection.close()
  } catch (error) {
    logger.error(`Erro ao encerrar conexao RabbitMQ: ${error.message}`)
  } finally {
    resetState()
    shuttingDown = false
  }
}

module.exports = {
  closeRabbitMQ,
  deserializePayloadFromQueue,
  enqueueOutboundMessage,
  enqueueWebhookDelivery,
  initRabbitMQ,
  isRabbitMQEnabled,
  serializePayloadForQueue,
}
