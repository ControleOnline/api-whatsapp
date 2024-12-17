const { z } = require('zod')

const checkContactSchema = z.object({
  number: z.string(),
})

const getProfilePictureSchema = z.object({
  number: z.string(),
})

module.exports = { checkContactSchema, getProfilePictureSchema }
