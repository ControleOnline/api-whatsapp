const axios = require('axios')
const env = require('../../utils/Env')

const META_MEDIA_URL_ERROR =
  'A engine meta exige payload textual ou mídia publicada por URL (imageUrl, videoUrl, audioUrl ou documentUrl).'

const requireMediaUrl = (value) => {
  if (value) return value

  throw new Error(META_MEDIA_URL_ERROR)
}

const resolveMetaPayload = ({ number, content }) => {
  if (content.text) {
    return {
      messaging_product: 'whatsapp',
      to: number,
      type: 'text',
      text: { body: content.text },
    }
  }

  if (content.image) {
    return {
      messaging_product: 'whatsapp',
      to: number,
      type: 'image',
      image: {
        caption: content.caption || '',
        link: requireMediaUrl(content.imageUrl),
      },
    }
  }

  if (content.video) {
    return {
      messaging_product: 'whatsapp',
      to: number,
      type: 'video',
      video: {
        caption: content.caption || '',
        link: requireMediaUrl(content.videoUrl),
      },
    }
  }

  if (content.audio) {
    return {
      messaging_product: 'whatsapp',
      to: number,
      type: 'audio',
      audio: { link: requireMediaUrl(content.audioUrl) },
    }
  }

  if (content.document) {
    return {
      messaging_product: 'whatsapp',
      to: number,
      type: 'document',
      document: {
        caption: content.caption || '',
        filename: content.fileName,
        link: requireMediaUrl(content.documentUrl),
      },
    }
  }

  throw new Error(META_MEDIA_URL_ERROR)
}

const assertMetaConfig = () => {
  if (!env.META_PHONE_NUMBER_ID || !env.META_ACCESS_TOKEN) {
    throw new Error(
      'META_PHONE_NUMBER_ID e META_ACCESS_TOKEN são obrigatórios quando a engine meta estiver habilitada.',
    )
  }
}

const sendWithMeta = async ({ number, content }) => {
  assertMetaConfig()

  const payload = resolveMetaPayload({ number, content })
  const url = `https://graph.facebook.com/${env.META_API_VERSION}/${env.META_PHONE_NUMBER_ID}/messages`

  const response = await axios.post(url, payload, {
    headers: {
      Authorization: `Bearer ${env.META_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
  })

  return {
    engine: 'meta',
    providerMessageId: response.data?.messages?.[0]?.id || null,
  }
}

module.exports = { sendWithMeta, resolveMetaPayload, META_MEDIA_URL_ERROR }
