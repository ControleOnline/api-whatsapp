const { Router } = require('express')
const chatsRoutes = require('./chats.js')
const contactsRoutes = require('./contacts.js')
const messageRoutes = require('./messages.js')
const sessionRoutes = require('./sessions.js')

const routes = Router()

routes.use('/sessions', sessionRoutes)
routes.use('/chats', chatsRoutes)
routes.use('/contacts', contactsRoutes)
routes.use('/messages', messageRoutes)

module.exports = routes
