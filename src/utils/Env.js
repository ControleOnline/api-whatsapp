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

const envSchema = z.object({
  HOST: z.string().ip().default('0.0.0.0'),
  PORT: ValidaNumeros,
  FROMME: z.string().transform((v) => v === '1'),
  STORE: z.string().transform((v) => v === '1'),
  API_KEY: z.string().min(10, 'Chave muito pequena'),
  WEBHOOK: z.string().min(10, 'Verifique o endereço do Webhook Padrão'),
})

module.exports = envSchema.parse(process.env)
