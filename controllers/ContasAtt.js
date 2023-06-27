//IMPORTS
const Users = require('../models/Users')
const pegarDados = require("../helpers/buscaDadosGerais"); //FUNC QUE PEGA DADOS GERAIS
require('dotenv').config()



module.exports = class ContasControllersAtt {

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

        pegarDados(req.session.userid).then(resultado => {
            req.flash('nomeAtualizado','.') 
            res.render('home', resultado)
        })
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


        pegarDados(req.session.userid).then(resultado => {
            req.flash('userAtualizado','.') 
            res.render('home', resultado)
        })
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

        pegarDados(req.session.userid).then(resultado => {
           req.flash('emailAtualizado','.') 
           res.render('home', resultado)
        })
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



        pegarDados(req.session.userid).then(resultado => {
            req.flash('senhaAtualizado','.') 
            res.render('home', resultado)
         })
    }

}