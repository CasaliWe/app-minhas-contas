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





//ATUALIZAR NOME
router.get('/mudarNome', ContasControllers.mudarNome)

//ATUALIZAR NOME PARTE FINAL
router.post('/atualizarNome', ContasControllers.atualizarNome)



//ATUALIZAR USER
router.get('/mudarUser', ContasControllers.mudarUser)

//ATUALIZAR USER PARTE FINAL
router.post('/atualizarUser', ContasControllers.atualizarUser)



//ATUALIZAR EMAIL
router.get('/mudarEmail', ContasControllers.mudarEmail)

//ATUALIZAR EMAIL PARTE FINAL
router.post('/atualizarEmail', ContasControllers.atualizarEmail)




//ATUALIZAR SENHA
router.get('/mudarSenha', ContasControllers.mudarSenha)

//ATUALIZAR SENHA PARTE FINAL
router.post('/atualizarSenha', ContasControllers.atualizarSenha)



module.exports = router