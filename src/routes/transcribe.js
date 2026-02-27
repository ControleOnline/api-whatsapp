const express = require('express')
const TranscribeController = require('../controllers/TranscribeController.js')
const isAuth = require('../middleware/isAuth.js')
const validateData = require('../middleware/validateData.js')
const TranscribeSchemas = require('../schemas/Controller/transcribeSchemas.js')

const transcribeRoutes = express.Router()

transcribeRoutes.post(
    '/',
    isAuth,
    validateData(TranscribeSchemas.transcribeSchema),
    TranscribeController.transcribe,
)

module.exports = transcribeRoutes
