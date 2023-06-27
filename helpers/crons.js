//IMPORTS
const Users = require('../models/Users')
const Contas = require('../models/Contas')
const cron = require('node-cron')
const { Op } = require('sequelize');
require('dotenv').config()


//CONFIG EMAIL IMPORT
const transporter = require("../helpers/emailConfig")




//----------AGENDAMENTO DA FUNÇÃO BUSCAR CONTAS VENCENDO E ENVIAR EMAIL NOTIFICAÇÃO---------------
const task = cron.schedule('30 10 * * *', () => {
    contasAtrasadas();
});

async function contasAtrasadas(){

    const ids = []
    const idsContas = []
    var vencendo = 'sim'

    const allContasVencendo = await Contas.findAll({raw:true, where:{vencendo: 'não', pago:'não', lembrete:'sim'}})
    allContasVencendo.forEach((conta)=>{
        //Pegando a data do banco e separando o mês e o dia
        var dataBanco = conta.dataOrdenar
        var mesBanco = dataBanco.getMonth() + 1
        var diaBanco = dataBanco.getDate() + 1
        
        //Pegando a data atual e separando o mês e o dia
        var dataAtual = new Date()
        var mesAtual = dataAtual.getMonth() + 1
        var diaAtual = dataAtual.getDate() 
        
        //Verifica se a data do banco está 2 dias a frente
        if(mesAtual == mesBanco && diaAtual +2 == diaBanco){
            ids.push(conta.userId)
            idsContas.push(conta.id)
        }
    })

    await Contas.update({vencendo}, {where:{id: { [Op.in]: idsContas }}})



    const idsFiltrado = ids.filter((valor, indice, array) => {
        return array.indexOf(valor) === indice;
    });


    const allUsersGet = await Users.findAll({include:{model:Contas, where:{lembrete: 'sim', pago:'não'}}, where:{id: { [Op.in]: ids }}})
    const allUsers =  allUsersGet.map((result)=> result.get({plain:true}))



    var usersNotificar = []
    allUsers.forEach((user)=>{

        var usuario = {nome: user.nome, email: user.email, contas:[]}

        user.contas.forEach((conta)=>{
            //Pegando a data do banco e separando o mês e o dia
            var dataBanco = conta.dataOrdenar
            var mesBanco = dataBanco.getMonth() + 1
            var diaBanco = dataBanco.getDate() + 1
            
            //Pegando a data atual e separando o mês e o dia
            var dataAtual = new Date()
            var mesAtual = dataAtual.getMonth() + 1
            var diaAtual = dataAtual.getDate() 
            
            //Verifica se a data do banco está 2 dias a frente
            if(mesAtual == mesBanco && diaAtual +2 == diaBanco){
                var contaVencendo = {nome: conta.nome, valor: conta.valor}
                usuario.contas.push(contaVencendo)
            }
        })

        usersNotificar.push(usuario)

    })



    usersNotificar.forEach((userr)=>{
         var stringMsg = ''

         userr.contas.forEach((contaa)=>{
             stringMsg += `${contaa.nome} no valor de ${contaa.valor} R$, ` 
         })

         enviarEmail(userr.nome, userr.email, stringMsg);
    })

}

task.start();


//FUNÇÃO QUE ENVIA EMAIL NOTIFICANDO AS CONTAS VENCENDO
function enviarEmail(nome, email, msg){

    //enviando emal
    transporter.sendMail({
        from:'MINHAS CONTAS',
        to: email,
        subject: `Olá ${nome}! tem conta sua prestes a vencer!`,
        html: `
        
            <div style='text-align:center; padding: 20px;'>
                <p style='text-align:center;'>Suas contas que vencerão daqui 2 dias são: <strong>${msg}</strong> fique atento!</p>

                <a style='text-decoration: none;background-color: green;color: white;padding: 7px 15px;border-radius: 3px;margin-top: 15px;margin: 0 auto;' href="https://minhascontas.fun">Acessar contas</a>
            </div>

        `
    }).then((info)=>{console.log(`Email enviado para ${email}`)}).catch(err => console.log(err))

}
//----------AGENDAMENTO DA FUNÇÃO BUSCAR CONTAS VENCENDO E ENVIAR EMAIL NOTIFICAÇÃO---------------







//----------------AGENDAMENTO DE ATUALIZAÇÃO DE CONTAS PAGAS TODO DIA 1 DE CADA MÊS-----------------
const task2 = cron.schedule('00 04 * * *', () => {
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
//----------------AGENDAMENTO DE ATUALIZAÇÃO DE CONTAS PAGAS TODO DIA 1 DE CADA MÊS-----------------













