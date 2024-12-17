const { getWbot } = require('../lib/libbaileys.js')
const logger = require('../utils/logger.js')

const readMessages = async (req, res) => {
  const { telefone } = req.params

  try {
    const wbot = getWbot(telefone)

    const validNumber = await wbot.onWhatsApp(
      `${req.body.remoteJid}@s.whatsapp.net`,
    )

    if (validNumber && validNumber.length > 0) {
      const message = {
        id: req.body.messageid,
        remoteJid: validNumber[0].jid,
      }
      await wbot.readMessages(message)

      res.status(200).json({ message: 'Mensagens lidas com sucesso' })
    } else {
      res.status(400).json({ message: 'remoteJid invalido' })
    }
  } catch (error) {
    logger.error(error)
    res.status(400).json({ message: 'Erro ao ler mensagens' })
  }
}

module.exports = readMessages
