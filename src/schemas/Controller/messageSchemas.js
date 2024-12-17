const { z } = require('zod')

const sendTextSchema = z.object({
  number: z.string(),
  message: z.string(),
})

const file = z.object({
  name: z.string(),
  data: z.any(),
  mimetype: z.string(),
  md5: z.string(),
  size: z.number(),
})

const sendMediaSchema = z.object({
  number: z.string({ required_error: 'Obrigatório enviar um número' }),
  caption: z.string().optional(),
  file: file.or(z.array(file)),
})

module.exports = { sendTextSchema, sendMediaSchema }
