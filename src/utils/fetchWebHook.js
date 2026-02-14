const { readFileSync } = require('fs')
const env = require('../utils/Env.js')

const fetchWebHook = (wbot) => {
  if (!wbot.webhooks) {
    const sessionData = JSON.parse(
      readFileSync(`sessions/${wbot.phone}.json`, 'utf8'),
    )
    wbot.webhooks = sessionData.webhooks || []
  }

  wbot.webhooks.push(env.WEBHOOK)
  wbot.webhooks = wbot.webhooks.filter(
    (item, index, self) => self.indexOf(item) === index,
  )

  return wbot.webhooks
}

module.exports = fetchWebHook
