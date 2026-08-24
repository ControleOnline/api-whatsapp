const {
  getWbot,
  initBaileysSocket,
  removeWbot,
} = require('../lib/libbaileys.js')
const logger = require('../utils/logger.js')
const sleep = require('../utils/sleep.js')
const { createSessionStorage } = require('../lib/storage/sessionStorage.js')

const sessionStorage = createSessionStorage()

const state = [
  'UNKNOWN',
  'CONNECTING',
  'CONNECTED',
  'DISCONNECTING',
  'DISCONNECTED',
]

const index = async (_, res) => {
  const sessions = await sessionStorage.listSessions()
  res.status(200).json({ sessions })
}

const store = async (req, res) => {
  const { phone, webhooks } = req.body

  try {
    const wbot = getWbot(phone)
    if (wbot) {
      return res.status(200).json({
        status: state[wbot.user ? 2 : 1],
        qr: wbot.qr,
      })
    }
  } catch (error) {
    logger.error(error)
  }

  await sessionStorage.saveSession(phone, { phone, webhooks })

  const session = await initBaileysSocket(phone)
  await sleep(1)
  return res.status(201).json({
    message: 'Sessão criada com sucesso',
    qr: session.qr,
  })
}

const remove = async (req, res) => {
  const { phone } = req.body

  await removeWbot(phone)

  res.status(200).json({ message: 'Sessão excluída com sucesso' })
}

const addWebhook = async (req, res) => {
  const { phone, webhooks, type } = req.body

  try {
    const wbot = getWbot(phone)
    if (!wbot?.phone) return

    const data = (await sessionStorage.getSession(wbot.phone)) || {
      phone: wbot.phone,
      webhooks: {},
    }

    data.webhooks = {
      ...data.webhooks,
      [type]: webhooks,
    }

    await sessionStorage.saveSession(wbot.phone, data)
  } catch (error) {
    logger.error(error)
  }

  res.status(200).json({ message: 'Webhook adicionado com sucesso' })
}

module.exports = { index, store, addWebhook, remove }
