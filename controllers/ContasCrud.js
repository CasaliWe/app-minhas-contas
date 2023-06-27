//IMPORTS
const Users = require('../models/Users')
const Contas = require('../models/Contas')
const pegarDados = require("../helpers/buscaDadosGerais"); //FUNC QUE PEGA DADOS GERAIS
require('dotenv').config()




module.exports = class ContasControllersCrud {

        //ADICIONA NOVA CONTA NO BANCO
        static async adicionarConta(req,res){
            const {userId, nome, valor, parcela, vencimento, lembrete} = req.body
            var vencendo = 'não'
            const pago = 'não'

            //Lógica para verificar se a conta adicionada está atrasada
            const dataAdicionada = new Date(vencimento)
            const verificarDia = dataAdicionada.getDate() +1
            const verificarMes = dataAdicionada.getMonth() +1

            const dataAtual = new Date()
            const diaHoje = dataAtual.getDate()
            const mesHJ = dataAtual.getMonth() +1
            
            if(diaHoje > verificarDia && mesHJ >= verificarMes){
                vencendo = 'sim'
            }


                
            //FAZENDO O CALCULO DA PARCELA
            var valorParcela;
            var string1 = parseFloat(valor.replace(",", "."));
            var string2 = parseFloat(parcela)

            if(string2 > 1){
                valorParcela = string1 / string2
                valorParcela = valorParcela.toFixed(2)
            }else{
                valorParcela = valor
            }


            //Reorganizando a ordem da data antes de salvar no banco
            function mudarOrdemData(data) {
                var partes = data.split('-');
                var ano = partes[0].slice(-2);
                var novaData = partes[2] + '/' + partes[1] + '/' + ano;
                return novaData;
                }

                var dataOriginal = vencimento;
                var dataNova = mudarOrdemData(dataOriginal);



            
            const novaConta = {
                userId,
                nome,
                valor,
                valorParcela,
                parcela,
                parcelaPaga: '0',
                vencimento:dataNova,
                lembrete,
                vencendo,
                pago,
                mostrarBtnPago: 1,
                dataOrdenar:vencimento
            }

            await Contas.create(novaConta)


            pegarDados(req.session.userid).then(resultado => {

                req.flash('criado','.') 
                res.render('home', resultado)

            })
        }



        //VER CONTA ESPECIFICA COM OS DETALHES
        static async verConta(req,res){
            const id = req.body.idConta

            if(req.session.userid){
                res.redirect(`/conta/${id}`)
            } else{
                res.render('login')
            }
        }

        //Rota get para ver detalhes da conta
        static async contaDetalhes(req,res){
            const id = req.params.id

            if(req.session.userid){
                //Pega os dados do user
                const dadosUser = await Users.findOne({raw: true, where: {id: req.session.userid}})
                
                //Pega conta desejada
                const contaOne = await Contas.findOne({raw:true, where: {id: id}})

                //Faz calculo para ver quntas parcelas restam
                var string1 = parseFloat(contaOne.parcela)
                var string2 = parseFloat(contaOne.parcelaPaga)
                var resFinal = string1 - string2 + 'X'

                if(resFinal == '0X'){
                    resFinal = 'PAGO!'
                }


                //Faz calculo para ver qual o valor restante
                var stringg1 = parseFloat(contaOne.parcela)
                var stringg2 = parseFloat(contaOne.parcelaPaga)
                var resFinall = stringg1 - stringg2

                var valorRestante = resFinall * parseFloat(contaOne.valorParcela)
                valorRestante = valorRestante.toFixed(2)


                res.render('verConta', {contaOne, dadosUser, resFinal, valorRestante})
            } else{
                res.render('login')
            }
        }




        //QUANDO CLICA EM PAGO
        static async pago(req,res){
            const id = req.body.idConta
            const pago = 'sim'
            const vencendo = 'não'
            
            const contaaa = await Contas.findOne({raw:true, where:{id:id}})

            var string = parseFloat(contaaa.parcelaPaga)
            var parcelaPaga = string + 1
            
            //QUANDO A CONTA FOR PAGA TODAS AS PARCELAS, O BTN PAGO E EDITAR NÃO SERÁ MAIS MOSTRADO;
            if(parcelaPaga == contaaa.parcela){
                await Contas.update({mostrarBtnPago: 0}, {where:{id: id}})
            }else{
                //Atualizando a data de vencimento, aumentando um mês      
                var atualizarData = new Date(contaaa.dataOrdenar)
                atualizarData.setMonth(atualizarData.getMonth() + 1); //NOVA DATA

                const novoDia =  atualizarData.getDate() +1
                const novoMes =  atualizarData.getMonth() +1
                var novoAno =  atualizarData.getFullYear()   
                novoAno = novoAno.toString().slice(-2)    

                const novaDataFinalizada = `${novoDia}/${novoMes}/${novoAno}`
                
                await Contas.update({vencimento:novaDataFinalizada, dataOrdenar:atualizarData}, {where:{id: id}})
            }

            
            await Contas.update({parcelaPaga,vencendo, pago}, {where:{id: id}})
            

            pegarDados(req.session.userid).then(resultado => {
                req.flash('pago','.') 
                res.render('home', resultado)
            })
        }



        //QUANDO CLICA EM EDITAR
        static async editar(req,res){
            const id = req.body.idConta

            if(req.session.userid){
                const dadosUser = await Users.findOne({raw:true, where:{ id:req.session.userid }})
                const dados = await Contas.findOne({raw:true, where:{ id:id }})

                res.render('editar', {dados, dadosUser})
            }else{
                res.render('login')
            }
        }



        //FINALIZA A EDIÇÃO DA CONTA
        static async finalizarEdit(req,res){
            const {idConta, nome, valor, parcela, vencimento, lembrete} = req.body
            const vencendo = 'não'
            const pago = 'não'
            

            //FAZENDO O CALCULO DA PARCELA
            var valorParcela;
            var string1 = parseFloat(valor.replace(",", "."));
            var string2 = parseFloat(parcela)

            if(string2 > 1){
                valorParcela = string1 / string2
                valorParcela = valorParcela.toFixed(2)
            }else{
                valorParcela = valor
            }


            //Reorganizando a ordem da data antes de salvar no banco
            function mudarOrdemData(data) {
                var partes = data.split('-');
                var ano = partes[0].slice(-2);
                var novaData = partes[2] + '/' + partes[1] + '/' + ano;
                return novaData;
            }

            var dataOriginal = vencimento;
            var dataNova = mudarOrdemData(dataOriginal);

            await Contas.update({nome,valor,valorParcela,parcela,parcelaPaga: '0',vencimento:dataNova,lembrete,vencendo,pago,mostarBtnPago: 1,dataOrdenar:vencimento}, {where:{id: idConta}})


            pegarDados(req.session.userid).then(resultado => {
                req.flash('editado','.') 
                res.render('home', resultado)
            })
        }



        //DELETAR A CONTA
        static async deletar(req,res){
            const id = req.body.idConta

            await Contas.destroy({where: {id: id}})

            pegarDados(req.session.userid).then(resultado => {
                req.flash('deletado','.') 
                res.render('home', resultado)
            })
        }


        //CONCLUIR BOAS VINDAS
        static async concluirBoasVindas(req,res){
            const id = req.body.id
            const boasVindas = 0

            await Users.update({boasVindas}, {where:{id: id}})

            res.redirect('/')
        }

}