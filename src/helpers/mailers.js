const nodemailer=require('nodemailer')
let transporter=nodemailer.createTransport({
    service:'gmail',
    auth:{
        user:'annoyancehannibal@gmail.com',
        pass:'bvugdqbkqugiwtzf'
    },
    tls:{
        rejectUnauthorized:false
    }
})

module.exports=transporter