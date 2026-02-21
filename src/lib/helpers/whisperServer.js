const { spawn } = require('child_process')
const path = require('path')
const {WHISPER_PORT, WHISPER_MODEL} = require("../../utils/Env.js")
const {pathBase} = require("../../utils/folderPaths");

let whisperProcess = null

function startWhisperServer() {
    if (!WHISPER_PORT || !WHISPER_MODEL)  return

    const binaryPath = path.resolve(pathBase, 'whisper.cpp/build/bin/whisper-server')
    const modelPath = path.resolve(pathBase, `whisper.cpp/models/ggml-${WHISPER_MODEL}.bin`)

    const cpu = require('os').cpus().length.toString()
    console.log(`[Whisper]: Iniciando servidor com ${cpu} threads`)

    whisperProcess = spawn(binaryPath, [
        '-m', modelPath,
        '-l', 'pt',
        '-t', cpu,
        '--port', WHISPER_PORT
    ])

    whisperProcess.stdout.on('data', (data) => {
        console.log(`[Whisper]: ${data}`)
    })

    whisperProcess.stderr.on('data', (data) => {
        const text = data.toString()
        if (text.toLowerCase().includes('error')) {
            console.error(`[Whisper REAL ERROR]: ${text}`)
        }
    })

    whisperProcess.on('close', (code) => {
        console.log(`Whisper finalizado com código ${code}`)
    })
}

function stopWhisperServer() {
    if (whisperProcess) {
        whisperProcess.kill('SIGTERM')
    }
}

module.exports = {
    startWhisperServer,
    stopWhisperServer
}
