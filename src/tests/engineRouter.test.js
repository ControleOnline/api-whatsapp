const test = require('node:test')
const assert = require('node:assert/strict')

const { parseMessageEngines } = require('../lib/engines/config')
const { pickWeightedEngine } = require('../lib/engines/selectEngine')

test('parseMessageEngines mantém engine única como fallback padrão', () => {
  assert.deepEqual(parseMessageEngines('baileys=100'), [
    { name: 'baileys', weight: 100 },
  ])
})

test('parseMessageEngines aceita múltiplas engines com pesos', () => {
  assert.deepEqual(parseMessageEngines('baileys=70,meta=20,webjs=10'), [
    { name: 'baileys', weight: 70 },
    { name: 'meta', weight: 20 },
    { name: 'webjs', weight: 10 },
  ])
})

test('parseMessageEngines rejeita engine desconhecida', () => {
  assert.throws(
    () => parseMessageEngines('unknown=100'),
    /Engine não suportada/,
  )
})

test('pickWeightedEngine respeita o peso acumulado', () => {
  const engines = parseMessageEngines('baileys=70,meta=20,webjs=10')
  assert.equal(pickWeightedEngine(engines, () => 0.05).name, 'baileys')
  assert.equal(pickWeightedEngine(engines, () => 0.75).name, 'meta')
  assert.equal(pickWeightedEngine(engines, () => 0.95).name, 'webjs')
})
