//IMPORTS
const Users = require('../models/Users')
const pegarDados = require("../helpers/buscaDadosGerais"); //FUNC QUE PEGA DADOS GERAIS
require('dotenv').config()


//CONFIG EMAIL IMPORT
const transporter = require("../helpers/emailConfig")

//VAR GLOBAL
const adicionarActive = true





module.exports = class ContasControllersAuth {
        
        //Quando acesso a '/' verifica se está logado, se estiver leva para home, se não leva para login;
        static async login(req,res){
            if(req.session.userid){
                pegarDados(req.session.userid).then(resultado => {
                    res.render('home', resultado)
                })
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
                req.session.userid = userTesteLogin.id 
                    req.session.save(()=>{
                    res.redirect('/home')
                })
             }else{
                req.flash('messagee','Usuário ou senha incorreto!') 
                res.render('login')
             }
        }




        //HOME
        static async home(req,res){
            if(req.session.userid){
                pegarDados(req.session.userid).then(resultado => {
                    res.render('home', resultado)
                })
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
        
}