const {db}=require('../connections')
const {encrypt,transporter}=require('../helpers')
const {createJWToken}=require('../helpers/jwt')
const fs=require('fs')
const handlebars=require('handlebars')

const DbPROMselect=(sql)=>{
    return new Promise((resolve,reject)=>{
        db.query(sql,(err,results)=>{
            if (err){
                reject(err)
            }else{
                resolve(results)
            } 
        })
    })
}

module.exports={
    register:(req,res)=>{
        const {username,email,password}=req.body
        // let sql=`select * from users where username = "${username}"`
        let sql=`select * from users where username = ?`
        db.query(sql,[username],(err,users)=>{
            //console.log(err)
            if (err) return res.status(500).send({message:"Server Error"})
            if(users.length){
                console.log(users)

                return res.status(500).send({message:"Your Username is already taken!"})
            }else{
                console.log("masuk")
                let hashpassword=encrypt(password)
                var data={
                    username:username,
                    email,
                    password:hashpassword
                }
                sql=`insert into users set ?`
                db.query(sql,data,(err,results)=>{
                    console.log(err)
                    if (err) return res.status(500).send({message:"server error"})

                    console.log('berhasil post data users')
                    sql=`select * from users where id = ?`
                    db.query(sql,[results.insertId],(err,userslogin)=>{
                        if (err) return res.status(500).send({message:"server error"})

                        const token=createJWToken({id:userslogin[0].id,username:userslogin[0].username})
                        const link=`http://localhost:8080/verified?token=${token}`
                        const htmlrender=fs.readFileSync('./template/email.html','utf8')//html berubah jadi string
                        const template=handlebars.compile(htmlrender) 
                        const htmlemail=template({name:userslogin[0].username,link:link})

                        transporter.sendMail({
                            from:"DrugStore <Drugstoreofficial@gmail.com>",
                            to:email,
                            subject:'Please confirm your email',
                            html:htmlemail
                        }).then(()=>{
                            userslogin[0].token=token
                            return res.send(userslogin[0])
                        }).catch((err)=>{
                            console.log(err)
                            return res.status(500).send({message:err.message})
                        })
                    })
                })
            }
        })
    },
    Login:(req,res)=>{
        const {username,password}=req.body // ini dari users
        let hashpassword=encrypt(password)
        let sql=`select * from users where username = ? and password = ?`
        db.query(sql,[username,hashpassword],(err,datausers)=>{
            console.log(err)
            if (err) return res.status(500).send({message:err.message})
            if (!datausers.length){
                return res.status(500).send({message:'user tidak terdaftar bro'})
            }
            sql=`select td.qty,p.nama,p.banner,p.price,p.id as idprod,t.id as idtrans 
                from transactionsdetails td 
                join transactions t on td.transactions_id=t.id 
                join product p on td.product_id=p.id
                where t.status='onCart' and t.user_id=?`
            db.query(sql,[datausers[0].id],(err,cart)=>{
                if (err) return res.status(500).send({message:err.message})
                const token=createJWToken({id:datausers[0].id,username:datausers[0].username})
                datausers[0].token=token
                return res.send({datauser:datausers[0],cart:cart})
            })
        })
    },
    keepLogin: async (req,res)=>{
        const {id}=req.params
        let sql=`select * from users where id=${db.escape(id)}`
        try {
            const results= await DbPROMselect(sql)
            sql=`select td.qty,p.nama,p.banner,p.price,p.id as idprod,t.id as idtrans 
                from transactionsdetails td 
                join transactions t on td.transactions_id=t.id 
                join product p on td.product_id=p.id
                where t.status='onCart' and t.user_id=${db.escape(results[0].id)}`
            const cart=await DbPROMselect(sql)
            const token=createJWToken({id:results[0].id,username:results[0].username})
            results[0].token=token
            return res.send({datauser:results[0],cart:cart})          
        } catch (error) {
            return res.status(500).send({message:error.message})
        }
        // DbPROMselect(sql)
        // .then((result)=>{
        //     res.send(result[0])
        // }).catch((err)=>{
        //     return res.status(500).send({message:err.message})
        // })
    }
}