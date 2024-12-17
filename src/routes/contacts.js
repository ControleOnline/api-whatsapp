const express = require('express')
const ContactController = require('../controllers/ContactController.js')
const isAuth = require('../middleware/isAuth.js')
const validateData = require('../middleware/validateData.js')
const ContactSchemas = require('../schemas/Controller/contactSchemas.js')

const contactsRoutes = express.Router()

contactsRoutes.get('/:telefone/list', isAuth, ContactController.list)
contactsRoutes.post(
  '/:telefone/check',
  isAuth,
  validateData(ContactSchemas.checkContactSchema),
  ContactController.checkContact,
)

contactsRoutes.post(
  '/:telefone/profile-picture',
  isAuth,
  validateData(ContactSchemas.getProfilePictureSchema),
  ContactController.getProfilePicture,
)

module.exports = contactsRoutes
