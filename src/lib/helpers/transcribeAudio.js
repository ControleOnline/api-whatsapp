const axios = require('axios')
const {WHISPER_PORT} = require("../../utils/Env.js")
const mime = require('mime')
const { isAudio } = require('../../utils/getMimeFormat.js')
const FormData = require('form-data')
const { exec } = require('child_process')
const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg')
const {pathTmp} = require("../../utils/folderPaths");
const {writeFileSync, readFileSync, unlinkSync, existsSync} = require("fs");
const {join} = require("path")

const convertToWav16k = async (inputPath) => {
    const outputPath = `${pathTmp}/${Date.now()}_converted.wav`

    return new Promise((resolve, reject) => {
        exec(
            `${ffmpegInstaller.path} -i "${inputPath}" -ac 1 -ar 16000 -vn "${outputPath}"`,
            (error) => {
                if (error) return reject(error)
                resolve(outputPath)
            }
        )
    })
}

const transcribeAudioLocal = async (file, media) => {
    let txttranscribe = ''

    const pathFile = join(pathTmp, Date.now().toString() + "." + media.mimetype.split('/')[1].split(';')[0])
    let audioConvert = ''

    try {
        writeFileSync(pathFile, file)

        audioConvert = await convertToWav16k(pathFile)
        if (audioConvert) {
            unlinkSync(pathFile)

            const buffer = readFileSync(audioConvert)

            txttranscribe = await transcribeAudio({
                name: 'audio.wav',
                data: buffer
            })

            unlinkSync(audioConvert)
        }
    }
    finally {
        if (pathFile && existsSync(pathFile)) unlinkSync(pathFile)
        if (audioConvert && existsSync(audioConvert)) unlinkSync(audioConvert)
    }

    return txttranscribe
}

const transcribeAudio = async (media) => {

    const mimetype = mime.lookup(media.name)

    if (!isAudio(mimetype)) {
        throw new Error('Arquivo não é áudio válido')
    }

    try {

        const form = new FormData()

        form.append('file', media?.data, {
            filename: media?.name || 'audio.mp3',
            contentType: mimetype
        })

        const response = await axios.post(
            `http://localhost:${WHISPER_PORT}/inference`,
            form,
            {
                headers: form.getHeaders(),
                maxBodyLength: Infinity
            }
        )

        return response?.data?.text.trim()

    } catch (error) {
        throw error
    }
}

module.exports = { transcribeAudio, transcribeAudioLocal }
