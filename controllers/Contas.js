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



module.exports = class ContasControllers {
        static login(req,res){
            res.render('login')
        }
}