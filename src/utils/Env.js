const { z } = require('../lib/zod.js')
const dotenv = require('dotenv')

dotenv.config()

const ValidaNumeros = z.string().refine(
  (v) => {
    const n = Number(v)
    return !isNaN(n) && v?.length > 0
  },
  { message: 'Numero Invalido' },
)

const ValidaWaVersion = z
  .string()
  .optional()
  .transform((v) => {
    if (!v || v.trim() === '') return undefined

    const parts = v.split(',').map((p) => p.trim())

    if (parts.length !== 3) {
      throw new Error(
        'WA_VERSION deve ter 3 números separados por vírgula (ex: 2,3000,1023223821)',
      )
    }

    const version = parts.map((p) => {
      const num = Number(p)
      if (isNaN(num)) {
        throw new Error(
          `WA_VERSION contém valor inválido: "${p}". Use apenas números.`,
        )
      }
      return num
    })

    return version
  })

const parseBoolean = (value, fallback = false) => {
  if (value === undefined || value === null || value === '') return fallback
  return ['1', 'true', 'yes', 'on'].includes(String(value).toLowerCase())
}

const engineStrategySchema = z.enum(['weighted-random']).default('weighted-random')

const envSchema = z.object({
  HOST: z.string().ipv4().default('0.0.0.0'),
  PORT: ValidaNumeros,
  FROMME: z.string().transform((v) => v === '1'),
  API_KEY: z.string().min(10, 'Chave muito pequena'),
  WEBHOOK: z.string().min(10, 'Verifique o endereço do Webhook Padrão'),
  WA_VERSION: ValidaWaVersion,
  WHISPER_PORT: z.string().optional(),
  WHISPER_MODEL: z.string().optional(),
  MESSAGE_ENGINES: z.string().default('baileys=100'),
  MESSAGE_ENGINE_STRATEGY: engineStrategySchema,
  WEBJS_API_URL: z.string().url().optional(),
  WEBJS_API_KEY: z.string().optional(),
  META_API_VERSION: z.string().default('v22.0'),
  META_PHONE_NUMBER_ID: z.string().optional(),
  META_ACCESS_TOKEN: z.string().optional(),
  META_MARK_AS_READ: z
    .string()
    .optional()
    .transform((value) => parseBoolean(value, true)),
})

module.exports = envSchema.parse(process.env)
