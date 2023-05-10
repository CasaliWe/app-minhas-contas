const {Sequelize} = require('sequelize')

require('dotenv').config()

const sequelize = new Sequelize(process.env.NOMEDOBANCO, process.env.NOMEUSER, process.env.SENHAUSER, {
     host: process.env.HOST,
     dialect: process.env.BANCO
})

module.exports = sequelize