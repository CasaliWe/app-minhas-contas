const Users = require('../models/Users')
const Contas = require('../models/Contas')

const nodemailer = require('nodemailer')

const cron = require('node-cron')

require('dotenv').config()

const { Op, where } = require('sequelize');



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





//AGENDAMENTO DA FUNÇÃO BUSCAR CONTAS QUE JÁ VENCERAM E ENVIAR EMAIL NOTIFICAÇÃO
const contasPassou = cron.schedule('00 09 * * *', () => {
    contasPassadas();
});

async function contasPassadas() {

    const ids = []
    const userIds = []
      
    const coontas = await Contas.findAll({raw:true, where:{lembrete: 'sim', pago:'não', vencendo: 'sim'}})
    coontas.forEach((conta)=>{
        
        //Pegando a data do banco e separando o mês e o dia
        var dataBanco = conta.dataOrdenar
        var mesBanco = dataBanco.getMonth() + 1
        var diaBanco = dataBanco.getDate() + 1
        
        //Pegando a data atual e separando o mês e o dia
        var dataAtual = new Date()
        var mesAtual = dataAtual.getMonth() + 1
        var diaAtual = dataAtual.getDate() 
        
        //Verifica se a data do banco está 2 dias a frente para fazer o lembrete
        if(mesAtual >= mesBanco && diaAtual > diaBanco){
            ids.push(conta.id)
            userIds.push(conta.userId)
        }
    })
    

    //PEGANDO O USER PARA TER O EMAIL E TRAZENDO AS CONTAS VENCENDO
    if(userIds.length != 0){
        //FILTRANDO O ARRAY DE USERID PARA QUE NÃO REPITA USERIDS
        const userIdsFiltrado = userIds.filter((valor, indice, array) => {
            return array.indexOf(valor) === indice;
        });

        const allDados = await Users.findAll({include: {model: Contas, where:{id: { [Op.in]: ids }}}, where:{id: { [Op.in]: userIdsFiltrado }}})
        const dadosConvertidos = allDados.map((result)=> result.get({plain:true}))
        //CHAMANDO A FUNÇÃO QUE ENVIA EMAIL NOTIFICANDO DAS CONTAS VENCENDO
        dadosConvertidos.forEach((userNotificar)=>{
            enviarEmailAtrasado(userNotificar.nome,userNotificar.email,userNotificar.contas)
        })
    }
}

contasPassou.start();


//FUNÇÃO QUE ENVIA EMAIL NOTIFICANDO AS CONTAS VENCENDO
function enviarEmailAtrasado(nome, email, contas){

    //Juntando os nomes das contas vencendo
    var contasVencendoNotificar = ''
    contas.forEach((contaa)=>{
        contasVencendoNotificar = contasVencendoNotificar + `${contaa.nome} de ${contaa.valor} R$` + ' , '
    })
     
    //enviando emal
    transporter.sendMail({
        from: 'MINHAS CONTAS',
        to: email,
        subject: `Olá ${nome}! tem conta sua que já venceu!`,
        html: `
        
            <div style='text-align:center; padding: 20px;'>
                <p style='text-align:center;'>Suas contas que venceram são: <strong>${contasVencendoNotificar}</strong> fique atento!</p>

                <a style='text-decoration: none;background-color: green;color: white;padding: 7px 15px;border-radius: 3px;margin-top: 15px;margin: 0 auto;' href="http://minhascontas.fun">Acessar contas</a>
            </div>

        `
    }).then((info)=>{console.log('Email Enviado')}).catch(err => console.log(err))

}











//AGENDAMENTO DA FUNÇÃO BUSCAR CONTAS VENCENDO E ENVIAR EMAIL NOTIFICAÇÃO
const task = cron.schedule('00 09 * * *', () => {
    contasAtrasadas();
});

async function contasAtrasadas() {

    const ids = []
    const userIds = []
      
    const coontas = await Contas.findAll({raw:true, where:{lembrete: 'sim', pago:'não', vencendo: 'não'}})
    coontas.forEach((conta)=>{
        
        //Pegando a data do banco e separando o mês e o dia
        var dataBanco = conta.dataOrdenar
        var mesBanco = dataBanco.getMonth() + 1
        var diaBanco = dataBanco.getDate() + 1
        
        //Pegando a data atual e separando o mês e o dia
        var dataAtual = new Date()
        var mesAtual = dataAtual.getMonth() + 1
        var diaAtual = dataAtual.getDate() 
        
        //Verifica se a data do banco está 2 dias a frente para fazer o lembrete
        if(mesAtual == mesBanco && diaAtual +2 == diaBanco){
            ids.push(conta.id)
            userIds.push(conta.userId)
        }
    })

    
    const vencendo = 'sim'
    if(ids.length != 0){
        await Contas.update({vencendo}, {where:{id: { [Op.in]: ids }}})
    }
    

    //PEGANDO O USER PARA TER O EMAIL E TRAZENDO AS CONTAS VENCENDO
    if(userIds.length != 0){
        //FILTRANDO O ARRAY DE USERID PARA QUE NÃO REPITA USERIDS
        const userIdsFiltrado = userIds.filter((valor, indice, array) => {
            return array.indexOf(valor) === indice;
        });

        const allDados = await Users.findAll({include: {model: Contas, where:{vencendo:'sim'}}, where:{id: { [Op.in]: userIdsFiltrado }}})
        const dadosConvertidos = allDados.map((result)=> result.get({plain:true}))
        //CHAMANDO A FUNÇÃO QUE ENVIA EMAIL NOTIFICANDO DAS CONTAS VENCENDO
        dadosConvertidos.forEach((userNotificar)=>{
            enviarEmail(userNotificar.nome,userNotificar.email,userNotificar.contas)
        })
    }
}

task.start();


//FUNÇÃO QUE ENVIA EMAIL NOTIFICANDO AS CONTAS VENCENDO
function enviarEmail(nome, email, contas){

    //Juntando os nomes das contas vencendo
    var contasVencendoNotificar = ''
    contas.forEach((contaa)=>{
        contasVencendoNotificar = contasVencendoNotificar + `${contaa.nome} de ${contaa.valor} R$` + ' , '
    })
     
    //enviando emal
    transporter.sendMail({
        from:'MINHAS CONTAS',
        to: email,
        subject: `Olá ${nome}! tem conta sua prestes a vencer!`,
        html: `
        
            <div style='text-align:center; padding: 20px;'>
                <p style='text-align:center;'>Suas contas que vencerão daqui 2 dias são: <strong>${contasVencendoNotificar}</strong> fique atento!</p>

                <a style='text-decoration: none;background-color: green;color: white;padding: 7px 15px;border-radius: 3px;margin-top: 15px;margin: 0 auto;' href="http://minhascontas.fun">Acessar contas</a>
            </div>

        `
    }).then((info)=>{console.log('Email Enviado')}).catch(err => console.log(err))

}









//AGENDAMENTO DE ATUALIZAÇÃO DE CONTAS PAGAS TODO DIA 1 DE CADA MÊS;
const task2 = cron.schedule('20 00 * * *', () => {
    ReiniciarContasPagas();
});


function ReiniciarContasPagas(){

       const hoje = new Date()
       const day = hoje.getDate()
       
       if(day == 1){
            resetPago();
       }

}

async function resetPago(){
      const allContas = await Contas.findAll({raw:true, where:{pago: 'sim'}})

      var contasDeletar = []
      var contasRetirarPago = []
      var pago = 'não'
     
      allContas.forEach((conta)=>{
            if(conta.parcela == conta.parcelaPaga){
                contasDeletar.push(conta.id)
            }

            if(conta.parcela != conta.parcelaPaga){
                contasRetirarPago.push(conta.id)
            }
      })

      await Contas.destroy({where:{id: { [Op.in]: contasDeletar }}})
      await Contas.update({pago}, {where:{id: { [Op.in]: contasRetirarPago }}})
}

task2.start();












module.exports = class ContasControllers {
        
        //Quando acesso a '/' verifica se está logado, se estiver leva para home com os dados, se não leva para login;
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


                //Pega apenas as contas não pagas para mostrar no all
                const contasNaoPagas = await Contas.findAll({raw:true, where:{userId: req.session.userid, pago: 'não'}, order: [['dataOrdenar', 'ASC']]})
                


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
                const contass = contasNaoPagas
                let valorTotal = 0

                contass.forEach((conta) => {
                     valorTotal = valorTotal + parseFloat(conta.valorParcela)
                });



                res.render('home', {contasNaoPagas, temContasVencendo, temContasPagas, valorTotal, homeActive, dadosUser: dadosUser.get({plain: true})})
            } else{
                res.render('login')
            }
        }
        
  



        //Mostra a view register
        static register(req,res){
            res.render('register')
        }


        


        //CRIAR CONTA
        static async criarConta(req,res){
            const {nome, email, user, senha, confirm} = req.body
            const boasVindas = 1
            
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
                await Users.create({nome, user, senha, email, boasVindas}) 
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

   
                //Pega apenas as contas não pagas para mostrar no all
                const contasNaoPagas = await Contas.findAll({raw:true, where:{userId: userTesteLogin.id, pago: 'não'}, order: [['dataOrdenar', 'ASC']]})


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
                const contass = contasNaoPagas
                let valorTotal = 0

                contass.forEach((conta) => {
                        valorTotal = valorTotal + parseFloat(conta.valorParcela)
                });


                req.session.userid = userTesteLogin.id 
                    req.session.save(()=>{
                    res.render('home', {contasNaoPagas, temContasVencendo, temContasPagas, valorTotal, homeActive, dadosUser: dadosUser.get({plain: true})})
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



                //Pega apenas as contas não pagas para mostrar no all
                const contasNaoPagas = await Contas.findAll({raw:true, where:{userId: req.session.userid, pago: 'não'}, order: [['dataOrdenar', 'ASC']]})



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
                const contass = contasNaoPagas
                let valorTotal = 0

                contass.forEach((conta) => {
                        valorTotal = valorTotal + parseFloat(conta.valorParcela)
                });


                res.render('home', {contasNaoPagas, temContasVencendo, temContasPagas, valorTotal, homeActive, dadosUser: dadosUser.get({plain: true})})
            } else{
                res.render('login')
            }
        }



        //FAZER LOGOUT
        static sair(req,res){
            req.session.destroy()
            res.redirect('/')
        }



        //MOSTRA A  VIEW ADICIONAR MAS COM OS DADOS DO USER
        static async adicionar(req,res){
            if(req.session.userid){
                //Pega os dados do user
                const dadosUser = await Users.findOne({raw: true, where: {id: req.session.userid}})

                res.render('adicionar', {adicionarActive, dadosUser})
            } else{
                res.render('login')
            }
        }



        //ADICIONA NOVA CONTA NO BANCO
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
                mostrarBtnPago: 1,
                dataOrdenar:vencimento
             }

             await Contas.create(novaConta)




             ///////////////////////////////////////////////////////////////////
                const dadosUser = await Users.findOne({
                    include: {
                        model: Contas
                    },
                    where: { id: req.session.userid },
                    order: [[Contas, 'dataOrdenar', 'ASC']]
                });



                //Pega apenas as contas não pagas para mostrar no all
                const contasNaoPagas = await Contas.findAll({raw:true, where:{userId: req.session.userid, pago: 'não'}, order: [['dataOrdenar', 'ASC']]})



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
                const contass = contasNaoPagas
                let valorTotal = 0

                contass.forEach((conta) => {
                        valorTotal = valorTotal + parseFloat(conta.valorParcela)
                });

                req.flash('criado','.') 
                res.render('home', {contasNaoPagas, temContasVencendo, temContasPagas, valorTotal, homeActive, dadosUser: dadosUser.get({plain: true})})
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
            }

            await Contas.update({parcelaPaga,vencendo, pago}, {where:{id: id}})
            

            ///////////////////////////////////////////////////////////////////
            const dadosUser = await Users.findOne({
                include: {
                    model: Contas
                },
                where: { id: req.session.userid },
                order: [[Contas, 'dataOrdenar', 'ASC']]
            });



            //Pega apenas as contas não pagas para mostrar no all
            const contasNaoPagas = await Contas.findAll({raw:true, where:{userId: req.session.userid, pago: 'não'}, order: [['dataOrdenar', 'ASC']]})



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
            const contass = contasNaoPagas
            let valorTotal = 0

            contass.forEach((conta) => {
                    valorTotal = valorTotal + parseFloat(conta.valorParcela)
            });

            req.flash('pago','.') 
            res.render('home', {contasNaoPagas, temContasVencendo, temContasPagas, valorTotal, homeActive, dadosUser: dadosUser.get({plain: true})})
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


            ///////////////////////////////////////////////////////////////////
            const dadosUser = await Users.findOne({
                include: {
                    model: Contas
                },
                where: { id: req.session.userid },
                order: [[Contas, 'dataOrdenar', 'ASC']]
            });



            //Pega apenas as contas não pagas para mostrar no all
            const contasNaoPagas = await Contas.findAll({raw:true, where:{userId: req.session.userid, pago: 'não'}, order: [['dataOrdenar', 'ASC']]})



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
            const contass = contasNaoPagas
            let valorTotal = 0

            contass.forEach((conta) => {
                    valorTotal = valorTotal + parseFloat(conta.valorParcela)
            });

            req.flash('editado','.') 
            res.render('home', {contasNaoPagas, temContasVencendo, temContasPagas, valorTotal, homeActive, dadosUser: dadosUser.get({plain: true})})
        }
        


        //DELETAR A CONTA
        static async deletar(req,res){
            const id = req.body.idConta

            await Contas.destroy({where: {id: id}})


            ///////////////////////////////////////////////////////////////////
            const dadosUser = await Users.findOne({
                include: {
                    model: Contas
                },
                where: { id: req.session.userid },
                order: [[Contas, 'dataOrdenar', 'ASC']]
            });



            //Pega apenas as contas não pagas para mostrar no all
            const contasNaoPagas = await Contas.findAll({raw:true, where:{userId: req.session.userid, pago: 'não'}, order: [['dataOrdenar', 'ASC']]})



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
            const contass = contasNaoPagas
            let valorTotal = 0

            contass.forEach((conta) => {
                    valorTotal = valorTotal + parseFloat(conta.valorParcela)
            });

            req.flash('deletado','.') 
            res.render('home', {contasNaoPagas, temContasVencendo, temContasPagas, valorTotal, homeActive, dadosUser: dadosUser.get({plain: true})})
        }


        //CONCLUIR BOAS VINDAS
        static async concluirBoasVindas(req,res){
             const id = req.body.id
             const boasVindas = 0

             await Users.update({boasVindas}, {where:{id: id}})

             res.redirect('/')
        }





        //MUDAR NOME
        static async mudarNome(req,res){
            if(req.session.userid){
                const id = req.session.userid

                const dadosUser = await Users.findOne({raw: true, where: {id: id}})

                res.render('mudarNome', {dadosUser})
            }else{
                res.render('login')
            }
        }

        //MUDAR NOME PARTE FINAL
        static async atualizarNome(req,res){
            const {id, nome} = req.body

            await Users.update({nome}, {where:{id:id}})


            ///////////////////////////////////////////////////////////////////
            const dadosUser = await Users.findOne({
                include: {
                    model: Contas
                },
                where: { id: req.session.userid },
                order: [[Contas, 'dataOrdenar', 'ASC']]
            });


            //Pega apenas as contas não pagas para mostrar no all
            const contasNaoPagas = await Contas.findAll({raw:true, where:{userId: req.session.userid, pago: 'não'}, order: [['dataOrdenar', 'ASC']]})


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
            const contass = contasNaoPagas
            let valorTotal = 0

            contass.forEach((conta) => {
                    valorTotal = valorTotal + parseFloat(conta.valorParcela)
            });

            req.flash('nomeAtualizado','.') 
            res.render('home', {contasNaoPagas, temContasVencendo, temContasPagas, valorTotal, homeActive, dadosUser: dadosUser.get({plain: true})})
        }








        //MUDAR USER
        static async mudarUser(req,res){
            if(req.session.userid){
                const id = req.session.userid

                const dadosUser = await Users.findOne({raw: true, where: {id: id}})

                res.render('mudarUser', {dadosUser})
            }else{
                res.render('login')
            }
        }



        //MUDAR USER PARTE FINAL
        static async atualizarUser(req,res){
            const {id, user} = req.body

            const verificarUser = await Users.findOne({raw: true, where: {user:user}})
            
            //VERIFICAR SE EMAIL JÁ EXISTE
            if(verificarUser != null){
                const dadosUser = await Users.findOne({raw: true, where: {id: id}})
                req.flash('userExiste','.') 
                res.render('mudarUser', {dadosUser})
                return
            }


            await Users.update({user}, {where:{id:id}})


            ///////////////////////////////////////////////////////////////////
            const dadosUser = await Users.findOne({
                include: {
                    model: Contas
                },
                where: { id: req.session.userid },
                order: [[Contas, 'dataOrdenar', 'ASC']]
            });


            //Pega apenas as contas não pagas para mostrar no all
            const contasNaoPagas = await Contas.findAll({raw:true, where:{userId: req.session.userid, pago: 'não'}, order: [['dataOrdenar', 'ASC']]})


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
            const contass = contasNaoPagas
            let valorTotal = 0

            contass.forEach((conta) => {
                    valorTotal = valorTotal + parseFloat(conta.valorParcela)
            });

            req.flash('userAtualizado','.') 
            res.render('home', {contasNaoPagas, temContasVencendo, temContasPagas, valorTotal, homeActive, dadosUser: dadosUser.get({plain: true})})
        }







        //MUDAR EMAIL
        static async mudarEmail(req,res){
            if(req.session.userid){
                const id = req.session.userid

                const dadosUser = await Users.findOne({raw: true, where: {id: id}})

                res.render('mudarEmail', {dadosUser})
            }else{
                res.render('login')
            }
        }



        //MUDAR EMAIL PARTE FINAL
        static async atualizarEmail(req,res){
            const {id, email} = req.body

            const verificarEmail = await Users.findOne({raw: true, where: {email:email}})
            
            //VERIFICAR SE EMAIL JÁ EXISTE
            if(verificarEmail != null){
                const dadosUser = await Users.findOne({raw: true, where: {id: id}})
                req.flash('emailExiste','.') 
                res.render('mudarEmail', {dadosUser})
                return
            }



            await Users.update({email}, {where:{id:id}})


            ///////////////////////////////////////////////////////////////////
            const dadosUser = await Users.findOne({
                include: {
                    model: Contas
                },
                where: { id: req.session.userid },
                order: [[Contas, 'dataOrdenar', 'ASC']]
            });


            //Pega apenas as contas não pagas para mostrar no all
            const contasNaoPagas = await Contas.findAll({raw:true, where:{userId: req.session.userid, pago: 'não'}, order: [['dataOrdenar', 'ASC']]})


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
            const contass = contasNaoPagas
            let valorTotal = 0

            contass.forEach((conta) => {
                    valorTotal = valorTotal + parseFloat(conta.valorParcela)
            });

            req.flash('emailAtualizado','.') 
            res.render('home', {contasNaoPagas, temContasVencendo, temContasPagas, valorTotal, homeActive, dadosUser: dadosUser.get({plain: true})})
        }







        
        //MUDAR SENHA
        static async mudarSenha(req,res){
            if(req.session.userid){
                const id = req.session.userid

                const dadosUser = await Users.findOne({raw: true, where: {id: id}})

                res.render('mudarSenha', {dadosUser})
            }else{
                res.render('login')
            }
        }



        //MUDAR SENHA PARTE FINAL
        static async atualizarSenha(req,res){
            const {id, atual, nova, confirm} = req.body
            var senha = confirm
             
            const dadosUser = await Users.findOne({raw:true, where:{ id: req.session.userid }});

            if(atual == dadosUser.senha){

                    if(nova == senha){
                        await Users.update({senha}, {where:{id:id}})
                    }else{
                        req.flash('senhaDiferente','.')
                        res.render('mudarSenha', {dadosUser})
                        return
                    }

            }else{
                req.flash('senhaAntiga','.')
                res.render('mudarSenha', {dadosUser})
                return
            }



            ///////////////////////////////////////////////////////////////////

            //Pega apenas as contas não pagas para mostrar no all
            const contasNaoPagas = await Contas.findAll({raw:true, where:{userId: req.session.userid, pago: 'não'}, order: [['dataOrdenar', 'ASC']]})


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
            const contass = contasNaoPagas
            let valorTotal = 0

            contass.forEach((conta) => {
                    valorTotal = valorTotal + parseFloat(conta.valorParcela)
            });

            req.flash('senhaAtualizado','.') 
            res.render('home', {contasNaoPagas, temContasVencendo, temContasPagas, valorTotal, homeActive, dadosUser})
        }







        //PESQUISAR
        static async pesquisar(req,res){
              const {tipoFiltro, id, nomeConta, dataConta} = req.body


              if(tipoFiltro == 'nome'){
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

                    res.render('pesquisa', {nomeOuData: nomeConta, contasNaoPagas, temContasPagas, valorTotal, dadosUser})
              
                }else{

                    const ids = []
                    const ids2 = []
                    var contasNaoPagas = []
                    var contasPagas = []

                    const dataa = new Date(dataConta)
                    const dia = dataa.getDate() +1
                    const mes = dataa.getMonth() +1
                    const ano = dataa.getFullYear()
                    const dataFormatada = `${dia}/${mes}/${ano}`
                    
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
                        var messs = conta.dataOrdenar.getMonth() +1 
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

                    res.render('pesquisa', {temContasPagas, nomeOuData: dataFormatada, contasNaoPagas, valorTotal, dadosUser})

              }
        }

        



        //RECUPERAR CONTA P1
        static recuperarContaP1(req,res){
              res.render('recuperarContaP1')
        }


        //ENVIAR EMAIL RECUPERAR CONTA
        static async envioEmailRecuperarConta(req,res){
             const email = req.body.email

             const user = await Users.findOne({raw:true, where:{email:email}})

             if(user == null){
                req.flash('emailNaoExiste','.')
                res.render('recuperarContaP1')
                return
             }

             transporter.sendMail({
                from: 'MINHAS CONTAS',
                to: email,
                subject: `Olá ${user.nome}! Vamos recuperar sua conta!`,
                html: `
                
                    <div style='text-align:center; padding: 20px;'>
                        <p style='text-align:center;'>Clique no botão abaixo para atualizar sua senha!</p>

                        <a style='text-decoration: none;background-color: green;color: white;padding: 7px 15px;border-radius: 3px;margin-top: 15px;margin: 0 auto;' href="http://localhost:3000/finalRecuperarConta/${user.id}">Recuperar</a>
                    </div>

                `
             }).then((info)=>{console.log('Email Enviado')}).catch(err => console.log(err))

             //levar para pag avisdo enviado email
             res.render('avisoEmailEnviado', {email})

        }



        //FINAL RECUPERAR CONTA
        static async finalRecuperarConta(req,res){
            const id = req.params.id

            res.render('finalRecuperarConta', {id})
        }



        //SALVAR NOVA SENHA
        static async salvarNovaSenha(req,res){
           const {id, senha,confirm} = req.body

           if(senha != confirm){
              req.flash('senhasDiferentes','.')
              res.render('finalRecuperarConta', {id})

              return
           }

           await Users.update({senha},{where:{id:id}})
          
           req.flash('senhaAtualizada','.')
           res.render('login')
        }
        
}