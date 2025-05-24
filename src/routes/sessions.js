const { Router } = require('express')
const SessionController = require('../controllers/SessionController.js')
const isAuth = require('../middleware/isAuth.js')
const validateData = require('../middleware/validateData.js')
const SessionSchemas = require('../schemas/Controller/sessionSchemas.js')

const sessionRoutes = Router()

sessionRoutes.get('/', isAuth, SessionController.index)
sessionRoutes.post(
  '/start',
  isAuth,
  validateData(SessionSchemas.createSessionSchema),
  SessionController.store,
)
sessionRoutes.post(
  '/add-webhook',
  isAuth,
  validateData(SessionSchemas.addWebhookSchema),
  SessionController.addWebhook,
)
sessionRoutes.delete(
  '/remove',
  isAuth,
  validateData(SessionSchemas.deleteSessionSchema),
  SessionController.remove,
)

module.exports = sessionRoutes
