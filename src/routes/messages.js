const express = require('express')
const MessageController = require('../controllers/MessageController.js')
const isAuth = require('../middleware/isAuth.js')
const validateData = require('../middleware/validateData.js')
const MessageSchemas = require('../schemas/Controller/messageSchemas.js')
const {prepareMessageResponseSchema} = require('../schemas/docs/preparemessageSchemas.js')
const {responseMessageSchema} = require('../schemas/docs/responseMessage.js')
const registry = require('../docs/registry.js')
const { z } = require('../lib/zod.js')

const messageRoutes = express.Router()

messageRoutes.post(
  '/:phone',
  isAuth,
  validateData(MessageSchemas.sendMessageSchema),
  MessageController.sendTextMedia,
)

registry.registerPath({
    method: 'post',
    path: '/messages/{phone}',
    tags: ['Messages'],
    security: [{ bearerAuth: [] }],
    request: {
        params: z.object({
            phone: z.string().openapi({ example: '5599999999999' })
        }),
        body: {
            content: {
                'application/json': {
                    schema: MessageSchemas.sendTextSchema
                },
                'multipart/form-data': {
                    schema: MessageSchemas.sendMediaSchema
                }
            }
        }
    },
    responses: {
        200: {
            description: 'Mensagem enviada com sucesso',
            content: {
                'application/json': { schema: responseMessageSchema.openapi({ example: { message: 'Mensagem enviada com sucesso' } }) }
            }
        },
        400: {
            description: 'Erro ao enviar mensagem de mídia',
            content: {
                'application/json': { schema: responseMessageSchema.openapi({ example: { message: 'Erro ao enviar mensagem de mídia' } }) }
            }
        }
    }
})
registry.register('sendTextSchema', MessageSchemas.sendTextSchema)
registry.register('sendMediaSchema', MessageSchemas.sendMediaSchema)

messageRoutes.get('/:phone/unread', isAuth, MessageController.unreadMessages)

registry.registerPath({
    method: 'get',
    path: '/messages/{phone}/unread',
    tags: ['Messages'],
    security: [{ bearerAuth: [] }],
    request: {
        params: z.object({
            phone: z.string().openapi({ example: '5599999999999' })
        })
    },
    responses: {
        200: {
            description: 'Lista de mensagens não lidas',
            content: {
                'application/json': {
                    schema: z.array(prepareMessageResponseSchema)
                }
            }
        },
        400: {
            description: 'Erro ao obter mensagens',
            content: {
                'application/json': { schema: responseMessageSchema.openapi({ example: { message: 'Erro ao obter mensagens' } }) }
            }
        }
    }
})

module.exports = messageRoutes
