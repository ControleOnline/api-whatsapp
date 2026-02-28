const {z} = require("../../lib/zod")

const responseContactSchema = z.object({
    number: z.string().openapi({ example: '5599999999999' }),
    name: z.string().openapi({ example: 'Nome do contato' })
})

const contactSchemas = z.object({
    number: z.string().openapi({ example: '5599999999999' }),
    valid: z.boolean().openapi({ example: true })
})

module.exports = {
    responseContactSchema,
    contactSchemas
}
