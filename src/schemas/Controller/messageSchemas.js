const { z } = require('zod')

const fileSchema = z.object({
  name: z.string(),
  data: z.any(),
  mimetype: z.string(),
  md5: z.string(),
  size: z.number(),
})

const sendMessageSchema = z.union([
  z.object({
    number: z.string(),
    message: z.string().min(1),
    file: fileSchema.optional(),
  }),
  z.object({
    number: z.string(),
    file: fileSchema,
    message: z.string().optional(),
  }),
])

module.exports = { sendMessageSchema }
