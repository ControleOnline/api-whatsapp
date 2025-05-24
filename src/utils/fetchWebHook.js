const { readFileSync } = require('fs')
const logger = require('./logger.js')

const fetchWebHook = (wbot, type) => {
  if (!wbot.webhooks || !wbot.webhooks[type]) {
    const sessionData = JSON.parse(
      readFileSync(`sessions/${wbot.phone}.json`, 'utf8'),
    )

    if (!sessionData.webhooks?.[type]) {
      logger.error(
        `Webhook ${type} não configurado para a sessão ${wbot.phone}`,
      )
      return ''
    }

    wbot.webhooks = sessionData.webhooks
  }

  return wbot.webhooks[type]
}

module.exports = fetchWebHook
