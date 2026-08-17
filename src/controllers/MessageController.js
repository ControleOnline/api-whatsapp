const {
  prepareMediaMessageContent,
} = require('../lib/helpers/prepareMediaMessageContent.js')
const { enqueueOutboundMessage } = require('../lib/queue/rabbitmq.js')
const GetAllUnreadMessages = require('../lib/helpers/unreadMessages')

const sendTextMedia = async (req, res) => {
  const { phone } = req.params
  const {
    number,
    message = '',
    imageUrl,
    videoUrl,
    audioUrl,
    documentUrl,
  } = req.body
  const media = req.files

  let content

  try {
    if (media) {
      content = await prepareMediaMessageContent({
        media: media.file,
        body: message,
        publicUrls: {
          imageUrl,
          videoUrl,
          audioUrl,
          documentUrl,
        },
      })
    } else {
      content = { text: message }
    }

    const sentMessage = await enqueueOutboundMessage({
      phone,
      number,
      content,
    })

    if (sentMessage) {
      const payload = {
        message: 'Mensagem enviada com sucesso',
      }

      if (typeof sentMessage === 'object') {
        if (sentMessage.selectedEngine) {
          payload.engine = sentMessage.selectedEngine
        }
        if (sentMessage.providerMessageId) {
          payload.providerMessageId = sentMessage.providerMessageId
        }
      }

      return res.status(200).json(payload)
    }

    return res.status(400).json({ message: 'Nao foi possivel enviar a mensagem' })
  } catch (error) {
    return res.status(400).json({
      message: error.message || 'Erro ao enviar mensagem',
    })
  }
}

const unreadMessages = async (req, res) => {
  const { phone } = req.params

  try {
    const messages = await GetAllUnreadMessages(phone)

    res.status(200).json(messages)
  } catch (error) {
    console.error(error)
    res.status(400).json({ message: 'Erro ao obter mensagens' })
  }
}

module.exports = { sendTextMedia, unreadMessages }
