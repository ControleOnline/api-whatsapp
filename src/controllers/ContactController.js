const { getWbot } = require('../lib/libbaileys.js')
const logger = require('../utils/logger.js')
const {readFileSync} = require("fs");
const slugfy = require('../utils/slugfy.js')

const list = async (req, res) => {
  const { phone } = req.params

  const contacts = [];

  try {
    const wbot = getWbot(phone);

    if (!wbot) {
      res.status(400).json({ message: "Sessão não encontrada." });
      return;
    }

    const path = `data/${slugfy(wbot.phone)}.json`;
    const contactsBuffer = readFileSync(path);
    const contactsData = JSON.parse(contactsBuffer.toString());
    const contactsFiltered = contactsData.map((c) => {
      if (c.id === "status@broadcast" || c.id.includes("g.us")) return false;
      const number = c.id.split("@")[0];

      return {
        number,
        name: c.name
      };
    });

    contacts.push(...contactsFiltered);
  } catch (err) {
    logger.error(`Could not get whatsapp contacts from phone. ${err}`);
    res.status(400).json({ message: "Não foi possível obter os contatos." });
  }

  res.status(200).json(contacts);
}

const checkContact = async (req, res) => {
  const { phone } = req.params
  const { number } = req.body

  try {
    const wbot = getWbot(phone)

    const validNumber = await wbot.onWhatsApp(number.split('@')[0])

    let contact = {
      number,
      valid: false,
    }
    if (validNumber && validNumber.length > 0) {
      contact = { number: validNumber[0].jid.split('@')[0], valid: true }
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
  const { phone } = req.params
  const { number } = req.body

  try {
    const wbot = getWbot(phone)
    const validNumber = await wbot.onWhatsApp(number)

    if (validNumber && validNumber.length > 0) {
      const picture = await wbot.profilePictureUrl(validNumber[0].jid, 'image')
      res.status(200).json({ picture })
    } else {
      res.status(404).json({ message: 'remoteJid invalido' })
    }
  } catch (error) {
    logger.error(error)
    res
      .status(400)
      .json({ message: 'Não foi possível obter a foto de perfil. ', error })
  }
}

module.exports = { list, getProfilePicture, checkContact }
