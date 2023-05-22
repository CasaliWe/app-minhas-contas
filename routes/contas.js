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
router.get('/conta/:id', ContasControllers.contaDetalhes)

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



//BUSCAR A PESQUISA DO FILTRO
router.post('/pesquisar', ContasControllers.pesquisar)
router.get('/pesquisaNome/:nome/:id', ContasControllers.exibirPesquisarNome)
router.get('/pesquisaData/:data/:id', ContasControllers.exibirPesquisarData)




//RECUPERAR CONTA P1
router.get('/recuperarConta', ContasControllers.recuperarContaP1)

//ENVIAR EMAIL RECUPERAR CONTA
router.post('/envioEmailRecuperarConta', ContasControllers.envioEmailRecuperarConta)

//FINAL RECUPERAÇÃO CONTA
router.get('/finalRecuperarConta/:id', ContasControllers.finalRecuperarConta)

//SALVAR NOVA SENHA BANCO
router.post('/salvarNovaSenha', ContasControllers.salvarNovaSenha)


module.exports = router