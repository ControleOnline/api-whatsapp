const env = require('../utils/Env.js')

const isAuth = (req, res, next) => {
  const authHeader = req.headers.authorization

  if (!authHeader) {
    res.status(401).json({ message: 'Não autorizado.' })
    return
  }

  const [, token] = authHeader.split(' ')

  if (token !== env.API_KEY) {
    res.status(401).json({ message: 'Não autorizado.' })
    return
  }

  next()
}

module.exports = isAuth
