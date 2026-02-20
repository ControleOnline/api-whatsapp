const Database = require('better-sqlite3')
const NodeCache = require('node-cache')
const { existsSync, mkdirSync } = require('fs')
const { join } = require('path')
const {pathBase} = require("../../utils/folderPaths");

let dbInstance = null

const CACHE_TTL =  4 * 60 * 60 // 4h em segundos
const CACHE_CHECK_PERIOD = 1 * 60 * 60 // 1h em segundos

const store = {
    contacts: new NodeCache({
        stdTTL: CACHE_TTL,
        checkperiod: CACHE_CHECK_PERIOD,
        useClones: false
    })
}

function getDb() {
    const dbDir = join(pathBase, 'DB')
    const dbPath = join(dbDir, 'contacts.db')

    if (!existsSync(dbDir)) {
        mkdirSync(dbDir, { recursive: true })
    }

    if (!dbInstance) {
        const db = new Database(dbPath)

        db.pragma('journal_mode = WAL')
        db.pragma('synchronous = NORMAL')
        db.pragma('busy_timeout = 5000')

        db.exec(`CREATE TABLE IF NOT EXISTS contacts (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        jid TEXT NOT NULL UNIQUE,
                        lid TEXT NOT NULL,
                        mediatype TEXT NOT NULL,
                        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                     );

                     CREATE INDEX IF NOT EXISTS idx_contacts_jid ON contacts(jid);
        `)

        dbInstance = db
    }

    return dbInstance
}

function saveContact(jid, lid, mediatype) {
    if (!jid || !lid || !mediatype) return

    const db = getDb()
    const stmt = db.prepare(`INSERT INTO contacts (jid, lid, mediatype)
                             VALUES (?, ?, ?)
                             ON CONFLICT(jid) DO UPDATE SET
                             lid = excluded.lid
    `)

    stmt.run(jid, lid, mediatype)
    store.contacts.set(jid, lid)
}

function getLidByJid(jid) {
    if (!jid) return null

    const cached = store.contacts.get(jid)
    if (cached) {
        store.contacts.ttl(jid, CACHE_TTL)
        return cached
    }

    const db = getDb()

    const stmt = db.prepare(`SELECT lid FROM contacts WHERE jid = ?`)

    const row = stmt.get(jid)

    if (row) {
        store.contacts.set(jid, row.lid)
        return row.lid
    }

    return null
}

function deleteContact(jid) {
    if (!jid) return

    const db = getDb()
    db.prepare(`DELETE FROM contacts WHERE jid = ?`).run(jid)
    store.contacts.del(jid)
}

function closeDatabase() {
    if (dbInstance) {
        dbInstance.close()
        dbInstance = null
    }
}

module.exports = {
    saveContact,
    getLidByJid,
    deleteContact,
    closeDatabase
}
