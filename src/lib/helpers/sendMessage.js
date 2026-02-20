const { getWbot } = require('../libbaileys.js')
const logger = require('../../utils/logger.js')
const {store} = require("../libbaileys");
const {getLidByJid, saveContact} = require("./contactsMemory");
const {replaceNonDigits} = require("../../utils/replaceNonDigits");

const sendMessage = async ({ phone, number, content }) => {
  try {
    const wbot = getWbot(phone)

    const [contact] = await wbot.onWhatsApp(number)

    if (contact && contact.exists > 0) {

      const jid = replaceNonDigits(contact.jid)

      const lid = getLidByJid(jid)
      if (lid) {
        const message = await wbot.sendMessage(`${lid}@lid`, content)
        store.messages.set(message.key.id, message)
        return true
      }

      const message = await wbot.sendMessage(`${jid}@s.whatsapp.net`, content)
      store.messages.set(message.key.id, message)
      return true
    } else {
      throw new Error('Contato invalido: ' + phone)
    }
  } catch (error) {
    logger.error(error)
    throw new Error(error)
  }
}

module.exports = sendMessage
