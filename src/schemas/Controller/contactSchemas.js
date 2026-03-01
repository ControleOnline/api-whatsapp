const { z } = require('../../lib/zod.js')

const checkContactSchema = z.object({
  number: z.string(),
})

const getProfilePictureSchema = z.object({
  number: z.string(),
})

module.exports = { checkContactSchema, getProfilePictureSchema }
