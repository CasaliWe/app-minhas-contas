const express = require('express')
const router = express.Router()

const ContasControllers = require('../controllers/Contas')



router.get('/', ContasControllers.login)



module.exports = router