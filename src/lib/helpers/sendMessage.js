const logger = require('../../utils/logger.js')
const { sendMessageWithEngine } = require('../engines')

const sendMessage = async ({ phone, number, content }) => {
  try {
    return await sendMessageWithEngine({ phone, number, content })
  } catch (error) {
    logger.error(error)
    throw error
  }
}

module.exports = sendMessage
