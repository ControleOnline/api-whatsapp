const test = require('node:test')
const assert = require('node:assert/strict')

const {
  deserializePayloadFromQueue,
  serializePayloadForQueue,
} = require('./rabbitmq.js')

test('preserves media buffers across queue serialization', () => {
  const originalPayload = {
    phone: '5511999999999',
    number: '5511888888888',
    content: {
      caption: 'arquivo',
      image: Buffer.from('fake-image'),
      audio: Buffer.from([1, 2, 3, 4]),
      nested: {
        document: Buffer.from('fake-doc'),
      },
      items: [Buffer.from('thumb')],
    },
  }

  const restoredPayload = deserializePayloadFromQueue(
    JSON.parse(JSON.stringify(serializePayloadForQueue(originalPayload))),
  )

  assert.deepStrictEqual(restoredPayload, originalPayload)
  assert.equal(Buffer.isBuffer(restoredPayload.content.image), true)
  assert.equal(Buffer.isBuffer(restoredPayload.content.audio), true)
  assert.equal(Buffer.isBuffer(restoredPayload.content.nested.document), true)
  assert.equal(Buffer.isBuffer(restoredPayload.content.items[0]), true)
})

test('keeps regular webhook payload data intact', () => {
  const originalPayload = {
    webhookUrl: 'https://example.com/hook',
    data: {
      action: 'receiveMessage',
      message: JSON.stringify({ text: 'hello' }),
      file: JSON.stringify({ name: 'test.txt' }),
    },
  }

  const restoredPayload = deserializePayloadFromQueue(
    JSON.parse(JSON.stringify(serializePayloadForQueue(originalPayload))),
  )

  assert.deepStrictEqual(restoredPayload, originalPayload)
})
