const getBodyMessage = (msg) => {
  let location = ''
  if (msg.message?.locationMessage) {
    location = String(msg.message?.locationMessage?.degreesLatitude)
  }

  let call = ''
  if (msg?.messageStubType === 40 || msg?.messageStubType === 41) {
    call = 'Chamada de voz/vídeo perdida'
  }

  return (
    msg.message?.conversation ||
    msg.message?.imageMessage?.message ||
    msg.message?.videoMessage?.message ||
    msg.message?.documentMessage?.message ||
    msg.message?.extendedTextMessage?.text ||
    msg.message?.buttonsMessage?.contentText ||
    msg.message?.buttonsResponseMessage?.selectedDisplayText ||
    msg.message?.listMessage?.description ||
    msg.message?.listResponseMessage?.title ||
    msg.message?.documentWithCaptionMessage?.message?.documentMessage
      ?.message ||
    msg?.message?.contactMessage?.vcard ||
    location ||
    call ||
    JSON.stringify(
      msg?.message?.contactsArrayMessage?.contacts?.map((c) => c.vcard),
    ) ||
    null
  )
}

module.exports = getBodyMessage
