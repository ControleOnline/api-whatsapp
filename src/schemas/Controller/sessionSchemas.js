const { z } = require('zod')

const createSessionSchema = z.object({
  telefone: z
    .string()
    .min(12, 'Minimo de 12 digitos para o telefone')
    .max(13, 'Maximo de 13 digitos o telefone'),
  webhooks: z
    .object({
      'connection.update': z.string().url().optional(),
      'messages.upsert': z.string().url().optional(),
      'messages.update': z.string().url().optional(),
      'messaging-history.set': z.string().url().optional(),
    })
    .optional(),
})

const deleteSessionSchema = z.object({
  telefone: z
    .string()
    .min(12, 'Minimo de 12 digitos para o telefone')
    .max(13, 'Maximo de 13 digitos o telefone'),
})

const addWebhookSchema = z.object({
  telefone: z
    .string()
    .min(12, 'Minimo de 12 digitos para o telefone')
    .max(13, 'Maximo de 13 digitos o telefone'),
  webhooks: z.string().url(),
  type: z.string(),
})

module.exports = { createSessionSchema, deleteSessionSchema, addWebhookSchema }
