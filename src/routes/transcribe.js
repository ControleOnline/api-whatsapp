const express = require('express')
const TranscribeController = require('../controllers/TranscribeController.js')
const isAuth = require('../middleware/isAuth.js')
const validateData = require('../middleware/validateData.js')
const TranscribeSchemas = require('../schemas/Controller/transcribeSchemas.js')
const registry = require("../docs/registry");
const {responseMessageSchema} = require("../schemas/docs/responseMessage");
const {z} = require("../lib/zod.js")

const transcribeRoutes = express.Router()

transcribeRoutes.post(
    '/',
    isAuth,
    validateData(TranscribeSchemas.transcribeSchema),
    TranscribeController.transcribe,
)

registry.registerPath({
    method: "post",
    path: '/transcribe',
    tags: ['Transcribe'],
    security: [{ bearerAuth: [] }],
    request:{
        body:{
            content:{
                'multipart/form-data': {
                    schema: TranscribeSchemas.transcribeSchema
                }
            }
        }
    },
    responses: {
        200: {
            description: 'Transcrição realizada com sucesso',
            content: {
                'application/json': { schema: z.object({ transcription: z.string() }).openapi({ example: { transcription: ' um dois tres testando' } }) }
            }
        },
        404: {
            description: 'Arquivo de áudio não encontrado',
            content: {
                'application/json': { schema: responseMessageSchema.openapi({ example: { message: 'Arquivo de áudio não encontrado' } }) }
            }
        },
        500: {
            description: 'Servidor Whisper não iniciado',
            content: {
                'application/json': { schema: responseMessageSchema.openapi({ example: { message: 'Servidor Whisper não iniciado' } }) }
            }
        },
        501: {
            description: 'Não foi possível transcrever o áudio',
            content: {
                'application/json': { schema: responseMessageSchema.openapi({ example: { message: 'Não foi possível transcrever o áudio' } }) }
            }
        }
    }
})
registry.register('transcribeSchema', TranscribeSchemas.transcribeSchema)

module.exports = transcribeRoutes
