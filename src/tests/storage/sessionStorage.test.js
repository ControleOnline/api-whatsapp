const { describe, it, before, after } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('fs')
const path = require('path')
const os = require('os')
const Module = require('module')

const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'api-whatsapp-storage-'))

const originalLoad = Module._load
const sessionStoragePath = require.resolve('../../lib/storage/sessionStorage.js')

function loadStorage(driver = 'filesystem') {
  Module._load = function (request, parent, isMain) {
    if (request === 'baileys') {
      return {
        BufferJSON: {
          replacer: (_, value) => value,
          reviver: (_, value) => value,
        },
        initAuthCreds: () => ({ registered: false }),
        useMultiFileAuthState: async (sessionPath) => {
          fs.mkdirSync(sessionPath, { recursive: true })
          const credsPath = path.join(sessionPath, 'creds.json')
          let creds = { registered: false }
          if (fs.existsSync(credsPath)) {
            creds = JSON.parse(fs.readFileSync(credsPath, 'utf8'))
          }
          return {
            state: {
              creds,
              keys: {
                get: async () => ({}),
                set: async () => {},
              },
            },
            saveCreds: async () => {
              fs.writeFileSync(credsPath, JSON.stringify(creds))
            },
          }
        },
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
      return (value) => String(value).replace(/\D/g, '')
    }

    if (request === '../../utils/folderPaths.js') {
      return { pathBase: tmpRoot }
    }

    return originalLoad(request, parent, isMain)
  }

  delete require.cache[sessionStoragePath]
  const mod = require(sessionStoragePath)
  if (mod._resetSessionStorageForTests) mod._resetSessionStorageForTests()
  Module._load = originalLoad

  return mod.createSessionStorage()
}

describe('sessionStorage filesystem', () => {
  let storage

  before(() => {
    storage = loadStorage('filesystem')
  })

  after(() => {
    fs.rmSync(tmpRoot, { recursive: true, force: true })
  })

  it('saves, lists and deletes session metadata', async () => {
    await storage.saveSession('5511999999999', {
      phone: '5511999999999',
      webhooks: { 'messages.upsert': ['https://example.test/hook'] },
    })

    const listed = await storage.listSessions()
    assert.equal(listed.length, 1)
    assert.equal(listed[0].phone, '5511999999999')
    assert.deepEqual(listed[0].webhooks, {
      'messages.upsert': ['https://example.test/hook'],
    })

    const one = await storage.getSession('5511999999999')
    assert.equal(one.phone, '5511999999999')

    await storage.deleteSession('5511999999999')
    assert.equal(await storage.getSession('5511999999999'), null)
    assert.deepEqual(await storage.listSessions(), [])
  })

  it('saves and deletes contacts snapshot', async () => {
    await storage.saveContacts('5511999999999', [{ id: 'contact-1' }])
    assert.deepEqual(await storage.getContacts('5511999999999'), [
      { id: 'contact-1' },
    ])
    await storage.deleteContacts('5511999999999')
    assert.deepEqual(await storage.getContacts('5511999999999'), [])
  })

  it('creates auth state via multi-file backend', async () => {
    const { state, saveCreds } = await storage.createAuthState('5511888888888')
    assert.equal(state.creds.registered, false)
    state.creds.registered = true
    await saveCreds()

    const restored = await storage.createAuthState('5511888888888')
    assert.equal(restored.state.creds.registered, true)

    await storage.deleteAuthState('5511888888888')
  })
})
