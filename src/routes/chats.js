const express = require('express')
const readMessages = require('../controllers/ChatController.js')
const isAuth = require('../middleware/isAuth.js')
const validateData = require('../middleware/validateData.js')
const ChatSchemas = require('../schemas/Controller/chatSchemas.js')

const chatsRoutes = express.Router()

chatsRoutes.post(
  '/:phone/read',
  isAuth,
  validateData(ChatSchemas.readMessagesSchema),
  readMessages,
)

module.exports = chatsRoutes
