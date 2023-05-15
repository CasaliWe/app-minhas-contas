const express = require('express')
const router = express.Router()

const ContasControllers = require('../controllers/Contas')


//LOGIN E REGISTER
router.get('/', ContasControllers.login)
router.get('/register', ContasControllers.register)

//CRIAR CONTA
router.post('/criarconta', ContasControllers.criarConta)

//Fazer login
router.post('/fazerlogin', ContasControllers.fazerLogin)

//Home Inicial
router.get('/home', ContasControllers.home)

//Sair
router.get('/logout', ContasControllers.sair)




module.exports = router