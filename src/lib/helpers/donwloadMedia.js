const {
  downloadContentFromMessage,
  downloadMediaMessage,
} = require('@whiskeysockets/baileys')
const P = require('pino')

const logger = require('../../utils/logger.js')
const streamToBuffer = require('../../utils/streamToBuffer.js')

const loggerBaileys = P({
  timestamp: () => `,"time":"${new Date().toJSON()}"`,
  level: 'warn',
})

const downloadMedia = async (wbot, msg, contentMessage, mediaType) => {
  if (!msg.message) return

  let media

  try {
    media = await downloadMediaMessage(
      msg,
      'buffer',
      {},
      { logger: loggerBaileys, reuploadRequest: wbot.updateMediaMessage },
    )
  } catch (error) {
    try {
      if (!contentMessage) return
      const contentMedia = await downloadContentFromMessage(
        contentMessage,
        mediaType,
      )

      media = await streamToBuffer(contentMedia)
    } catch (error) {
      logger.error(error)
    }
  }

  return media
}

module.exports = downloadMedia
