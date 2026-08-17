const { getWbot, store } = require('../libbaileys.js')
const logger = require('../../utils/logger.js')
const { getLidByJid } = require('../helpers/contactsMemory')
const { replaceNonDigits } = require('../../utils/replaceNonDigits')

const sendWithBaileys = async ({ phone, number, content }) => {
  try {
    const wbot = getWbot(phone)
    if (!wbot) {
      throw new Error(`Sessão Baileys não encontrada para ${phone}`)
    }

    const [contact] = await wbot.onWhatsApp(number)
    if (!contact || !contact.exists) {
      throw new Error(`Contato invalido: ${number}`)
    }

    const jid = replaceNonDigits(contact.jid)
    const lid = getLidByJid(jid)
    const destination = lid ? `${lid}@lid` : `${jid}@s.whatsapp.net`
    const message = await wbot.sendMessage(destination, content)
    store.messages.set(message.key.id, message)

    return {
      engine: 'baileys',
      providerMessageId: message?.key?.id || null,
    }
  } catch (error) {
    logger.error(error)
    throw error
  }
}

module.exports = { sendWithBaileys }
