const { z } = require('../../lib/zod')

const messageContentSchema = z.object({
    mediaType: z.string().nullable().openapi({
        example: 'image'
    }),
    file: z.object({
        filename: z.string(),
        mimetype: z.string(),
        size: z.number()
    }).nullable().openapi({
        example: {
            filename: 'image.jpg',
            mimetype: 'image/jpeg',
            data: 'Buffer <data>',
            size: 1024
        }
    }),
    txttranscribe: z.string().nullable().openapi({
        example: 'Texto transcrito do áudio'
    }),
    body: z.string().nullable().openapi({
        example: 'Olá, tudo bem?'
    }),
    buttonsJson: z.string().nullable().openapi({
        example: '[{"buttonId":"1","buttonText":{"displayText":"Sim"}}]'
    }),
    lists: z.object({
        listsJson: z.string().nullable(),
        buttonTextList: z.string().nullable()
    }).nullable()
})

const prepareMessageResponseSchema = z.object({
    messageid: z.string().openapi({ example: '3EB0123456789' }),

    fromMe: z.boolean().openapi({ example: false }),

    remoteJid: z.string().openapi({
        example: '5599999999999'
    }),

    unreadMessages: z.number().openapi({
        example: 1
    }),

    timestamp: z.number().openapi({
        example: 1710000000
    }),

    content: messageContentSchema
}).openapi('PrepareMessageResponse')

module.exports = {
    prepareMessageResponseSchema
}
