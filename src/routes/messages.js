const express = require('express')
const MessageController = require('../controllers/MessageController.js')
const isAuth = require('../middleware/isAuth.js')
const validateData = require('../middleware/validateData.js')
const MessageSchemas = require('../schemas/Controller/messageSchemas.js')

const messageRoutes = express.Router()

messageRoutes.post(
  '/:phone',
  isAuth,
  validateData(MessageSchemas.sendMessageSchema),
  MessageController.sendTextMedia,
)

messageRoutes.get('/:phone/unread', isAuth, MessageController.unreadMessages)

module.exports = messageRoutes
