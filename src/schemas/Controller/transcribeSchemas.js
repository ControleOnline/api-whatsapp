const { z } = require('../../lib/zod.js')

const MAX_AUDIO_SIZE = 10 * 1024 * 1024 // 10MB

const audioFileSchema = z.object({
    name: z.string({
        required_error: 'Nome do arquivo é obrigatório'
    }),

    data: z.any().refine(
        (val) => Buffer.isBuffer(val),
        { message: 'Arquivo inválido (buffer esperado)' }
    ),

    mimetype: z.string({
        required_error: 'Mimetype é obrigatório'
    }).refine(
        (val) => val.startsWith('audio/'),
        { message: 'Arquivo deve ser do tipo áudio' }
    ),

    size: z.number().max(
        MAX_AUDIO_SIZE,
        `Áudio deve ter no máximo ${MAX_AUDIO_SIZE / 1024 / 1024}MB`
    )
})

const transcribeSchema = z.object({
    audio: audioFileSchema
})

module.exports = { transcribeSchema }
