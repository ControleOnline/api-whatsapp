const axios = require('axios')
const FormData = require('form-data')
const env = require('../../utils/Env')

const assertWebjsConfig = () => {
  if (!env.WEBJS_API_URL) {
    throw new Error(
      'WEBJS_API_URL é obrigatório quando a engine webjs estiver habilitada.',
    )
  }
}

const buildWebjsRequest = ({ number, content }) => {
  if (content.text) {
    return {
      headers: { 'Content-Type': 'application/json' },
      body: { number, message: content.text },
    }
  }

  const form = new FormData()
  form.append('number', number)
  form.append('message', content.caption || '')

  if (content.image) {
    form.append('file', content.image, { filename: 'image.bin' })
  } else if (content.video) {
    form.append('file', content.video, { filename: 'video.bin' })
  } else if (content.audio) {
    form.append('file', content.audio, { filename: 'audio.bin' })
  } else if (content.document) {
    form.append('file', content.document, {
      filename: content.fileName || 'document.bin',
    })
  } else {
    throw new Error('Conteúdo de mídia não suportado para a engine webjs.')
  }

  return {
    headers: form.getHeaders(),
    body: form,
  }
}

const sendWithWebjs = async ({ phone, number, content }) => {
  assertWebjsConfig()

  const { headers, body } = buildWebjsRequest({ number, content })
  const apiKey = env.WEBJS_API_KEY || env.API_KEY
  const response = await axios.post(`${env.WEBJS_API_URL}/messages/${phone}`, body, {
    headers: {
      ...headers,
      'api-key': apiKey,
    },
    maxBodyLength: Infinity,
  })

  return {
    engine: 'webjs',
    providerMessageId: response.data?.id || response.data?.messageId || null,
  }
}

module.exports = { sendWithWebjs }
