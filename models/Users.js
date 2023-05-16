const {DataTypes} = require('sequelize')

const db = require('../db/conn')

const Users = db.define('users', {
     nome: {
          type: DataTypes.STRING,
          required: true
     },
     user: {
         type: DataTypes.STRING,
         required: true
     },
     senha: {
        type: DataTypes.STRING,
        required: true
     },
     email: {
        type: DataTypes.STRING,
        required: true
     },
     boasVindas: {
        type: DataTypes.BOOLEAN,
        required: true
     },
})

module.exports = Users