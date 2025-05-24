const { z } = require("zod");

const createSessionSchema = z.object({
  phone: z
    .string()
    .min(12, "Minimo de 12 digitos para o phone")
    .max(13, "Maximo de 13 digitos o phone"),
  webhooks: z
    .object({
      webhook: z.string().url().optional(),
    })
    .optional(),
});

const deleteSessionSchema = z.object({
  phone: z
    .string()
    .min(12, "Minimo de 12 digitos para o phone")
    .max(13, "Maximo de 13 digitos o phone"),
});

const addWebhookSchema = z.object({
  phone: z
    .string()
    .min(12, "Minimo de 12 digitos para o phone")
    .max(13, "Maximo de 13 digitos o phone"),
  webhooks: z.string().url(),
  type: z.string(),
});

module.exports = { createSessionSchema, deleteSessionSchema, addWebhookSchema };
