const { z } = require('zod')
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

const envSchema = z.object({
  HOST: z.string().ip().default('0.0.0.0'),
  PORT: ValidaNumeros,
  FROMME: z.string().transform((v) => v === '1'),
  STORE: z.string().transform((v) => v === '1'),
  API_KEY: z.string().min(10, 'Chave muito pequena'),
  WEBHOOK: z.string().min(10, 'Verifique o endereço do Webhook Padrão'),
  WA_VERSION: ValidaWaVersion,
})

module.exports = envSchema.parse(process.env)
