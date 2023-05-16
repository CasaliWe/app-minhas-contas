const Users = require('../models/Users')
const Contas = require('../models/Contas')

const nodemailer = require('nodemailer')

require('dotenv').config()



const user = process.env.USER
const pass = process.env.SENHA


const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com', 
    port: 587,
    secure: false,
    auth: {
        user, pass  
    }
})



const homeActive = true
const adicionarActive = true


module.exports = class ContasControllers {
        static async login(req,res){
            if(req.session.userid){
                //Pega os dados do user e as contas ordenadas
                const dadosUser = await Users.findOne({
                    include: {
                      model: Contas
                    },
                    where: { id: req.session.userid },
                    order: [[Contas, 'dataOrdenar', 'ASC']]
                });

                

                //Pega contas que já foram pagas
                const contasPagas = await Users.findOne({
                    include: {
                      model: Contas, 
                      where:{pago: 'sim'}
                    },
                    where: { id: req.session.userid },
                    order: [[Contas, 'dataOrdenar', 'ASC']]
                });

                var temContasPagas = {tem: false, contaGreen: ''}

                if(contasPagas){
                    temContasPagas.tem = true
                    temContasPagas.contaGreen = contasPagas.get({plain: true})
                } else{
                    temContasPagas.tem = false
                }




                //Pegar contas que estão vencendo
                const contasVencendo = await Users.findOne({
                    include: {
                        model: Contas, 
                        where:{vencendo: 'sim'}
                    },
                    where: { id: req.session.userid },
                    order: [[Contas, 'dataOrdenar', 'ASC']]
                });

                var temContasVencendo = {tem: false, contaRed: ''}

                if(contasVencendo){
                    temContasVencendo.tem = true
                    temContasVencendo.contaRed = contasVencendo.get({plain: true})
                } else{
                    temContasVencendo.tem = false
                }



                //LÓGICA PARA SOMAR O VALOR TOTAL DAS CONTAS
                const contass = dadosUser.contas
                let valorTotal = 0

                contass.forEach((conta) => {
                     valorTotal = valorTotal + parseFloat(conta.valorParcela)
                });



                res.render('home', {temContasVencendo, temContasPagas, valorTotal, homeActive, dadosUser: dadosUser.get({plain: true})})
            } else{
                res.render('login')
            }
        }
        


        static register(req,res){
            res.render('register')
        }
        


        //CRIAR CONTA
        static async criarConta(req,res){
            const {nome, email, user, senha, confirm} = req.body
            
            //Verifica se as senhas são iguais
            if(senha != confirm){
                req.flash('message','As senhas são diferentes!') 
                res.render('register')

                return
            }

            
            //Pega os users do banco
            const emailTeste = await Users.findOne({raw: true, where: {email: email}})
            const userTeste = await Users.findOne({raw: true, where: {user: user}})
            


            //Verifica se existe o email no banco
            if(emailTeste != null){
                req.flash('message','Email já cadastrado!') 
                res.render('register')

                return
            }

            //Verifica se existe o user no banco
            if(userTeste != null){
                req.flash('message','Usuário já cadastrado!') 
                res.render('register')
    
                return
            }

            //Cria o user e salva no banco
            if(emailTeste == null && userTeste == null){
                await Users.create({nome, user, senha, email}) 
                res.redirect('/')

                return
            }
        }




        //FAZER LOGIN
        static async fazerLogin(req,res){
             const {user, senha} = req.body

             const userTesteLogin = await Users.findOne({raw: true, where: {user: user}})
             const senhaTesteLogin = await Users.findOne({raw: true, where: {senha: senha}})

             if(userTesteLogin != null && senhaTesteLogin != null){
                //Pega os dados do user e as contas ordenadas
                const dadosUser = await Users.findOne({
                    include: {
                        model: Contas
                    },
                    where: { id: userTesteLogin.id },
                    order: [[Contas, 'dataOrdenar', 'ASC']]
                });

                console.log(dadosUser)



                //Pega contas que já foram pagas
                const contasPagas = await Users.findOne({
                    include: {
                        model: Contas, 
                        where:{pago: 'sim'}
                    },
                    where: { id: userTesteLogin.id },
                    order: [[Contas, 'dataOrdenar', 'ASC']]
                });

                var temContasPagas = {tem: false, contaGreen: ''}

                if(contasPagas){
                    temContasPagas.tem = true
                    temContasPagas.contaGreen = contasPagas.get({plain: true})
                } else{
                    temContasPagas.tem = false
                }



                //Pegar contas que estão vencendo
                const contasVencendo = await Users.findOne({
                    include: {
                        model: Contas, 
                        where:{vencendo: 'sim'}
                    },
                    where: { id: userTesteLogin.id },
                    order: [[Contas, 'dataOrdenar', 'ASC']]
                });

                var temContasVencendo = {tem: false, contaRed: ''}

                if(contasVencendo){
                    temContasVencendo.tem = true
                    temContasVencendo.contaRed = contasVencendo.get({plain: true})
                } else{
                    temContasVencendo.tem = false
                }




                //LÓGICA PARA SOMAR O VALOR TOTAL DAS CONTAS
                const contass = dadosUser.contas
                let valorTotal = 0

                contass.forEach((conta) => {
                        valorTotal = valorTotal + parseFloat(conta.valorParcela)
                });


                req.session.userid = userTesteLogin.id 
                    req.session.save(()=>{
                    res.render('home', {temContasVencendo, temContasPagas, valorTotal, homeActive, dadosUser: dadosUser.get({plain: true})})
                })
             }else{
                req.flash('messagee','Usuário ou senha incorreto!') 
                res.render('login')
             }
        }




        //HOME
        static async home(req,res){
            if(req.session.userid){
                //Pega os dados do user e as contas ordenadas
                const dadosUser = await Users.findOne({
                    include: {
                        model: Contas
                    },
                    where: { id: req.session.userid },
                    order: [[Contas, 'dataOrdenar', 'ASC']]
                });



                //Pega contas que já foram pagas
                const contasPagas = await Users.findOne({
                    include: {
                        model: Contas, 
                        where:{pago: 'sim'}
                    },
                    where: { id: req.session.userid },
                    order: [[Contas, 'dataOrdenar', 'ASC']]
                });

                var temContasPagas = {tem: false, contaGreen: ''}

                if(contasPagas){
                    temContasPagas.tem = true
                    temContasPagas.contaGreen = contasPagas.get({plain: true})
                } else{
                    temContasPagas.tem = false
                }



                //Pegar contas que estão vencendo
                const contasVencendo = await Users.findOne({
                    include: {
                        model: Contas, 
                        where:{vencendo: 'sim'}
                    },
                    where: { id: req.session.userid },
                    order: [[Contas, 'dataOrdenar', 'ASC']]
                });

                var temContasVencendo = {tem: false, contaRed: ''}

                if(contasVencendo){
                    temContasVencendo.tem = true
                    temContasVencendo.contaRed = contasVencendo.get({plain: true})
                } else{
                    temContasVencendo.tem = false
                }



                //LÓGICA PARA SOMAR O VALOR TOTAL DAS CONTAS
                const contass = dadosUser.contas
                let valorTotal = 0

                contass.forEach((conta) => {
                        valorTotal = valorTotal + parseFloat(conta.valorParcela)
                });


                res.render('home', {temContasVencendo, temContasPagas, valorTotal, homeActive, dadosUser: dadosUser.get({plain: true})})
            } else{
                res.render('login')
            }
        }



        //SAIR
        static sair(req,res){
            req.session.destroy()
            res.redirect('/')
        }



        //ADICIONAR
        static async adicionar(req,res){
            if(req.session.userid){
                //Pega os dados do user
                const dadosUser = await Users.findOne({raw: true, where: {id: req.session.userid}})

                res.render('adicionar', {adicionarActive, dadosUser})
            } else{
                res.render('login')
            }
        }



        //ADICIONAR NOVA CONTA
        static async adicionarConta(req,res){
             const {userId, nome, valor, parcela, vencimento, lembrete} = req.body
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
                dataOrdenar:vencimento
             }

             await Contas.create(novaConta)

             res.redirect('/')
        }


        //VER CONTA ESPECIFICA COM OS DETALHES
        static async verConta(req,res){
            const id = req.body.idConta

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

                const valorRestante = resFinall * parseFloat(contaOne.valorParcela)



                res.render('verConta', {contaOne, dadosUser, resFinal, valorRestante})
            } else{
                res.render('login')
            }
        }




        //PAGO
        static async pago(req,res){
            const id = req.body.idConta
            const pago = 'sim'
            
            const contaaa = await Contas.findOne({raw:true, where:{id:id}})

            var string = parseFloat(contaaa.parcelaPaga)
            var parcelaPaga = string + 1


            await Contas.update({parcelaPaga, pago}, {where:{id: id}})

            res.redirect('/')
        }



        //EDITAR
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


        //FINALIZAR EDIÇÃO
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

            await Contas.update({nome,valor,valorParcela,parcela,parcelaPaga: '0',vencimento:dataNova,lembrete,vencendo,pago,dataOrdenar:vencimento}, {where:{id: idConta}})

            res.redirect('/')
        }
        


        //DELETAR
        static async deletar(req,res){
            const id = req.body.idConta

            await Contas.destroy({where: {id: id}})

            res.redirect('/')
        }
}