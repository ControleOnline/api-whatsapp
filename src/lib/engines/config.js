const SUPPORTED_ENGINES = ['baileys', 'webjs', 'meta']

const normalizeEngineName = (value) => String(value || '').trim().toLowerCase()

const parseMessageEngines = (rawValue) => {
  const source = String(rawValue || '').trim()
  if (!source) {
    return [{ name: 'baileys', weight: 100 }]
  }

  const entries = source
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => {
      const [rawName, rawWeight = '100'] = item.split('=')
      const name = normalizeEngineName(rawName)
      const weight = Number(rawWeight)

      if (!SUPPORTED_ENGINES.includes(name)) {
        throw new Error(`Engine não suportada em MESSAGE_ENGINES: ${rawName}`)
      }

      if (!Number.isFinite(weight) || weight <= 0) {
        throw new Error(`Peso inválido para a engine ${name}: ${rawWeight}`)
      }

      return { name, weight }
    })

  if (!entries.length) {
    throw new Error('MESSAGE_ENGINES precisa ter ao menos uma engine válida')
  }

  return entries
}

module.exports = {
  SUPPORTED_ENGINES,
  parseMessageEngines,
}
