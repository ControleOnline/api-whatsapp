const fs = require('fs')
const {
  getWbot,
  initBaileysSocket,
  removeWbot,
} = require('../lib/libbaileys.js')
const logger = require('../utils/logger.js')
const sleep = require('../utils/sleep.js')

const state = [
  'UNKNOWN',
  'CONNECTING',
  'CONNECTED',
  'DISCONNECTING',
  'DISCONNECTED',
]

const index = async (_, res) => {
  const sessions = fs.readdirSync('sessions')
  const sessionsList = []

  if (sessions.length > 0) {
    sessions.forEach((session) => {
      if (session !== '.gitkeep') {
        const file = fs.readFileSync(`sessions/${session}`, 'utf8')
        const sessionData = JSON.parse(file)
        sessionsList.push(sessionData)
      }
    })
  }

  res.status(200).json({ sessions: sessionsList })
}

const status = async (req, res) => {
  const { telefone } = req.params

  try {
    const wbot = getWbot(telefone)

    res.status(200).json({
      status: state[wbot.user ? 2 : 1],
    })
  } catch (error) {
    res.status(200).json({ status: 'UNKNOWN' })
  }
}

const getQRCode = async (req, res) => {
  const { telefone } = req.params

  try {
    const wbot = getWbot(telefone)

    // const qr = await generateQRCode(telefone);
    res.status(200).json({ qr: wbot.qr })
  } catch (error) {
    logger.error(error)
    res.status(400).json({ message: 'Erro ao gerar QR Code: ' + error.message })
  }
}

const store = async (req, res) => {
  const { telefone, webhooks } = req.body

  try {
    const wbot = getWbot(telefone)
    if (wbot) {
      res.status(400).json({ message: 'Sessão já existe' })
      return
    }
  } catch (error) {
    logger.error(error)
  }

  fs.writeFileSync(
    `sessions/${telefone}.json`,
    JSON.stringify({ telefone, webhooks }),
  )

  const session = await initBaileysSocket(telefone)
  await sleep(1)
  res.status(200).json({
    message: 'Sessão criada com sucesso',
    qr: session.qr,
  })
}

const remove = async (req, res) => {
  const { telefone } = req.body

  await removeWbot(telefone)

  res.status(200).json({ message: 'Sessão excluída com sucesso' })
}

const addWebhook = async (req, res) => {
  const { telefone, webhooks, type } = req.body

  try {
    const wbot = getWbot(telefone)

    const path = `sessions/${wbot.telefone}.json`
    const data = JSON.parse(fs.readFileSync(path, 'utf-8'))
    data.webhooks = {
      ...data.webhooks,
      [type]: webhooks,
    }
    fs.writeFileSync(path, JSON.stringify(data), { flag: 'w' })
  } catch (error) {
    logger.error(error)
  }

  res.status(200).json({ message: 'Webhook adicionado com sucesso' })
}

module.exports = { index, store, addWebhook, getQRCode, remove, status }
