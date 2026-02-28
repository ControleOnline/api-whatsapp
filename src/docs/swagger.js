const { OpenApiGeneratorV3 } = require('@asteasolutions/zod-to-openapi')
const registry = require('./registry')
const {PORT} = require('../utils/Env')
const {version, description} = require('../../package.json')

const generator = new OpenApiGeneratorV3(registry.definitions)

const swaggerSpec = generator.generateDocument({
    openapi: '3.0.0',
    info: {
        title: description,
        version: version,
    },
    servers: [
        { url: `http://localhost:${PORT}` }
    ]
})

module.exports = swaggerSpec
