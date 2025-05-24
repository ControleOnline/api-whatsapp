const { getWbot } = require('../libbaileys.js')
const logger = require('../../utils/logger.js')

const sendMessage = async ({ phone, number, content }) => {
  try {
    const wbot = getWbot(phone)

    const validNumber = await wbot.onWhatsApp(`${number}@s.whatsapp.net`)

    if (validNumber && validNumber.length > 0) {
      return await wbot.sendMessage(validNumber[0].jid, content)
    } else {
      throw new Error('Contato invalido')
    }
  } catch (error) {
    logger.error(error)
  }
}

module.exports = sendMessage
