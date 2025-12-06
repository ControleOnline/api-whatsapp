const getBodyMessage = (msg) => {
  const m =
    msg.message?.ephemeralMessage?.message ||
    msg.message?.viewOnceMessage?.message ||
    msg.message

  let location = ""
  if (m?.locationMessage) {
    location = String(m.locationMessage.degreesLatitude)
  }

  let call = ""
  if (msg?.messageStubType === 40 || msg?.messageStubType === 41) {
    call = "Chamada de voz/vídeo perdida"
  }

  return (
    m?.conversation ||
    m?.extendedTextMessage?.text ||
    m?.imageMessage?.caption ||
    m?.videoMessage?.caption ||
    m?.documentMessage?.caption ||
    m?.buttonsMessage?.contentText ||
    m?.buttonsResponseMessage?.selectedDisplayText ||
    m?.listMessage?.description ||
    m?.listResponseMessage?.title ||
    m?.contactMessage?.vcard ||
    location ||
    call ||
    JSON.stringify(
      m?.contactsArrayMessage?.contacts?.map((c) => c.vcard)
    ) ||
    null
  )
}

module.exports = getBodyMessage
