const axios = require("axios");
const fetchWebHook = require("../utils/fetchWebHook.js");
const logger = require("../utils/logger.js");
const prepareMessageData = require("./handlers/prepareMessageData.js");
const isValidMsg = require("./helpers/isValidMessage.js");
const env = require("../utils/Env.js");

const sendWebhook = async (webhookUrl, data) => {
  try {
    await axios.post(webhookUrl, data, {
      headers: {
        "api-token": env.API_KEY,
      },
    });
  } catch (error) {
    logger.error(error);
  }
};

const baileysMessageListeners = (wbot, phone) => {
  logger.info(`Iniciando sessão ${phone}`);

  wbot.ev.on("messaging-history.set", async (data) => {
    const chatsNaoLidos = [];
    for await (const chat of data.chats) {
      if (chat?.unreadCount && chat?.unreadCount > 0) {
        chatsNaoLidos.push(chat);
      }
    }
    const conversas = [];
    for await (const message of data.messages) {
      for await (const chat of chatsNaoLidos) {
        if (message.key.remoteJid === chat.id) {
          if (!conversas.find((t) => t.key === chat.id)) {
            conversas.push({ key: chat.id, messages: [message] });
          } else {
            const conversa = conversas.find((t) => t.key === chat.id);
            if (
              conversa &&
              conversa.messages.length < (chat.unreadCount || 0)
            ) {
              conversas?.find((t) => t.key === chat.id)?.messages.push(message);
            }
          }
        }
      }
    }

    const webhookUrls = fetchWebHook(wbot);
    if (!webhookUrls) return;

    for (let index = 0; index < webhookUrls.length; index++) {
      const webhookUrl = webhookUrls[index];
      await sendWebhook(webhookUrl, {
        action: "messaging-history.set",
        messages: JSON.stringify(conversas),
      });
    }
  });

  wbot.ev.on("messages.upsert", async (messageUpsert) => {
    if (messageUpsert.type !== "notify") return;

    const webhookUrls = fetchWebHook(wbot);
    if (!webhookUrls) return;

    for (let index = 0; index < webhookUrls.length; index++) {
      const webhookUrl = webhookUrls[index];

      const messages = [];
      for await (const message of messageUpsert.messages) {
        if (!isValidMsg(message)) continue;

        if (!env.FROMME && message.key.fromMe) continue;

        const messageData = await prepareMessageData(message, wbot);
        if (messageData)
          await sendWebhook(webhookUrl, {
            id: messageData.messageid,
            action: "receiveMessage",
            origin: messageData.remoteJid,
            destination: String(wbot.phone),
            message: JSON.stringify(messageData.content.body),
            file: JSON.stringify(messageData.content.file),
          });
      }
    }
  });

  wbot.ev.on("messages.update", async (messageUpdate) => {
    if (messageUpdate.length === 0) return;
    const webhookUrls = fetchWebHook(wbot);
    if (!webhookUrls) return;

    for (let index = 0; index < webhookUrls.length; index++) {
      const webhookUrl = webhookUrls[index];
      const messages = [];
      for await (const message of messageUpdate) {
        const messageData = {
          messageid: message.key.id,
          update: message.update,
          remoteJid: message.key.remoteJid.split("@")[0],
        };
        await sendWebhook(webhookUrl, {
          id: messageData.messageid,
          action: "updateMessage",
          origin: messageData.remoteJid,
          destination: String(wbot.phone),
          message: JSON.stringify(messageData.update),
        });
      }
    }
  });
};

module.exports = { baileysMessageListeners, sendWebhook };
