const express = require('express')
const MessageController = require('../controllers/MessageController.js')
const isAuth = require('../middleware/isAuth.js')
const validateData = require('../middleware/validateData.js')
const MessageSchemas = require('../schemas/Controller/messageSchemas.js')

const messageRoutes = express.Router()

messageRoutes.post(
  '/:phone/text',
  isAuth,
  validateData(MessageSchemas.sendTextSchema),
  MessageController.sendText,
)
messageRoutes.post(
  '/:phone/media',
  isAuth,
  validateData(MessageSchemas.sendMediaSchema),
  MessageController.sendMedia,
)

messageRoutes.get('/:phone/unread', isAuth, MessageController.unreadMessages)

module.exports = messageRoutes
