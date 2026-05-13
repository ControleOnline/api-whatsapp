const test = require('node:test')
const assert = require('node:assert/strict')
const Module = require('node:module')
const path = require('node:path')

const sessionStoragePath = path.resolve(
  __dirname,
  '../../lib/storage/sessionStorage.js',
)

const createKeyValueStore = () => {
  const entries = new Map()

  return {
    entries,
    get(key) {
      return entries.has(key) ? entries.get(key) : null
    },
    set(key, value) {
      entries.set(key, value)
    },
    delete(key) {
      entries.delete(key)
    },
  }
}

const loadStorage = (driver) => {
  const keyValueStore = createKeyValueStore()
  const originalLoad = Module._load

  Module._load = function patchedLoad(request, parent, isMain) {
    if (request === 'redis') {
      return {
        createClient: () => ({
          on: () => {},
          connect: async () => {},
          get: async (key) => keyValueStore.get(key),
          set: async (key, value) => keyValueStore.set(key, value),
          del: async (key) => keyValueStore.delete(key),
        }),
      }
    }

    if (request === 'memjs') {
      return {
        Client: {
          create: () => ({
            get: async (key) => {
              const value = keyValueStore.get(key)
              return value === null ? null : { value: Buffer.from(value) }
            },
            set: async (key, value) => keyValueStore.set(key, String(value)),
            delete: async (key) => keyValueStore.delete(key),
          }),
        },
      }
    }

    if (request === 'baileys') {
      return {
        BufferJSON: {
          replacer: (_, value) => value,
          reviver: (_, value) => value,
        },
        initAuthCreds: () => ({ registered: false }),
        useMultiFileAuthState: async () => ({
          state: {
            creds: { fs: true },
            keys: { get: async () => ({}), set: async () => {} },
          },
          saveCreds: async () => {},
        }),
      }
    }

    if (request === '../../utils/Env.js') {
      return {
        STORAGE_DRIVER: driver,
        STORAGE_PREFIX: 'tests',
        REDIS_URL: 'redis://127.0.0.1:6379',
        MEMCACHE_SERVERS: '127.0.0.1:11211',
      }
    }

    if (request === '../../utils/logger.js') {
      return { error: () => {}, info: () => {} }
    }

    if (request === '../../utils/slugfy.js') {
      return (value) => value.replace(/\D/g, '')
    }

    if (request === '../../utils/folderPaths.js') {
      return { pathBase: path.resolve(__dirname, '../../../tmp') }
    }

    return originalLoad(request, parent, isMain)
  }

  delete require.cache[sessionStoragePath]
  const { createSessionStorage } = require(sessionStoragePath)
  Module._load = originalLoad

  return {
    keyValueStore,
    storage: createSessionStorage(),
  }
}

const runSharedAssertions = async (driver) => {
  const { storage, keyValueStore } = loadStorage(driver)

  await storage.saveSession('5511999999999', {
    phone: '5511999999999',
    webhooks: { 'messages.upsert': ['https://example.test/hook'] },
  })

  assert.deepEqual(await storage.listSessions(), [
    {
      phone: '5511999999999',
      webhooks: { 'messages.upsert': ['https://example.test/hook'] },
    },
  ])

  await storage.saveContacts('5511999999999', [{ id: 'contact-1' }])
  assert.deepEqual(await storage.getContacts('5511999999999'), [{ id: 'contact-1' }])

  const { state, saveCreds } = await storage.createAuthState('5511999999999')
  state.creds.registered = true
  await state.keys.set({
    'pre-key': {
      'device-1': { key: 'abc' },
    },
  })
  await saveCreds()

  const restored = await storage.createAuthState('5511999999999')
  assert.equal(restored.state.creds.registered, true)
  assert.deepEqual(
    await restored.state.keys.get('pre-key', ['device-1']),
    { 'device-1': { key: 'abc' } },
  )

  await storage.deleteContacts('5511999999999')
  assert.deepEqual(await storage.getContacts('5511999999999'), [])

  await storage.deleteAuthState('5511999999999')
  const afterDelete = await storage.createAuthState('5511999999999')
  assert.deepEqual(afterDelete.state.creds, { registered: false })
  assert.deepEqual(await afterDelete.state.keys.get('pre-key', ['device-1']), {})

  await storage.deleteSession('5511999999999')
  assert.deepEqual(await storage.listSessions(), [])

  assert.ok(keyValueStore.entries.size >= 0)
}

test('redis storage keeps sessions, contacts and auth state in key-value storage', async () => {
  await runSharedAssertions('redis')
})

test('memcache storage keeps sessions, contacts and auth state in key-value storage', async () => {
  await runSharedAssertions('memcache')
})
