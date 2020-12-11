const nodemailer=require('nodemailer')
let transporter=nodemailer.createTransport({
    service:'gmail',
    auth:{
        user:'naufalgiffofficial@gmail.com',
        pass:'eibmdigowmokvouw'
    },
    tls:{
        rejectUnauthorized:false
    }
})

module.exports=transporter