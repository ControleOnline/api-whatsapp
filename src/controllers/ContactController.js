const { getWbot } = require('../lib/libbaileys.js')
const logger = require('../utils/logger.js')

const list = async (req, res) => {
  const { telefone } = req.params

  const contacts = []

  try {
    const wbot = getWbot(telefone)

    Object.values(wbot.store?.contacts).forEach((contact) => {
      const number = contact.id.split('@')[0]
      if (number.length > 10) {
        contacts.push({
          name: contact.name,
          number,
        })
      }
    })
  } catch (err) {
    logger.error(`Could not get whatsapp contacts from phone. ${err}`)
    res.status(400).json({ message: 'Não foi possível obter os contatos.' })
  }

  res.status(200).json(contacts)
}

const checkContact = async (req, res) => {
  const { telefone } = req.params
  const { number } = req.body

  try {
    const wbot = getWbot(telefone)

    const validNumber = await wbot.onWhatsApp(
      `${number.split('@')[0]}@s.whatsapp.net`,
    )

    let contact = {
      number,
      valid: false,
    }
    if (validNumber && validNumber.length > 0) {
      contact = { number: validNumber[0].jid, valid: true }
    }

    res.status(200).json(contact)
  } catch (error) {
    logger.error(error)
    res
      .status(400)
      .json({ message: 'Não foi possível obter o contato.', error })
  }
}

const getProfilePicture = async (req, res) => {
  const { telefone } = req.params
  const { number } = req.body

  try {
    const wbot = getWbot(telefone)
    const validNumber = await wbot.onWhatsApp(`${number}@s.whatsapp.net`)

    if (validNumber && validNumber.length > 0) {
      const picture = await wbot.profilePictureUrl(validNumber[0].jid, 'image')
      res.status(200).json({ picture })
    } else {
      res.status(400).json({ message: 'remoteJid invalido' })
    }
  } catch (error) {
    logger.error(error)
    res
      .status(400)
      .json({ message: 'Não foi possível obter a foto de perfil. ', error })
  }
}

module.exports = { list, getProfilePicture, checkContact }
