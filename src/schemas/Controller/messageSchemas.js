const { z } = require('../../lib/zod.js')

const fileSchema = z.object({
  name: z.string(),
  data: z.any(),
  mimetype: z.string(),
  md5: z.string(),
  size: z.number(),
})

const publicMediaUrlFields = {
  imageUrl: z.string().url().optional(),
  videoUrl: z.string().url().optional(),
  audioUrl: z.string().url().optional(),
  documentUrl: z.string().url().optional(),
}

const sendMediaSchema = z.object({
  number: z.string(),
  file: fileSchema,
  message: z.string().optional(),
  ...publicMediaUrlFields,
})

const sendTextSchema = z.object({
  number: z.string(),
  message: z.string().min(1),
})

const sendMessageSchema = z.union([sendTextSchema, sendMediaSchema])

module.exports = { sendMessageSchema, sendTextSchema, sendMediaSchema }
