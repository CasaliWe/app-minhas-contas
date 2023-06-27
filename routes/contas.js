const express = require('express')
const router = express.Router()

//IMPORTS CONTROLLERS
const ContasControllersAuth = require('../controllers/ContasAuth')
const ContasControllersCrud = require('../controllers/ContasCrud')
const ContasControllersRecuperar = require('../controllers/ContasRecuperar')
const ContasControllersAtt = require('../controllers/ContasAtt')
const ContasControllersFiltro = require('../controllers/ContasFiltro')




//-----------ROTAS DE AUTENTICAÇÃO----------
//LOGIN E REGISTER
router.get('/', ContasControllersAuth.login)
router.get('/register', ContasControllersAuth.register)

//CRIAR CONTA
router.post('/criarconta', ContasControllersAuth.criarConta)

//Fazer login
router.post('/fazerlogin', ContasControllersAuth.fazerLogin)

//Home Inicial
router.get('/home', ContasControllersAuth.home)

//Adicionar Conta
router.get('/adicionar', ContasControllersAuth.adicionar)

//Sair
router.get('/logout', ContasControllersAuth.sair)





//-----------ROTAS DE CRUD----------
//ADICIONAR NOVA CONTA
router.post('/adicionarConta', ContasControllersCrud.adicionarConta)

//VER CONTA INDIVIDUAL
router.post('/verConta', ContasControllersCrud.verConta)
router.get('/conta/:id', ContasControllersCrud.contaDetalhes)

//PAGO
router.post('/pago', ContasControllersCrud.pago)

//EDITAR
router.post('/editar', ContasControllersCrud.editar)

//FINALIZAR EDIÇÃO
router.post('/finalizarEdit', ContasControllersCrud.finalizarEdit)

//DELETAR
router.post('/deletar', ContasControllersCrud.deletar)

//CONCLUIR BOAS VINDAS
router.post('/concluirBoasVindas', ContasControllersCrud.concluirBoasVindas)




//-----------ROTAS DE ATUALIZAÇÕES----------
//ATUALIZAR NOME
router.get('/mudarNome', ContasControllersAtt.mudarNome)

//ATUALIZAR NOME PARTE FINAL
router.post('/atualizarNome', ContasControllersAtt.atualizarNome)

//ATUALIZAR USER
router.get('/mudarUser', ContasControllersAtt.mudarUser)

//ATUALIZAR USER PARTE FINAL
router.post('/atualizarUser', ContasControllersAtt.atualizarUser)

//ATUALIZAR EMAIL
router.get('/mudarEmail', ContasControllersAtt.mudarEmail)

//ATUALIZAR EMAIL PARTE FINAL
router.post('/atualizarEmail', ContasControllersAtt.atualizarEmail)

//ATUALIZAR SENHA
router.get('/mudarSenha', ContasControllersAtt.mudarSenha)

//ATUALIZAR SENHA PARTE FINAL
router.post('/atualizarSenha', ContasControllersAtt.atualizarSenha)




//-----------ROTAS DE FILTROS----------
router.post('/pesquisar', ContasControllersFiltro.pesquisar)
router.get('/pesquisaNome/:nome/:id', ContasControllersFiltro.exibirPesquisarNome)
router.get('/pesquisaData/:data/:id/:tela', ContasControllersFiltro.exibirPesquisarData)




//-----------ROTAS DE RECUPERAÇÃO----------
//RECUPERAR CONTA P1
router.get('/recuperarConta', ContasControllersRecuperar.recuperarContaP1)

//ENVIAR EMAIL RECUPERAR CONTA
router.post('/envioEmailRecuperarConta', ContasControllersRecuperar.envioEmailRecuperarConta)

//FINAL RECUPERAÇÃO CONTA
router.get('/finalRecuperarConta/:id', ContasControllersRecuperar.finalRecuperarConta)

//SALVAR NOVA SENHA BANCO
router.post('/salvarNovaSenha', ContasControllersRecuperar.salvarNovaSenha)


module.exports = router