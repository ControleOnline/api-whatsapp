const isAudio = (mime) => {
  return mime.startsWith('audio/')
}

const isImage = (mime) => {
  return mime.startsWith('image/')
}

const isVideo = (mime) => {
  return mime.startsWith('video/')
}

module.exports = { isAudio, isVideo, isImage }
