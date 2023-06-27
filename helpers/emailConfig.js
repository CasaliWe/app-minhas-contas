//IMPORTS
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

module.exports = transporter