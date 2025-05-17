const express = require('express')
const fileUpload = require('express-fileupload')
const fs = require('fs').promises
const { initBaileysSocket } = require('./lib/libbaileys.js')
const routes = require('./routes/index.js')
const logger = require('./utils/logger.js')
const cors = require('cors')
const env = require('./utils/Env.js')
const swaggerUi = require('swagger-ui-express')
const { specs } = require('./configs/swagger.js')

process.on('unhandledRejection', (reason, promise) => {
  logger.error(`Unhandled Rejection at: ${promise}, reason: ${reason}`)
})

const app = express()

app.use(fileUpload({ limits: { fileSize: 100 * 1024 * 1024 } }))
app.use(cors({ credentials: true, origin: ['http://localhost:3000'] })) // Ajuste o origin conforme necessário
app.use(express.json({ limit: '100mb' }))
app.use(express.urlencoded({ limit: '100mb', extended: true, parameterLimit: 1024 * 1024 * 100 }))
app.use(express.text({ limit: '100mb' }))
app.use(express.raw({ limit: '100mb' }))

// Adiciona o Swagger UI no endpoint /
app.use('/docs', swaggerUi.serve, swaggerUi.setup(specs))

app.use(routes)

// Global error handler
app.use((err, req, res, next) => {
  logger.error(`Server error: ${err.message}`)
  res.status(500).json({ error: 'Internal server error' })
})

const port = parseInt(env.PORT) || 9000

app.listen(port, async () => {
  logger.info(`Servidor iniciado na porta ${port}`)
  try {
    const sessions = await fs.readdir('sessions')
    let contador = 0
    for (const session of sessions) {
      if (session !== '.gitkeep') {
        contador++
        try {
          const file = await fs.readFile(`sessions/${session}`, 'utf8')
          const sessionData = JSON.parse(file)
          if (sessionData.telefone) {
            initBaileysSocket(sessionData.telefone)
          }
        } catch (error) {
          logger.error(`Failed to process session ${session}: ${error.message}`)
        }
      }
    }
    logger.info(`Iniciando sessões, total de ${contador}`)
  } catch (error) {
    logger.error(`Failed to initialize sessions: ${error.message}`)
  }
})