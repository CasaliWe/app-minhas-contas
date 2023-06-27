//IMPORTS
const Users = require('../models/Users')
const Contas = require('../models/Contas')
require('dotenv').config()


//VAR GLOBAL
const homeActive = true



async function pegarDados(userId){

    const dadosUser = await Users.findOne({
        include: {
            model: Contas
        },
        where: { id: userId },
        order: [[Contas, 'dataOrdenar', 'ASC']]
    });



    //Pega apenas as contas não pagas para mostrar no all
    const contasNaoPagas = await Contas.findAll({raw:true, where:{userId: userId, pago: 'não'}, order: [['dataOrdenar', 'ASC']]})



    //Pega contas que já foram pagas
    const contasPagas = await Users.findOne({
        include: {
            model: Contas, 
            where:{pago: 'sim'}
        },
        where: { id: userId },
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
        where: { id: userId},
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

    valorTotal = valorTotal.toFixed(2)
    valorTotal = valorTotal.replace('.', ',')


    return {contasNaoPagas, temContasVencendo, temContasPagas, valorTotal, homeActive, dadosUser: dadosUser.get({plain: true})}

}



module.exports = pegarDados;