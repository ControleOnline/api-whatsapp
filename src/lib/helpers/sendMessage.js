const { getWbot } = require('../libbaileys.js')
const logger = require('../../utils/logger.js')
const {store} = require("../libbaileys");

const sendMessage = async ({ phone, number, content }) => {
  try {
    const wbot = getWbot(phone)

    const validNumber = await wbot.onWhatsApp(number)

    if (validNumber && validNumber.length > 0) {
      const message = await wbot.sendMessage(validNumber[0].jid, content)
      store.messages.set(message.key.id, message)
      return true
    } else {
      throw new Error('Contato invalido: ' + phone)
    }
  } catch (error) {
    logger.error(error)
    throw new Error(error)
  }
}

module.exports = sendMessage
