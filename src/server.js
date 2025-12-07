const express = require('express')
const fileUpload = require('express-fileupload')
const fs = require('fs')
const { initBaileysSocket } = require('./lib/libbaileys.js')
const routes = require('./routes/index.js')
const logger = require('./utils/logger.js')
const cors = require('cors')
const env = require('./utils/Env.js')

// --- Global Error Handling ---
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

// --- Health Check Route ---
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'UP', uptime: process.uptime() })
})

app.use(routes)

const port = env.PORT || 9000

const server = app.listen(port, () => {
  logger.info(`Servidor iniciado na porta ${port}`)
  // Inicia a restauração de sessões APÓS o servidor estar ouvindo
  restoreSessions()
})

// --- Async Session Restoration ---
async function restoreSessions() {
  try {
    if (!fs.existsSync('sessions')) {
      return
    }

    const sessions = fs.readdirSync('sessions')
    if (sessions.length === 0) return

    logger.info(`Encontradas ${sessions.length} arquivos na pasta sessions.`)

    let contador = 0
    // Usar loop for...of para processar sequencialmente e evitar pico de CPU/Memória
    // que poderia matar o processo no Passenger durante a inicialização
    for (const session of sessions) {
      if (session !== '.gitkeep' && session.endsWith('.json')) {
        try {
          const fileContent = fs.readFileSync(`sessions/${session}`, 'utf8')
          const sessionData = JSON.parse(fileContent)

          if (sessionData.phone) {
            logger.info(`Restaurando sessão: ${sessionData.phone}`)
            // await aqui é crucial para não subir todas as instâncias do Chrome de uma vez
            await initBaileysSocket(sessionData.phone)
            contador++
            // Pequeno delay opcional para dar respiro à CPU
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

// --- Graceful Shutdown ---
function gracefulShutdown(signal) {
  logger.info(`${signal} recebido. Fechando servidor HTTP...`)
  
  server.close(() => {
    logger.info('Servidor HTTP fechado.')
    process.exit(0)
  })

  // Forçar encerramento se passar do tempo limite (ex: 10s)
  setTimeout(() => {
    logger.error('Não foi possível fechar as conexões a tempo, forçando encerramento.')
    process.exit(1)
  }, 10000)
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
process.on('SIGINT', () => gracefulShutdown('SIGINT'))
