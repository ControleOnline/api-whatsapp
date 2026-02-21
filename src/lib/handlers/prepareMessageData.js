const downloadMedia = require('../helpers/donwloadMedia.js')
const getBodyMessage = require('../helpers/getBodyMessage.js')
const getContentType = require('../helpers/getContentType.js')
const getMediaContent = require('../helpers/getMediaContent.js')
const {jidNormalizedUser} = require("baileys");
const {getLidByJid, saveContact} = require("../helpers/contactsMemory");
const {replaceNonDigits} = require("../../utils/replaceNonDigits");
const {isAudio} = require("../../utils/getMimeFormat");
const {transcribeAudioLocal} = require("../helpers/transcribeAudio");


const prepareMessageData = async (message, wbot) => {
    const rawJidLid = String(message?.key?.remoteJid || message?.key?.participant || "")
    const rawNumber = jidNormalizedUser((message?.key?.senderPn ?? message?.key?.remoteJid) || "")

    const isLid = rawJidLid?.endsWith("@lid");

    const jidLid = replaceNonDigits(rawJidLid);
    const jid = replaceNonDigits(rawNumber);

    const unreadMessages = message?.key?.fromMe ? 0 : 1
    const media = getMediaContent(message)
    const mediaType = getContentType(message, media)

    if (isLid) {
        if (!getLidByJid(jid)) {
            saveContact(jid, jidLid, mediaType)
        }
    }

    let file
    let txttranscribe
    if (media) {
        file = await downloadMedia(wbot, message, media, mediaType)
        if (isAudio(media.mimetype)) {
            txttranscribe = await transcribeAudioLocal(file, media)
        }
    }

    let buttonsJson, listsJson, buttonTextList;
    if (message.message?.buttonsMessage) {
        buttonsJson = JSON.stringify(message.message.buttonsMessage.buttons);
    }

    if (message.message?.listMessage) {
        listsJson = JSON.stringify(message.message.listMessage.sections);
        buttonTextList = message.message.listMessage.buttonText;
    }

    return {
        messageid: message.key.id,
        fromMe: message.key.fromMe,
        remoteJid: isLid ? jid : jidLid,
        unreadMessages,
        timestamp:
            message?.messageTimestamp?.low || message?.messageTimestamp?.high,
        content: {
            mediaType,
            file,
            txttranscribe,
            body: getBodyMessage(message),
            buttonsJson,
            lists: {listsJson, buttonTextList},
        },
    }
}

module.exports = prepareMessageData
