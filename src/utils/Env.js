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
        'WA_VERSION deve ter 3 numeros separados por virgula (ex: 2,3000,1023223821)',
      )
    }

    const version = parts.map((p) => {
      const num = Number(p)
      if (isNaN(num)) {
        throw new Error(
          `WA_VERSION contem valor invalido: "${p}". Use apenas numeros.`,
        )
      }
      return num
    })

    return version
  })

const ValidaBoolean = z
  .string()
  .optional()
  .default('0')
  .transform((v) => ['1', 'true'].includes(v.toLowerCase()))

const envSchema = z.object({
  HOST: z.string().ipv4().default('0.0.0.0'),
  PORT: ValidaNumeros,
  FROMME: z.string().transform((v) => v === '1'),
  API_KEY: z.string().min(10, 'Chave muito pequena'),
  WEBHOOK: z.string().min(10, 'Verifique o endereco do Webhook Padrao'),
  WA_VERSION: ValidaWaVersion,
  WHISPER_PORT: z.string().optional(),
  WHISPER_MODEL: z.string().optional(),
  RABBITMQ_ENABLED: ValidaBoolean,
  RABBITMQ_URL: z.string().optional(),
  RABBITMQ_WEBHOOK_QUEUE: z.string().optional().default('whatsapp.webhooks'),
  RABBITMQ_OUTBOUND_QUEUE: z.string().optional().default('whatsapp.outbound'),
  RABBITMQ_PREFETCH: z
    .string()
    .optional()
    .default('5')
    .transform((v) => Number(v)),
})

const env = envSchema.parse(process.env)

if (env.RABBITMQ_ENABLED && !env.RABBITMQ_URL) {
  throw new Error('RABBITMQ_URL deve ser informado quando RABBITMQ_ENABLED=1')
}

module.exports = env
