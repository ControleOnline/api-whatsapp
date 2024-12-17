const getContentType = (msg, media = null) => {
  if (msg?.messageStubType === 40 || msg?.messageStubType === 41) {
    // 40 = Chamada de voz perdida, 41 = Chamada de video perdida
    return 'call_log'
  }

  if (msg?.message?.locationMessage) return 'location'
  if (msg?.message?.liveLocationMessage) return 'liveLocation'
  if (msg?.message?.contactMessage?.vcard) return 'vcard'

  let mediaType = null
  if (media) {
    mediaType = media.mimetype?.split('/')[0]
    const mediaTypeNotAccepted = ['application', 'text']
    if (mediaTypeNotAccepted.includes(mediaType)) mediaType = 'document'
  }

  return mediaType ?? 'chat'
}

module.exports = getContentType
