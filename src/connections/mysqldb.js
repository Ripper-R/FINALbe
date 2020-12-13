const mysql=require('mysql')
// const util = require('util')
const db=mysql.createConnection({
    host     : process.env.DB_HOST,
    user     : process.env.DB_USER,
    password : process.env.DB_PASS,
    database : process.env.DB_DATABASE,
    port:3306,
})
// const db=mysql.createConnection({
//     host     : 'db4free.net',
//     user     : 'dino96112',
//     password : '241d9e23',
//     database : 'jc12hokihoki',
//     port:3306,
// })

db.connect((err)=>{
    if(err){
        console.log(err)
    }else{
        console.log('success')
    }
})

// const querysql = util.promisify(db.query).bind(db);

module.exports= db




