const downloadMedia = require('../helpers/donwloadMedia.js')
const getBodyMessage = require('../helpers/getBodyMessage.js')
const getContentType = require('../helpers/getContentType.js')
const getMediaContent = require('../helpers/getMediaContent.js')

const prepareMessageData = async (message, wbot) => {
  const chatId = String(message?.key?.remoteJid || message?.key?.participant || "")
  const count = wbot?.store?.chats?.get ? wbot.store.chats.get(chatId) : null

  const unreadMessages = message?.key?.fromMe ? 0 : count?.unreadCount || 1
  const media = getMediaContent(message)
  const mediaType = getContentType(message, media)

  let file
  if (media) {
    file = await downloadMedia(wbot, message, media, mediaType)
  }

  return {
    messageid: message.key.id,
    fromMe: message.key.fromMe,
    remoteJid: message.key.remoteJid.split('@')[0],
    unreadMessages,
    timestamp:
      message?.messageTimestamp?.low || message?.messageTimestamp?.high,
    content: {
      mediaType,
      file,
      body: getBodyMessage(message),
    },
  }
}

module.exports = prepareMessageData
