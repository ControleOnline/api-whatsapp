const { z } = require('../../lib/zod')

const responseMessageSchema = z.object({
    message: z.string().optional()
})

module.exports = {
    responseMessageSchema
}
