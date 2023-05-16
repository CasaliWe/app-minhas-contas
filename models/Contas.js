const {DataTypes} = require('sequelize')

const db = require('../db/conn')

const Users = require('../models/Users') 

const Contas = db.define('contas', {
     nome: {
          type: DataTypes.STRING,
          required: true
     },
     valor: {
         type: DataTypes.STRING,
         required: true
     },
     valorParcela: {
      type: DataTypes.STRING,
      required: true
     },
     parcela: {
        type: DataTypes.STRING,
        required: true
     },
     parcelaPaga: {
        type: DataTypes.STRING,
        required: true
     },
     vencimento: {
        type: DataTypes.STRING,
        required: true
     },
     lembrete: {
        type: DataTypes.STRING,
        required: true
     },
     vencendo: {
        type: DataTypes.STRING,
        required: true
     },
     pago: {
        type: DataTypes.STRING,
        required: true
     },
     dataOrdenar: {
      type: DataTypes.DATE,
      required: true
     }
})

Users.hasMany(Contas)
Contas.belongsTo(Users) 


module.exports = Contas