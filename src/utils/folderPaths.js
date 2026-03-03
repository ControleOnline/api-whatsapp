const { join } = require('path')

const pathBase = join(__dirname, '..', '..')
const pathData = join(pathBase, 'data')
const pathTmp = join(pathData, 'temp')

module.exports = { pathBase, pathData, pathTmp }
