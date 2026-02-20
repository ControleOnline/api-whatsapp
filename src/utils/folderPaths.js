const { join } = require('path')

const pathBase = join(__dirname, '..', '..')
const pathPublic = join(pathBase, 'public')
const pathTmp = join(pathPublic, 'temp')

module.exports = { pathBase, pathPublic, pathTmp }
