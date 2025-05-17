const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg')
const { exec } = require('child_process')
const { readFileSync, unlinkSync, writeFile } = require('fs')
const mime = require('mime')
const { promisify } = require('util')

const { pathTmp } = require('../../utils/folderPaths.js')
const { isAudio, isImage, isVideo } = require('../../utils/getMimeFormat.js')

const processAudio = async (audio) => {
  const outputAudio = `${pathTmp}/${new Date().getTime()}.opus`
  return new Promise((resolve, reject) => {
    exec(
      `${ffmpegInstaller.path} -i ${audio} -vn -c:a libopus -b:a 32k -vbr on -compression_level 10 -frame_duration 60 -application voip -map_metadata 0 ${outputAudio}`,
      async (error) => {
        if (error) reject(error)
        resolve(outputAudio)
      },
    )
  })
}

const prepareMediaMessageContent = async ({ media, body }) => {
  const writeFileAsync = promisify(writeFile)
  let mediaRequest
  const mimetype = mime.lookup(media.name)

  const audioRecordingFromMe = media.name.includes('audio-recording')
  if (audioRecordingFromMe) media.name.replace('audio-recording-', '')

  if (isImage(mimetype)) {
    mediaRequest = {
      message: body,
      image: media.data,
    }
  } else if (isVideo(mimetype)) {
    mediaRequest = {
      message: body,
      video: media.data,
    }
  } else if (isAudio(mimetype)) {
    const pathAudio = `${pathTmp}/${media.name}`
    await writeFileAsync(pathAudio, media.data)

    if (audioRecordingFromMe) {
      const convert = await processAudio(pathAudio)
      mediaRequest = {
        message: body,
        audio: readFileSync(convert),
        mimetype: 'audio/mp4',
        ptt: true,
      }
      unlinkSync(convert)
    } else {
      mediaRequest = {
        message: body,
        audio: media.data,
        mimetype,
      }
    }
  } else {
    mediaRequest = {
      message: body,
      document: media.data,
      mimetype,
      fileName: media.name,
    }
  }

  return mediaRequest
}

module.exports = { prepareMediaMessageContent, processAudio }
