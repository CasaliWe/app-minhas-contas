//IMPORTS
const express = require('express')
const exphbs = require('express-handlebars')
const nodemailer = require('nodemailer')
const { Cookie } = require('express-session')
const session = require('express-session')
const FileStore = require('session-file-store')(session)
const cron = require('node-cron')
const conn = require('./db/conn')
const contasRoutes = require('./routes/contas') 
const Users = require('./models/Users') 
const Contas = require('./models/Contas') 
const cronsEmails = require('./helpers/crons')


const app = express()
app.use(
    express.urlencoded({
         extended: true
    })
)
app.use(express.json())


const flash = require('express-flash')
app.use(flash())


app.use(
    session({
          name: 'session',
          secret: 'nosso_secret',
          resave: false,
          saveUninitialized: false,
          store: new FileStore({
              logFn: function() {}, 
              path: require('path').join(require('os').tmpdir(), 'session'),
          }),
          cookie: {
            secure:false,
            expires: new Date(Date.now() + (365 * 24 * 60 * 60 * 1000)),
            httpOnly: true
          }
    })
)
app.use((req, res, next)=>{
        if(req.session.userid){
             res.locals.session = req.session
        }
        next()
})


app.engine('handlebars', exphbs.engine())
app.set('view engine', 'handlebars')
app.use(express.static('public')) 


//ROTAS
app.use('/', contasRoutes) 



conn.sync().then(()=>{
    app.listen(3000)
}).catch((err) => console.log(err))
