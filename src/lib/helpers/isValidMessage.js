const isValidMsg = (msg) => {
  if (msg.key.remoteJid === 'status@broadcast') return false

  const message = msg.message
  return !!(
    message?.conversation || // text
    message?.contactMessage?.vcard || // contato
    message?.contactsArrayMessage || // lista de contatos
    message?.buttonsResponseMessage || // buttons response
    message?.listResponseMessage || // list response
    message?.extendedTextMessage || // extended text
    message?.buttonsMessage || // buttoes
    message?.listMessage || // lista
    message?.audioMessage || // audio
    message?.imageMessage || // image
    message?.ephemeralMessage || // msg só do iphone (por enquanto)
    message?.videoMessage || // video
    message?.documentMessage || // documento
    message?.documentWithCaptionMessage || // documento com texto
    message?.locationMessage || // location
    message?.liveLocationMessage || // live location
    message?.stickerMessage || // sticker
    message?.reactionMessage || // reaction
    message?.editedMessage // edited message
  )
}

module.exports = isValidMsg
