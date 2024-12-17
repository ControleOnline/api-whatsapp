const { z } = require('zod')

const readMessagesSchema = z.array(
  z.object({
    remoteJid: z.string(),
    messageid: z.string(),
  }),
)

module.exports = readMessagesSchema
