const swaggerJsdoc = require('swagger-jsdoc')

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API de Gerenciamento de Mensagens',
      version: '1.0.0',
      description: 'Documentação da API para gerenciar sessões, chats, contatos e mensagens.',
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT}`,
        description: 'Servidor local',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT', // Ajuste se o formato do token for diferente
        },
      },
    },
  },
  apis: ['../routes/*.js'], 
}

const specs = swaggerJsdoc(options)

module.exports = { specs }