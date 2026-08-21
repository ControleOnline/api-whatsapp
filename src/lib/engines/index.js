const env = require('../../utils/Env')
const { parseMessageEngines } = require('./config')
const { pickWeightedEngine } = require('./selectEngine')
const { sendWithBaileys } = require('./baileysEngine')
const { sendWithMeta } = require('./metaEngine')
const { sendWithWebjs } = require('./webjsEngine')

const engineHandlers = {
  baileys: sendWithBaileys,
  meta: sendWithMeta,
  webjs: sendWithWebjs,
}

const sendMessageWithEngine = async ({ phone, number, content, random = Math.random }) => {
  const engines = parseMessageEngines(env.MESSAGE_ENGINES)
  const selectedEngine = pickWeightedEngine(engines, random)
  const handler = engineHandlers[selectedEngine.name]

  if (!handler) {
    throw new Error(`Handler não encontrado para a engine ${selectedEngine.name}`)
  }

  const result = await handler({ phone, number, content })

  return {
    ...result,
    selectedEngine: selectedEngine.name,
  }
}

module.exports = { sendMessageWithEngine }
