const express = require('express')
const fileUpload = require('express-fileupload')
const fs = require('fs')
const { initBaileysSocket } = require('./lib/libbaileys.js')
const routes = require('./routes/index.js')
const logger = require('./utils/logger.js')
const cors = require('cors')
const env = require('./utils/Env.js')

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
app.use(routes)

const port = env.PORT || 9000

app.listen(port, () => {
  logger.info(`Servidor iniciado na porta ${port}`)
})

const sessions = fs.readdirSync('sessions')

if (sessions.length > 0) {
  let contador = 0
  sessions.forEach((session) => {
    if (session !== '.gitkeep') {
      contador++
      const file = fs.readFileSync(`sessions/${session}`, 'utf8')
      const sessionData = JSON.parse(file)

      if (sessionData.telefone) {
        initBaileysSocket(sessionData.telefone)
      }
    }
  })
  logger.info(`Iniciando sessões, total de ${contador}`)
}