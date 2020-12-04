const nodemailer=require('nodemailer')
let transporter=nodemailer.createTransport({
    service:'gmail',
    auth:{
        user:'dinotestes12@gmail.com',
        pass:'xsmjlseiedinjove'
    },
    tls:{
        rejectUnauthorized:false
    }
})

module.exports=transporter