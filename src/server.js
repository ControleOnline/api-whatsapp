const express = require('express')
const fileUpload = require('express-fileupload')
const fs = require('fs')
const { initBaileysSocket } = require('./lib/libbaileys.js')
const routes = require('./routes/index.js')
const logger = require('./utils/logger.js')
const cors = require('cors')
const env = require('./utils/Env.js')
const { startWhisperServer, stopWhisperServer } = require('./lib/helpers/whisperServer.js')

process.on('uncaughtException', (err) => {
  logger.error(`Uncaught Exception: ${err.message}`)
  logger.error(err)
})

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason)
})

process.setMaxListeners(0)
require('events').EventEmitter.defaultMaxListeners = 0

const app = express()

app.use(fileUpload({ limits: { fileSize: 100 * 1024 * 1024 } }))

app.use(
  cors({
    credentials: true,
    origin: true,
  }),
)

app.use(express.json())

app.use(
  express.urlencoded({
    limit: '100mb',
    extended: true,
    parameterLimit: 1024 * 1024 * 100,
  }),
)

app.use(express.text({ limit: '100mb' }))
app.use(express.raw({ limit: '100mb' }))

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'UP', uptime: process.uptime() })
})

app.use(routes)

const port = env.PORT || 9000

const server = app.listen(port, '127.0.0.1', async () => {
  logger.info(`Servidor iniciado na porta ${port}`)
  await restoreSessions()
  await startWhisperServer()
})

async function restoreSessions() {
  try {
    if (!fs.existsSync('sessions')) return

    const sessions = fs.readdirSync('sessions')
    if (!sessions.length) return

    logger.info(`Encontradas ${sessions.length} arquivos na pasta sessions.`)

    let contador = 0

    for (const session of sessions) {
      if (session !== '.gitkeep' && session.endsWith('.json')) {
        try {
          const fileContent = fs.readFileSync(`sessions/${session}`, 'utf8')
          const sessionData = JSON.parse(fileContent)

          if (sessionData.phone) {
            logger.info(`Restaurando sessão: ${sessionData.phone}`)
            await initBaileysSocket(sessionData.phone)
            contador++
            await new Promise(resolve => setTimeout(resolve, 500))
          }
        } catch (err) {
          logger.error(`Erro ao restaurar sessão ${session}: ${err.message}`)
        }
      }
    }

    logger.info(`Restauração de sessões concluída. Total de ${contador} sessões iniciadas.`)
  } catch (error) {
    logger.error(`Erro fatal na restauração de sessões: ${error.message}`)
  }
}

function gracefulShutdown(signal) {
  logger.info(`${signal} recebido. Fechando servidor HTTP...`)

  server.close(async () => {
    logger.info('Servidor HTTP fechado.')
    await stopWhisperServer()
    process.exit(0)
  })

  setTimeout(async () => {
    logger.error('Forçando encerramento.')
    await stopWhisperServer()
    process.exit(1)
  }, 10000)
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
process.on('SIGINT', () => gracefulShutdown('SIGINT'))