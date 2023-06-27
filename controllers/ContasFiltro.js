//IMPORTS
const Users = require('../models/Users')
const Contas = require('../models/Contas')
const { Op } = require('sequelize');
require('dotenv').config()


//VAR GLOBAL
var contaPagaPesquisa = ''



module.exports = class ContasControllersFiltro {

        //PESQUISAR
        static async pesquisar(req,res){
            const {tipoFiltro, id, tela, nomeConta, dataConta} = req.body

            if(tipoFiltro == 'nome'){
                    res.redirect(`/pesquisaNome/${nomeConta}/${id}`)
                }else{
                    res.redirect(`/pesquisaData/${dataConta}/${id}/${tela}`)
            }
        }
        

        //GET PARA EXIBIR PESQUISA DO NOME
        static async exibirPesquisarNome(req,res){
            const nomeConta = req.params.nome
            const id = req.params.id


            const dadosUser = await Users.findOne({raw:true, where:{id:id}})

            //Pega apenas as contas não pagas para mostrar no all
            const contasNaoPagas = await Contas.findAll({raw:true, where:{userId: id, nome: {[Op.like]: `%${nomeConta}%`}, pago: 'não'}, order: [['dataOrdenar', 'ASC']]})


            //Pega contas que já foram pagas
            const contasPagas = await Contas.findAll({raw:true, where:{userId: id, nome: {[Op.like]: `%${nomeConta}%`}, pago: 'sim'}, order: [['dataOrdenar', 'ASC']]})
            console.log('oi')
            var temContasPagas = {tem: false, contaGreen: ''}

            if(contasPagas.length > 0){
                temContasPagas.tem = true
                temContasPagas.contaGreen = contasPagas
            } else{
                temContasPagas.tem = false
            }


            //LÓGICA PARA SOMAR O VALOR TOTAL DAS CONTAS
            const contass = contasNaoPagas
            let valorTotal = 0

            contass.forEach((conta) => {
                    valorTotal = valorTotal + parseFloat(conta.valorParcela)
            });

            valorTotal = valorTotal.toFixed(2)
            valorTotal = valorTotal.replace('.', ',')

            contaPagaPesquisa = `Contas pagas com o nome: "${nomeConta}" este mês.`

            res.render('pesquisa', {contaPagaPesquisa, nomeOuData: nomeConta, contasNaoPagas, temContasPagas, valorTotal, dadosUser})
        
        }


        //GET PARA EXIBIR PESQUISA DA DATA
        static async exibirPesquisarData(req,res){
            const dataConta = req.params.data
            const id = req.params.id
            const tela = req.params.tela


            const ids = []
            const ids2 = []
            var contasNaoPagas = []
            var contasPagas = []

            const dataa = new Date(dataConta)
            const dia = dataa.getDate() +1
            const mes = dataa.getMonth() +1
            const ano = dataa.getFullYear()
            var dataFormatada;

            if(tela == 'mobile'){
                var sub = dataa.getDate() 
                dataFormatada = `${sub}/${mes}/${ano}`
            }else{
                var subb = dataa.getDate() 
                dataFormatada = `${subb}/${mes}/${ano}`
            }
            
            const dadosUser = await Users.findOne({raw:true, where:{id:id}})

            //Pega apenas as contas não pagas para mostrar no all
            const allContasNaoPagas = await Contas.findAll({raw:true, where:{userId: id, pago: 'não'}, order: [['dataOrdenar', 'ASC']]})

            allContasNaoPagas.forEach((conta)=>{
                var diaa = conta.dataOrdenar.getDate() +1
                var mess = conta.dataOrdenar.getMonth() +1 
                var anoo = conta.dataOrdenar.getFullYear()

                if(diaa == dia && mess == mes && anoo == ano){
                    ids.push(conta.id)
                }
            })

            if(ids.length > 0){
                contasNaoPagas = await Contas.findAll({raw:true, where:{id: { [Op.in]: ids }, pago: 'não'}, order: [['dataOrdenar', 'ASC']]})
            }



            
            //Pega contas que já foram pagas
            const allContasPagas = await Contas.findAll({raw:true, where:{userId: id, pago: 'sim'}, order: [['dataOrdenar', 'ASC']]})
        
            allContasPagas.forEach((conta)=>{
                var diaaa = conta.dataOrdenar.getDate() +1
                var messs = conta.dataOrdenar.getMonth()
                var anooo = conta.dataOrdenar.getFullYear()

                if(diaaa == dia && messs == mes && anooo == ano){
                    ids2.push(conta.id)
                }
            })

            if(ids2.length > 0){
                contasPagas = await Contas.findAll({raw:true, where:{id: { [Op.in]: ids2 }}, order: [['dataOrdenar', 'ASC']]})
            }


            var temContasPagas = {tem: false, contaGreen: ''}

            if(ids2.length > 0){
                temContasPagas.tem = true
                temContasPagas.contaGreen = contasPagas
            } else{
                temContasPagas.tem = false
            }


            //LÓGICA PARA SOMAR O VALOR TOTAL DAS CONTAS
            const contass = contasNaoPagas
            let valorTotal = 0

            contass.forEach((conta) => {
                    valorTotal = valorTotal + parseFloat(conta.valorParcela)
            });

            valorTotal = valorTotal.toFixed(2)
            valorTotal = valorTotal.replace('.', ',')

            contaPagaPesquisa = `Contas pagas na data: ${dataFormatada}`

            res.render('pesquisa', {contaPagaPesquisa, temContasPagas, nomeOuData: dataFormatada, contasNaoPagas, valorTotal, dadosUser})
        }

}