//IMPORTS
const Users = require('../models/Users')
require('dotenv').config()


//CONFIG EMAIL IMPORT
const transporter = require("../helpers/emailConfig")




module.exports = class ContasControllersRecuperar {
    
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

                    <a style='text-decoration: none;background-color: green;color: white;padding: 7px 15px;border-radius: 3px;margin-top: 15px;margin: 0 auto;' href="https://minhascontas.fun/finalRecuperarConta/${user.id}">Recuperar</a>
                </div>

            `
        }).then((info)=>{console.log('Email Enviado')}).catch(err => console.log(err))

        //levar para pag avisando enviado email
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



