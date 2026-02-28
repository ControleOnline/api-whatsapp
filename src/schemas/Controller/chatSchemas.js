const { z } = require('../../lib/zod.js')

const readMessagesSchema = z.array(
  z.object({
    remoteJid: z.string(),
    messageid: z.string(),
  }),
)

module.exports = {readMessagesSchema}
