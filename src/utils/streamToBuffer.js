const streamToBuffer = async (stream) => {
  return new Promise((resolve, reject) => {
    const buffers = []
    stream.on('data', (chunk) => {
      buffers.push(chunk)
    })
    stream.once('end', () => {
      resolve(Buffer.concat(buffers))
    })
    stream.once('error', (err) => {
      reject(err)
    })
  })
}

module.exports = streamToBuffer
