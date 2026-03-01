const { Router } = require('express')
const SessionController = require('../controllers/SessionController.js')
const isAuth = require('../middleware/isAuth.js')
const validateData = require('../middleware/validateData.js')
const SessionSchemas = require('../schemas/Controller/sessionSchemas.js')
const registry = require('../docs/registry.js')
const { z } = require('../lib/zod.js')
const {responseContactSchema} = require("../schemas/docs/responseContactSchemas");
const {responseMessageSchema} = require("../schemas/docs/responseMessage");

const sessionRoutes = Router()

sessionRoutes.get('/', isAuth, SessionController.index)

registry.registerPath({
    method: 'get',
    path: '/session',
    tags: ['Session'],
    security: [{ bearerAuth: [] }],
    responses: {
        200: {
            description: 'Lista de sessões',
            content: {
                'application/json': {
                    schema: z.array(z.object({
                        phone: z.string(),
                    })).openapi({ example: [{ phone: '5599999999999' }] })
                }
            }
        }
    }
})
registry.register('sessionIndexSchema', z.array(z.object({
    phone: z.string(),
})))

sessionRoutes.post(
  '/start',
  isAuth,
  validateData(SessionSchemas.createSessionSchema),
  SessionController.store,
)

registry.registerPath({
    method: "post",
    path: '/session/start',
    tags: ['Session'],
    security: [{ bearerAuth: [] }],
    request:{
      body:{
          content:{
              'application/json':{
                  schema: SessionSchemas.createSessionSchema
              }
          }
      }
    },
    responses: {
        200: {
            description: 'Retornado sessão com sucesso',
            content: {
                'application/json': {
                    schema: z.object({
                        status: z.int(),
                        qr: z.string(),
                    }).openapi({ example: { status: 1, qr: 'codigo qrcode' } })
                }
            }
        },
        201: {
            description: 'Sessão criada com sucesso',
            content: {
                'application/json': {
                    schema: z.object({
                        message: z.string(),
                        qr: z.string(),
                    }).openapi({ example: { message: 'Sessão criada com sucesso', qr: 'codigo qrcode' } })
                }
            }
        }
    }
})
registry.register('createSessionSchema', SessionSchemas.createSessionSchema)
registry.register('createSessionResponseSchema', z.object({
    message: z.string(),
    qr: z.string(),
}))

sessionRoutes.post(
  '/add-webhook',
  isAuth,
  validateData(SessionSchemas.addWebhookSchema),
  SessionController.addWebhook,
)

registry.registerPath({
    method: "post",
    path: '/session/add-webhook',
    tags: ['Session'],
    security: [{ bearerAuth: [] }],
    request:{
        body:{
            content:{
                'application/json':{
                    schema: SessionSchemas.addWebhookSchema
                }
            }
        }
    },
    responses: {
        200: {
            description: 'Webhook adicionado com sucesso',
            content: {
                'application/json': { schema: responseMessageSchema.openapi({ example: { message: 'Webhook adicionado com sucesso' } }) }
            }
        },
    }
})
registry.register('addWebhookSchema', SessionSchemas.addWebhookSchema)


sessionRoutes.delete(
  '/remove',
  isAuth,
  validateData(SessionSchemas.deleteSessionSchema),
  SessionController.remove,
)

registry.registerPath({
    method: "delete",
    path: '/session/remove',
    tags: ['Session'],
    security: [{ bearerAuth: [] }],
    request:{
        body:{
            content:{
                'application/json':{
                    schema: SessionSchemas.deleteSessionSchema
                }
            }
        }
    },
    responses: {
        200: {
            description: 'Sessão excluída com sucesso',
            content: {
                'application/json': { schema: responseMessageSchema.openapi({ example: { message: 'Sessão excluída com sucesso'} }) }
            }
        },
    }
})
registry.register('deleteSessionSchema', SessionSchemas.deleteSessionSchema)

module.exports = sessionRoutes
