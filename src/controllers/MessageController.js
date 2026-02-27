const {
  prepareMediaMessageContent,
} = require('../lib/helpers/prepareMediaMessageContent.js')
const sendMessage = require('../lib/helpers/sendMessage.js')
const GetAllUnreadMessages = require('../lib/helpers/unreadMessages')

const sendTextMedia = async (req, res) => {
  const { phone } = req.params
  const { number, message = '' } = req.body
  const media = req.files

  let content

  try {
    if (media) {
      content = await prepareMediaMessageContent({
        media: media.file,
        body: message,
      })
    } else {
      content = { text: message }
    }

    const sentMessage = await sendMessage({
      phone,
      number,
      content,
    })

    if (sentMessage)
      res.status(200).json({ message: 'Mensagem enviada com sucesso' })
  } catch (error) {
    res.status(400).json({ message: 'Erro ao enviar mensagem de mídia' })
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
