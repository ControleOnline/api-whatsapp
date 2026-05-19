const pickWeightedEngine = (engines, random = Math.random) => {
  const totalWeight = engines.reduce((sum, engine) => sum + engine.weight, 0)
  const target = random() * totalWeight

  let cursor = 0
  for (const engine of engines) {
    cursor += engine.weight
    if (target < cursor) return engine
  }

  return engines[engines.length - 1]
}

module.exports = { pickWeightedEngine }
