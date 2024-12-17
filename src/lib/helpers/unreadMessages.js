const { getWbot } = require('../libbaileys')
const sleep = require('../../utils/sleep')
const prepareMessageData = require('../handlers/prepareMessageData')
const env = require('../../utils/Env')
const isValidMsg = require('./isValidMessage')

const GetAllUnreadMessages = async (telefone) => {
  console.log('Chamando o GetAllUnreadMessages')
  try {
    const wbot = getWbot(telefone)

    const naolidas = []
    const messages = []
    Object.values(wbot.store?.chats?.all()).forEach((chat) => {
      if (
        chat?.unreadCount &&
        chat?.unreadCount > 0 &&
        !chat?.id.includes('@g.us') &&
        !chat?.id.includes('status@broadcast')
      ) {
        const historico = wbot.store?.messages[chat.id]?.array
        if (historico && typeof historico === 'object') {
          const mensagem = historico.slice(chat.unreadCount * -1)
          naolidas.push({
            id: chat.id,
            count: chat.unreadCount,
            mensagens: mensagem,
          })
        }
      }
    })

    console.log(
      `Existem ${naolidas.length} chats com conversas a serem respondidas. Não Lidas.`,
    )

    let contador = 0
    for (const conversas of naolidas) {
      await sleep(0.1)
      contador++
      console.log(
        `Recupera mensagem não lida! Mensagem: ${contador}/${naolidas.length} Cliente: ${conversas.id} existem: ${conversas.count} desse cliente!`,
      )

      for await (const message of conversas.mensagens) {
        if (!env.FROMME && message.key.fromMe) continue
        if (!isValidMsg(message)) continue
        if (message.key.remoteJid === 'status@broadcast') continue
        if (!message.key.remoteJid || message.key.remoteJid.length < 10)
          continue

        try {
          const messageData = await prepareMessageData(message, wbot)
          messages.push(messageData)
        } catch (e) {
          console.log('GetAllUnreadMessages: ', e)
        }
      }
    }
    return messages
  } catch (error) {
    console.log('Erro ao mandar buscar não lidas', error)
  }
  return 0
}
module.exports = GetAllUnreadMessages
