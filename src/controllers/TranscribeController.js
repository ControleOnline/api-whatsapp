const logger = require('../utils/logger.js')
const {transcribeAudio} = require("../lib/helpers/transcribeAudio");
const {WHISPER_PORT, WHISPER_MODEL} = require("../utils/Env.js")

const transcribe = async (req, res) => {
    try {
        if (!req.files || !req.files.audio) {
            return res.status(400).json({
                message: 'Nenhum arquivo de áudio enviado.'
            })
        }

        if (!WHISPER_PORT || !WHISPER_MODEL) {
            return res.status(400).json({
                message: 'Servidor Whisper não iniciado.'
            })
        }

        const audio = req.files.audio

        const media = {
            name: audio.name,
            data: audio.data,
            mimetype: audio.mimetype,
            size: audio.size
        }

        const texto = await transcribeAudio(media)

        return res.status(200).json({
            transcription: texto
        })

    } catch (error) {

        logger.error(`Erro ao transcrever áudio: ${error.message}`)

        return res.status(400).json({
            message: 'Não foi possível transcrever o áudio.',
            error: error.message
        })
    }
}

module.exports = { transcribe }
