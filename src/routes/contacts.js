const express = require('express')
const ContactController = require('../controllers/ContactController.js')
const isAuth = require('../middleware/isAuth.js')
const validateData = require('../middleware/validateData.js')
const ContactSchemas = require('../schemas/Controller/contactSchemas.js')
const registry = require('../docs/registry.js')
const { z } = require('../lib/zod.js')
const {responseMessageSchema} = require("../schemas/docs/responseMessage");
const {responseContactSchema, contactSchemas} = require("../schemas/docs/responseContactSchemas");

const contactsRoutes = express.Router()

contactsRoutes.get('/:phone/list', isAuth, ContactController.list)

registry.registerPath({
    method: 'get',
    path: '/contacts/{phone}/list',
    tags: ['Contacts'],
    security: [{ bearerAuth: [] }],
    request: {
        params: z.object({
            phone: z.string().openapi({ example: '5599999999999' })
        })
    },
    responses: {
        200: {
            description: 'Lista de contatos',
            content: {
                'application/json': {
                    schema: z.array(responseContactSchema)
                }
            }
        },
        400: {
            description: 'Não foi possível obter os contatos',
            content: {
                'application/json': { schema: responseMessageSchema.openapi({ example: { message: 'Não foi possível obter os contatos' } }) }
            }
        }
    }
})

contactsRoutes.post(
  '/:phone/check',
  isAuth,
  validateData(ContactSchemas.checkContactSchema),
  ContactController.checkContact,
)

registry.registerPath({
    method: 'post',
    path: '/contacts/{phone}/check',
    tags: ['Contacts'],
    security: [{ bearerAuth: [] }],
    request: {
        params: z.object({
            phone: z.string().openapi({ example: '5599999999999' })
        }),
        body: {
            content: {
                'application/json': {
                    schema: ContactSchemas.checkContactSchema
                }
            }
        }
    },
    responses: {
        200: {
            description: 'Mensagens lidas com sucesso',
            content: {
                'application/json': { schema: contactSchemas }
            }
        },
        400: {
            description: 'Não foi possível obter o contato.' ,
            content: {
                'application/json': { schema: responseMessageSchema.openapi({ example: { message: 'Não foi possível obter o contato.' } }) }
            }
        },
    }
})
registry.register('checkContactSchema', ContactSchemas.checkContactSchema)

contactsRoutes.post(
  '/:phone/profile-picture',
  isAuth,
  validateData(ContactSchemas.getProfilePictureSchema),
  ContactController.getProfilePicture,
)

registry.registerPath({
    method: 'post',
    path: '/contacts/{phone}/profile-picture',
    tags: ['Contacts'],
    security: [{ bearerAuth: [] }],
    request: {
        params: z.object({
            phone: z.string().openapi({ example: '5599999999999' })
        }),
        body: {
            content: {
                'application/json': {
                    schema: ContactSchemas.getProfilePictureSchema
                }
            }
        }
    },
    responses: {
        200: {
            description: 'Mensagens lidas com sucesso',
            content: {
                'application/json': { schema: z.object({ picture: z.string().openapi({ example: 'https://example.com/picture.jpg' }) }) }
            }
        },
        400: {
            description: 'Não foi possível obter a foto de perfil. ' ,
            content: {
                'application/json': { schema: responseMessageSchema.openapi({ example: { message: 'Não foi possível obter a foto de perfil. ' } }) }
            }
        },
        404: {
            description: 'remoteJid invalido'  ,
            content: {
                'application/json': { schema: responseMessageSchema.openapi({ example: { message: 'remoteJid invalido'  } }) }
            }
        },
    }
})
registry.register('getProfilePictureSchema', ContactSchemas.getProfilePictureSchema)

module.exports = contactsRoutes
