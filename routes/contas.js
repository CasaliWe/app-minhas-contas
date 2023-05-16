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

//VER CONTA INDIVIDUAL
router.post('/verConta', ContasControllers.verConta)

//PAGO
router.post('/pago', ContasControllers.pago)

//EDITAR
router.post('/editar', ContasControllers.editar)

//FINALIZAR EDIÇÃO
router.post('/finalizarEdit', ContasControllers.finalizarEdit)

//DELETAR
router.post('/deletar', ContasControllers.deletar)

//CONCLUIR BOAS VINDAS
router.post('/concluirBoasVindas', ContasControllers.concluirBoasVindas)




module.exports = router