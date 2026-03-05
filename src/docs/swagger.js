const { OpenApiGeneratorV3 } = require('@asteasolutions/zod-to-openapi')
const registry = require('./registry')
const {version, description} = require('../../package.json')

const generator = new OpenApiGeneratorV3(registry.definitions)

const swaggerSpec = generator.generateDocument({
    openapi: '3.0.0',
    info: {
        title: description,
        version: version,
    },
    servers: [
        { url: '/' }
    ],
    externalDocs: {
        description: 'Abrir no Redoc',
        url: '/?ui=redoc'
    },
    tags: [
        {
            name: 'Documentation',
            externalDocs: {
                description: 'Abrir no Redoc',
                url: '/?ui=redoc'
            }
        }
    ]
})

module.exports = swaggerSpec
