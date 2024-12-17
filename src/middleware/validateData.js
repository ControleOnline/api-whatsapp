const { ZodError } = require('zod')

const validateData = (schema) => {
  return (req, res, next) => {
    try {
      schema.parse({ ...req.body, ...req.files })
      next()
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: error.errors })
      } else {
        res.status(400).json({ message: 'Dados inválidos' })
      }
    }
  }
}

module.exports = validateData
