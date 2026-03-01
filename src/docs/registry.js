const { OpenAPIRegistry } = require('@asteasolutions/zod-to-openapi')

const registry = new OpenAPIRegistry()

registry.registerComponent('securitySchemes', 'bearerAuth', {
    type: 'http',
    scheme: 'bearer',
    bearerFormat: 'JWT',
})

module.exports = registry
