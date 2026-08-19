const { z } = require('../../lib/zod')

const responseMessageSchema = z.object({
  message: z.string().optional(),
  engine: z.enum(['baileys', 'webjs', 'meta']).optional(),
  providerMessageId: z.string().nullable().optional(),
})

module.exports = {
  responseMessageSchema,
}
