const { spawn } = require('child_process')
const path = require('path')
const os = require('os')
const { WHISPER_PORT, WHISPER_MODEL } = require('../../utils/Env.js')
const { pathBase } = require('../../utils/folderPaths')

let whisperProcess = null

function startWhisperServer() {
  if (!WHISPER_PORT || !WHISPER_MODEL) return
  if (whisperProcess) return

  const binaryPath = path.resolve(pathBase, 'whisper.cpp/build/bin/whisper-server')
  const modelPath = path.resolve(pathBase, `whisper.cpp/models/ggml-${WHISPER_MODEL}.bin`)
  const cpu = os.cpus().length.toString()

  console.log(`[Whisper]: Iniciando servidor com ${cpu} threads`)

  whisperProcess = spawn(binaryPath, [
    '-m', modelPath,
    '-l', 'pt',
    '-t', cpu,
    '--host', '127.0.0.1',
    '--port', WHISPER_PORT
  ], {
    stdio: ['ignore', 'pipe', 'pipe']
  })

  whisperProcess.stdout.on('data', (data) => {
    console.log(`[Whisper]: ${data.toString().trim()}`)
  })

  whisperProcess.stderr.on('data', (data) => {
    const text = data.toString()
    console.error(`[Whisper STDERR]: ${text.trim()}`)
  })

  whisperProcess.on('error', (err) => {
    console.error(`[Whisper ERROR]: ${err.message}`)
    whisperProcess = null
  })

  whisperProcess.on('close', (code) => {
    console.log(`[Whisper]: Finalizado com código ${code}`)
    whisperProcess = null
  })
}

function stopWhisperServer() {
  if (!whisperProcess) return

  whisperProcess.kill('SIGTERM')

  setTimeout(() => {
    if (whisperProcess) {
      whisperProcess.kill('SIGKILL')
      whisperProcess = null
    }
  }, 5000)
}

module.exports = {
  startWhisperServer,
  stopWhisperServer
}