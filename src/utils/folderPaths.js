const { join } = require('path')

const pathPublic = join(__dirname, '..', '..', 'public')
const pathTmp = join(pathPublic, 'temp')

module.exports = { pathPublic, pathTmp }
