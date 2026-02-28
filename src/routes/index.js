const { Router } = require('express')
const redoc = require('redoc-express')
const chatsRoutes = require('./chats.js')
const contactsRoutes = require('./contacts.js')
const messageRoutes = require('./messages.js')
const sessionRoutes = require('./sessions.js')
const transcribeRoutes = require('./transcribe.js')
const swaggerUi = require('swagger-ui-express')
const swaggerSpec = require('../docs/swagger.js')

const routes = Router()

routes.get('/docs-json', (req, res) => { res.json(swaggerSpec)})
routes.get('/', (req, res, next) => {
    const ui = req.query?.ui
    if (ui && ui === 'redoc') {
        return redoc({title: 'API Docs', specUrl: '/docs-json',})(req, res, next)
    }
    return swaggerUi.setup(swaggerSpec)(req, res, next)
})
routes.use('/', swaggerUi.serve)

routes.use('/sessions', sessionRoutes)
routes.use('/chats', chatsRoutes)
routes.use('/contacts', contactsRoutes)
routes.use('/messages', messageRoutes)
routes.use('/transcribe', transcribeRoutes)

module.exports = routes
