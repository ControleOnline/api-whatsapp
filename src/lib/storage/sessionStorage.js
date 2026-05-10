const fs = require('fs')
const { join } = require('path')
const memjs = require('memjs')
const { createClient } = require('redis')
const {
  BufferJSON,
  initAuthCreds,
  useMultiFileAuthState,
} = require('baileys')

const env = require('../../utils/Env.js')
const logger = require('../../utils/logger.js')
const slugfy = require('../../utils/slugfy.js')
const { pathBase } = require('../../utils/folderPaths.js')

const STORAGE_INDEX_KEY = 'sessions:index'
const STORAGE_AUTH_INDEX_PREFIX = 'auth:index'

const connectionsDir = join(pathBase, 'data', 'connections')
const sessionsDir = join(pathBase, 'data', 'sessions')

const serialize = (value) => JSON.stringify(value, BufferJSON.replacer)
const deserialize = (value, fallback = null) => {
  if (value === null || value === undefined || value === '') return fallback
  return JSON.parse(value, BufferJSON.reviver)
}

const ensureDir = (path) => {
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path, { recursive: true })
  }
}

class FileSystemSessionStorage {
  constructor() {
    ensureDir(connectionsDir)
    ensureDir(sessionsDir)
  }

  async listSessions() {
    const sessions = fs.readdirSync(connectionsDir)
    return sessions
      .filter((session) => session !== '.gitignore' && session.endsWith('.json'))
      .map((session) =>
        JSON.parse(fs.readFileSync(join(connectionsDir, session), 'utf8')),
      )
  }

  async getSession(phone) {
    const path = join(connectionsDir, `${phone}.json`)
    if (!fs.existsSync(path)) return null
    return JSON.parse(fs.readFileSync(path, 'utf8'))
  }

  async saveSession(phone, data) {
    fs.writeFileSync(join(connectionsDir, `${phone}.json`), JSON.stringify(data))
  }

  async deleteSession(phone) {
    fs.rmSync(join(connectionsDir, `${phone}.json`), { force: true })
  }

  async getContacts(phone) {
    const path = join(sessionsDir, `${slugfy(phone)}.json`)
    if (!fs.existsSync(path)) return []
    return JSON.parse(fs.readFileSync(path, 'utf8'))
  }

  async saveContacts(phone, contacts) {
    fs.writeFileSync(
      join(sessionsDir, `${slugfy(phone)}.json`),
      JSON.stringify(contacts),
    )
  }

  async deleteContacts(phone) {
    fs.rmSync(join(sessionsDir, `${slugfy(phone)}.json`), { force: true })
  }

  async createAuthState(phone) {
    const sessionPath = join(sessionsDir, phone)
    return useMultiFileAuthState(sessionPath)
  }

  async deleteAuthState(phone) {
    fs.rmSync(join(sessionsDir, phone), { recursive: true, force: true })
  }
}

class KeyValueSessionStorage {
  constructor(clientType) {
    this.clientType = clientType
    this.redisClient = null
    this.memcacheClient = null
  }

  get prefix() {
    return env.STORAGE_PREFIX
  }

  key(key) {
    return `${this.prefix}:${key}`
  }

  sessionKey(phone) {
    return this.key(`connections:${phone}`)
  }

  contactsKey(phone) {
    return this.key(`contacts:${slugfy(phone)}`)
  }

  authCredsKey(phone) {
    return this.key(`auth:${phone}:creds`)
  }

  authDataKey(phone, type, id) {
    return this.key(`auth:${phone}:${type}:${id}`)
  }

  authIndexKey(phone) {
    return this.key(`${STORAGE_AUTH_INDEX_PREFIX}:${phone}`)
  }

  async getRedisClient() {
    if (!this.redisClient) {
      this.redisClient = createClient({ url: env.REDIS_URL })
      this.redisClient.on('error', (error) => {
        logger.error(`Redis error: ${error.message}`)
      })
      await this.redisClient.connect()
    }

    return this.redisClient
  }

  getMemcacheClient() {
    if (!this.memcacheClient) {
      this.memcacheClient = memjs.Client.create(env.MEMCACHE_SERVERS, {
        username: env.MEMCACHE_USERNAME || undefined,
        password: env.MEMCACHE_PASSWORD || undefined,
      })
    }

    return this.memcacheClient
  }

  async getClient() {
    if (this.clientType === 'redis') return this.getRedisClient()
    return this.getMemcacheClient()
  }

  async getValue(key) {
    const client = await this.getClient()

    if (this.clientType === 'redis') {
      return client.get(key)
    }

    const result = await client.get(key)
    if (!result?.value) return null
    return result.value.toString()
  }

  async setValue(key, value) {
    const client = await this.getClient()

    if (this.clientType === 'redis') {
      await client.set(key, value)
      return
    }

    await client.set(key, value)
  }

  async deleteValue(key) {
    const client = await this.getClient()

    if (this.clientType === 'redis') {
      await client.del(key)
      return
    }

    await client.delete(key)
  }

  async getIndexEntries(key) {
    const raw = await this.getValue(key)
    return deserialize(raw, [])
  }

  async saveIndexEntries(key, entries) {
    await this.setValue(key, serialize([...new Set(entries)]))
  }

  async addToIndex(key, value) {
    const entries = await this.getIndexEntries(key)
    if (!entries.includes(value)) {
      entries.push(value)
      await this.saveIndexEntries(key, entries)
    }
  }

  async removeFromIndex(key, value) {
    const entries = await this.getIndexEntries(key)
    await this.saveIndexEntries(
      key,
      entries.filter((entry) => entry !== value),
    )
  }

  async listSessions() {
    const phones = await this.getIndexEntries(this.key(STORAGE_INDEX_KEY))
    const sessions = await Promise.all(phones.map((phone) => this.getSession(phone)))
    return sessions.filter(Boolean)
  }

  async getSession(phone) {
    return deserialize(await this.getValue(this.sessionKey(phone)))
  }

  async saveSession(phone, data) {
    await this.setValue(this.sessionKey(phone), serialize(data))
    await this.addToIndex(this.key(STORAGE_INDEX_KEY), phone)
  }

  async deleteSession(phone) {
    await this.deleteValue(this.sessionKey(phone))
    await this.removeFromIndex(this.key(STORAGE_INDEX_KEY), phone)
  }

  async getContacts(phone) {
    return deserialize(await this.getValue(this.contactsKey(phone)), [])
  }

  async saveContacts(phone, contacts) {
    await this.setValue(this.contactsKey(phone), serialize(contacts))
  }

  async deleteContacts(phone) {
    await this.deleteValue(this.contactsKey(phone))
  }

  async createAuthState(phone) {
    const credsKey = this.authCredsKey(phone)
    const authIndexKey = this.authIndexKey(phone)
    const creds = deserialize(await this.getValue(credsKey), initAuthCreds())

    const state = {
      creds,
      keys: {
        get: async (type, ids) => {
          const data = {}

          for (const id of ids) {
            const value = deserialize(
              await this.getValue(this.authDataKey(phone, type, id)),
            )

            if (value) {
              data[id] = value
            }
          }

          return data
        },
        set: async (data) => {
          const authEntries = await this.getIndexEntries(authIndexKey)

          for (const [type, values] of Object.entries(data)) {
            for (const [id, value] of Object.entries(values)) {
              const key = this.authDataKey(phone, type, id)
              const indexEntry = `${type}:${id}`

              if (value) {
                await this.setValue(key, serialize(value))
                if (!authEntries.includes(indexEntry)) authEntries.push(indexEntry)
              } else {
                await this.deleteValue(key)
                const entryIndex = authEntries.indexOf(indexEntry)
                if (entryIndex >= 0) authEntries.splice(entryIndex, 1)
              }
            }
          }

          await this.saveIndexEntries(authIndexKey, authEntries)
        },
      },
    }

    return {
      state,
      saveCreds: async () => {
        await this.setValue(credsKey, serialize(state.creds))
        await this.addToIndex(this.key(STORAGE_INDEX_KEY), phone)
      },
    }
  }

  async deleteAuthState(phone) {
    const authIndexKey = this.authIndexKey(phone)
    const authEntries = await this.getIndexEntries(authIndexKey)

    await this.deleteValue(this.authCredsKey(phone))

    for (const entry of authEntries) {
      const [type, ...rest] = entry.split(':')
      const id = rest.join(':')
      await this.deleteValue(this.authDataKey(phone, type, id))
    }

    await this.deleteValue(authIndexKey)
  }
}

const storageFactories = {
  filesystem: () => new FileSystemSessionStorage(),
  redis: () => new KeyValueSessionStorage('redis'),
  memcache: () => new KeyValueSessionStorage('memcache'),
}

let storageInstance = null

const createSessionStorage = () => {
  if (!storageInstance) {
    const factory = storageFactories[env.STORAGE_DRIVER] || storageFactories.filesystem
    storageInstance = factory()
  }

  return storageInstance
}

module.exports = {
  createSessionStorage,
}
