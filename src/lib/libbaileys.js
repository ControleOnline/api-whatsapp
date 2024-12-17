const {
  default: makeWASocket,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  makeInMemoryStore,
  useMultiFileAuthState,
} = require('@whiskeysockets/baileys')
const P = require('pino')
const { format } = require('date-fns')
const fs = require('fs')
const logger = require('../utils/logger.js')
const slugfy = require('../utils/slugfy.js')
const { baileysMessageListeners } = require('./listeners.js')
const env = require('../utils/Env.js')

const loggerBaileys = P({
  timestamp: () => `,"time":"${new Date().toJSON()}"`,
  level: 'fatal',
})

const sessions = []
const retriesQrCodeMap = new Map()

const getWbot = (telefone) => {
  const sessionIndex = sessions.findIndex((s) => s.telefone === telefone)

  if (sessionIndex === -1) {
    return null
  }
  return sessions[sessionIndex]
}

const removeWbot = async (telefone) => {
  const sessionIndex = sessions.findIndex((s) => s.telefone === telefone)
  if (sessionIndex !== -1) {
    try {
      if (env.STORE) {
        if (sessions[sessionIndex].interval)
          clearInterval(sessions[sessionIndex].interval)
        fs.rmSync(`store/${telefone}.json`, {
          force: true,
        })
      }
    } catch (error) {
      logger.error(error)
    }

    try {
      await sessions[sessionIndex].logout()
    } catch (error) {
      logger.error(error)
    }

    try {
      sessions[sessionIndex].ev.removeAllListeners('connection.update')
    } catch (error) {
      logger.error(error)
    }

    try {
      sessions[sessionIndex].ev.removeAllListeners('chats.update')
    } catch (error) {
      logger.error(error)
    }

    try {
      await sessions[sessionIndex].ws.close()
    } catch (error) {
      logger.error(error)
    }

    try {
      sessions.splice(sessionIndex, 1)
    } catch (error) {
      logger.error(error)
    }
  }

  try {
    fs.rmSync(`sessions/${telefone}.json`, {
      force: true,
    })
  } catch (error) {
    logger.error(error)
  }

  try {
    fs.rmSync(`data/${telefone}`, {
      recursive: true,
      force: true,
    })
  } catch (error) {
    logger.error(error)
  }

  try {
    fs.rmSync(`data/${telefone}.json`, {
      force: true,
    })
  } catch (error) {
    logger.error(error)
  }
}

const initBaileysSocket = async (telefone) => {
  const { version } = await fetchLatestBaileysVersion()
  console.log('Iniciando Baileys Telefone: ', telefone, 'Versão: ', version)
  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async (resolve, reject) => {
    try {
      const store = makeInMemoryStore({ logger: loggerBaileys })

      // Será armazenado por cliente, cada cliente pode ter mais de uma sessão
      const sessionPath = `data/${telefone}`
      const { state, saveCreds } = await useMultiFileAuthState(sessionPath)

      let retriesQrCode = 0
      const sock = makeWASocket({
        logger: loggerBaileys,
        printQRInTerminal: true,
        linkPreviewImageThumbnailWidth: 150,
        generateHighQualityLinkPreview: true,
        receivedPendingNotifications: true,
        browser: ['ApiBaileys', '', ''],
        // Evitar a msg de "Time Out", para não reiniciar o backend
        defaultQueryTimeoutMs: 0,
        auth: {
          creds: state.creds,
          keys: makeCacheableSignalKeyStore(
            state.keys,
            P({
              timestamp: () =>
                `,"time":"${format(new Date(), 'dd/MM/yyyy HH:mm:ss')}"`,
              level: 'info',
            }),
          ),
        },
        version,
        syncFullHistory: true,
        getMessage: async (key) => {
          const { store } = getWbot(telefone)

          if (store) {
            const msg = await store.loadMessage(key.remoteJid, key.id)
            return msg?.message || undefined
          }
          return {
            conversation: 'Não foi possivel capturar a mensagem.',
          }
        },
      })

      sock.store = store
      sock.telefone = telefone

      if (env.STORE) {
        if (fs.existsSync(`store/${telefone}.json`))
          sock.store.readFromFile(`store/${telefone}.json`)
        if (sock.interval) clearInterval(sock.interval)
        sock.interval = setInterval(() => {
          sock.store.writeToFile(`store/${telefone}.json`)
        }, 10_000)
      }

      sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr, isOnline } = update

        sock.telefone = telefone

        if (qr) {
          const retries = retriesQrCodeMap.get(telefone) || 0

          if (retries && retries > 3) {
            try {
              const path = `data/${slugfy(telefone)}.json`

              if (fs.existsSync(path)) fs.unlinkSync(path)
            } catch (e) {
              logger.error('Erro ao excluir a sessão', e)
            }

            await sock.ws.close()
            retriesQrCodeMap.delete(telefone)
            return
          }
          retriesQrCodeMap.set(telefone, (retriesQrCode += 1))

          sock.qr = qr
        }

        const sessionIndex = sessions.findIndex((s) => s.telefone === telefone)

        if (sessionIndex === -1) {
          sessions.push(sock)
        } else {
          sessions[sessionIndex] = sock
        }

        if (
          connection === 'open' ||
          update?.receivedPendingNotifications ||
          isOnline
        ) {
          const sessionIndex = sessions.findIndex(
            (s) => s.telefone === telefone,
          )

          if (sessionIndex === -1) {
            sessions.push(sock)
          } else {
            sessions[sessionIndex] = sock
          }

          logger.info(`Sessão ${telefone} pronta!`)
          logger.info(`Existe(m) ${sessions.length} sessão(ões) criada(s).`)
          console.log(sessions.map((s) => s.telefone))
          resolve(sock)
        }

        if (connection === 'close') {
          const code = lastDisconnect?.error?.output?.statusCode
          const shouldReconnect = code !== DisconnectReason.loggedOut

          if (!shouldReconnect) {
            try {
              await removeWbot(telefone)
              logger.info(`Conexão: ${telefone} encerrada.`)
            } catch (error) {
              logger.error(`Erro ao excluir a sessão ${error}`)
            }
          }

          // reconnect if not logged out
          if (shouldReconnect) {
            setTimeout(() => initBaileysSocket(telefone), 2000)
          }
        }
      })

      baileysMessageListeners(sock, telefone)
      // credentials updated -- save them
      sock.ev.on('creds.update', async () => {
        await saveCreds()
      })

      store.bind(sock.ev)
      resolve(sock)
    } catch (error) {
      logger.error(error)
      reject(initBaileysSocket(telefone))
    }
  })
}

module.exports = { getWbot, initBaileysSocket, removeWbot }
