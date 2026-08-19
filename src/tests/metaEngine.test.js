const test = require('node:test')
const assert = require('node:assert/strict')

const {
  prepareMediaMessageContent,
} = require('../lib/helpers/prepareMediaMessageContent.js')
const {
  META_MEDIA_URL_ERROR,
  resolveMetaPayload,
} = require('../lib/engines/metaEngine')

test('resolveMetaPayload keeps text payloads compatible with Meta', () => {
  assert.deepEqual(
    resolveMetaPayload({
      number: '5511999999999',
      content: { text: 'hello world' },
    }),
    {
      messaging_product: 'whatsapp',
      to: '5511999999999',
      type: 'text',
      text: { body: 'hello world' },
    },
  )
})

test('resolveMetaPayload rejects image payloads without a public URL', () => {
  assert.throws(
    () =>
      resolveMetaPayload({
        number: '5511999999999',
        content: {
          caption: 'arquivo',
          image: Buffer.from('fake-image'),
        },
      }),
    new RegExp(META_MEDIA_URL_ERROR.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')),
  )
})

test('prepareMediaMessageContent preserves public image urls for downstream engines', async () => {
  const content = await prepareMediaMessageContent({
    media: {
      name: 'image.png',
      data: Buffer.from('fake-image'),
    },
    body: 'arquivo',
    publicUrls: {
      imageUrl: 'https://example.com/image.png',
    },
  })

  assert.equal(content.caption, 'arquivo')
  assert.equal(content.imageUrl, 'https://example.com/image.png')
  assert.ok(Buffer.isBuffer(content.image))
})

test('resolveMetaPayload maps image payloads when the public URL is available', () => {
  assert.deepEqual(
    resolveMetaPayload({
      number: '5511999999999',
      content: {
        caption: 'arquivo',
        image: Buffer.from('fake-image'),
        imageUrl: 'https://example.com/image.png',
      },
    }),
    {
      messaging_product: 'whatsapp',
      to: '5511999999999',
      type: 'image',
      image: {
        caption: 'arquivo',
        link: 'https://example.com/image.png',
      },
    },
  )
})
