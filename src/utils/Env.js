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

const storageDriverSchema = z.enum(['filesystem', 'redis', 'memcache']).default('filesystem')

const envSchema = z
  .object({
    HOST: z.string().ipv4().default('0.0.0.0'),
    PORT: ValidaNumeros,
    FROMME: z.string().transform((v) => v === '1'),
    API_KEY: z.string().min(10, 'Chave muito pequena'),
    WEBHOOK: z.string().min(10, 'Verifique o endereço do Webhook Padrão'),
    WA_VERSION: ValidaWaVersion,
    WHISPER_PORT: z.string().optional(),
    WHISPER_MODEL: z.string().optional(),
    STORAGE_DRIVER: storageDriverSchema,
    STORAGE_PREFIX: z.string().default('api-whatsapp'),
    REDIS_URL: z.string().optional(),
    MEMCACHE_SERVERS: z.string().optional(),
    MEMCACHE_USERNAME: z.string().optional(),
    MEMCACHE_PASSWORD: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.STORAGE_DRIVER === 'redis' && !data.REDIS_URL) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['REDIS_URL'],
        message: 'REDIS_URL é obrigatório quando STORAGE_DRIVER=redis',
      })
    }

    if (data.STORAGE_DRIVER === 'memcache' && !data.MEMCACHE_SERVERS) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['MEMCACHE_SERVERS'],
        message: 'MEMCACHE_SERVERS é obrigatório quando STORAGE_DRIVER=memcache',
      })
    }
  })

module.exports = envSchema.parse(process.env)
