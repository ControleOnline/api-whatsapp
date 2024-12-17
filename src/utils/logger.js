const { format } = require('date-fns')
const P = require('pino')

const logger = P({
  transport: {
    target: 'pino-pretty',
  },
  level: 'info',
  timestamp: () => `,"time":"${format(new Date(), 'dd/MM/yyyy HH:mm:ss')}"`,
})

module.exports = logger
