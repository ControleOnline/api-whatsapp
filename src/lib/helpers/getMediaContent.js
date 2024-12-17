const getMediaContent = (msg) => {
  if (!msg) return null

  if (msg?.message?.ephemeralMessage) {
    msg = msg?.message?.ephemeralMessage
  }

  return (
    msg?.message?.audioMessage ||
    msg?.message?.imageMessage ||
    msg?.message?.videoMessage ||
    msg?.message?.documentMessage ||
    msg?.message?.documentWithCaptionMessage?.message?.documentMessage ||
    msg?.message?.stickerMessage
  )
}

module.exports = getMediaContent
