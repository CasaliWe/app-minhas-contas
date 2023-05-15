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

//Adicionar Conta
router.get('/adicionar', ContasControllers.adicionar)

//Sair
router.get('/logout', ContasControllers.sair)

//ADICIONAR NOVA CONTA
router.post('/adicionarConta', ContasControllers.adicionarConta)



module.exports = router