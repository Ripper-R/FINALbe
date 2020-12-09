const express=require('express')
const app=express()
const bodyParser=require('body-parser')
const cors=require('cors')
const bearerToken=require('express-bearer-token')

require('dotenv').config()

const PORT = process.env.PORT || 8080


app.use(cors())
app.use(bearerToken())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }));//buat user kirim data ke server
app.use(express.static('public'))


app.get('/',(req,res)=>{
    res.send('<h1>your most trusted DRUGSTORE</h1>')
})

const {
    AuthRoutes,
    ProductRoutes,
    TransactionsRoutes
}=require('./src/Routes')

app.use('/auth',AuthRoutes)
app.use('/product',ProductRoutes)
app.use('/trans',TransactionsRoutes)


// var schedule = require('node-schedule');


// schedule.scheduleJob("*/10 * * * * *", function(firedate){
//   console.log('The answer to life, the universe, and everything!'+firedate);
// });

app.listen(PORT,()=>{
    console.log('Api Aktif di Port '+PORT)
})
