const { z } = require('zod')
const { extendZodWithOpenApi } = require('@asteasolutions/zod-to-openapi')

extendZodWithOpenApi(z)

module.exports = { z }
