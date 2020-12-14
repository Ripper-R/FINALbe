const {db,querysql}=require('../connections')
const {uploader}=require('../helpers/uploader')
const {transporter}=require('../helpers')
const fs=require('fs')
const handlebars=require('handlebars')
const QueryProm=(sql)=>{
return new Promise((resolve,reject)=>{
    db.query(sql,(err,results)=>{
        // console.log('masuk await')
        if (err){
            reject(err)
        }else{
            resolve(results)
        } 
    })
})
}
module.exports={
Addtocart:(req,res)=>{
    const {userid,productid,qty}=req.body
    let sql=`select * from transactions where status='onCart' and user_id=${db.escape(userid)}` 
//db escape = prevent user abusing product
    db.query(sql,(err,results)=>{
        console.log(results)
        if (err){
            console.log(err)
            return res.status(500).send(err)
        }
        
        if(results.length){
            sql=`select * from transactionsdetails where product_id=${db.escape(productid)} and transactions_id=${db.escape(results[0].id)}`
            db.query(sql,(err,results1)=>{
                if (err){  
                    return res.status(500).send(err) 
                }
                if(results1.length){ //kalo results1.length true maka kita hanya perlu update qty
                    let dataupdate={
                        qty:parseInt(results1[0].qty)+parseInt(qty)
                    }
                    sql=`update transactionsdetails set ? where product_id=${db.escape(results1[0].product_id)} and transactions_id=${db.escape(results1[0].transactions_id)}`
                    db.query(sql,dataupdate,(err)=>{
                        if (err){  
                            return res.status(500).send(err) 
                        }
                        sql=`select td.qty,p.nama,p.banner,p.price,p.id as idprod,t.id as idtrans 
                        from transactionsdetails td 
                        join transactions t on td.transactions_id=t.id 
                        join product p on td.product_id=p.id
                        where t.status='onCart' and t.user_id=?`
                        db.query(sql,[userid],(err,datacart)=>{
                            if (err){
                                console.log(err)
                                return res.status(500).send(err)
                            }
                            return res.send(datacart)
                        })
                    })
                }else{
                    // klo product di cart belum ada
                    let datainsert={
                        product_id:productid,
                        transactions_id:results[0].id,
                        qty:qty
                    }
                    sql=`insert into transactionsdetails set ?`
                    db.query(sql,datainsert,(err)=>{
                        if (err){  
                            return res.status(500).send(err) 
                        }
                        sql=`select td.qty,p.nama,p.banner,p.price,p.id as idprod,t.id as idtrans 
                        from transactionsdetails td 
                        join transactions t on td.transactions_id=t.id 
                        join product p on td.product_id=p.id
                        where t.status='onCart' and t.user_id=?`
                        db.query(sql,[userid],(err,datacart)=>{
                            if (err){
                                console.log(err)
                                return res.status(500).send(err)
                            }
                            return res.send(datacart)
                        })
                    })
                }
            })
        }else{
            //kalo cart bener-bener kosong
            let data={
                tanggal:new Date(),
                status:"oncart",
                user_id:userid
            }
            console.log('Test')
            db.beginTransaction((err)=>{
                if (err) { 
                    console.log(err)
                    return res.status(500).send(err) 
                }
                sql=`insert into transactions set ?`
                db.query(sql,data,(err,result1)=>{
                    if (err){
                        console.log(err)
                        return db.rollback(()=>{
                            res.status(500).send(err)
                        }) 
                    }
                    data={
                        product_id:productid,
                        transactions_id:result1.insertId,
                        qty:qty
                    }
                    sql=`insert into transactionsdetails set ?`
                    db.query(sql,data,(err)=>{
                        if (err){
                            return db.rollback(()=>{
                                res.status(500).send(err)
                            }) 
                        }
                        db.commit((err)=>{
                            if (err){
                                return db.rollback(()=>{
                                    res.status(500).send(err)
                                }) 
                            }
                            sql=`select td.qty,p.nama,p.banner,p.price,p.id as idprod,t.id as idtrans 
                            from transactionsdetails td 
                            join transactions t on td.transactions_id=t.id 
                            join product p on td.product_id=p.id
                            where t.status='onCart' and t.user_id=?`
                            db.query(sql,[userid],(err,datacart)=>{
                                if (err){
                                    console.log(err)
                                    return res.status(500).send(err)
                                }
                                return res.send(datacart)
                            })
                        })
                    })
                })
            })
        }
    })
},
getCart:(req,res)=>{
    const {userid}=req.query
    sql=`select td.qty,p.nama,p.banner,p.price,p.id as idprod,t.id as idtrans 
    from transactionsdetails td 
    join transactions t on td.transactions_id=t.id 
    join product p on td.product_id=p.id
    where t.status='onCart' and t.user_id=?`
    db.query(sql,[userid],(err,datacart)=>{
        if (err){
            console.log(err)
            return res.status(500).send(err)
        }
        return res.send(datacart)
    })
},

clearCart:(req,res)=>{
const {datacart}=req.body
let sql=`DELETE from transactions where status='onCart'`
db.query(sql,[datacart],(err,result)=>{
    if (err){
        console.log(err)
        return res.status(500).send(err)
    }
    return res.send(result)
    })

},

onbayarCC:(req,res)=>{
    const {idtrans,nomercc,datacart}=req.body
    let sql=`update transactions set ? where id=${db.escape(idtrans)}` 
    let dataupdate={
        tanggal:new Date(),
        status:'completed',
        metode:'cc',
        buktipembayaran:nomercc
    }
    db.query(sql,dataupdate,(err)=>{
        console.log(err)
        if (err){
            console.log(err)
            return res.status(500).send(err)
        }
        let arr=[]
        datacart.forEach((val)=>{
            arr.push(QueryProm(`update transactionsdetails set totalprice=${val.price} where transactions_id=${val.idtrans} and product_id=${val.idprod}`))
        })
        Promise.all(arr).then(()=>{
            return res.send('berhasil')// nggak perlu get cart lagi karena cart kalo berhasil otomatis kosong 
        }).catch((err)=>{
            console.log(err)
            return res.status(500).send(err)
        })
        
    })
},
uploadPembayaran:(req,res)=>{

    const path='/buktipembayaran'//ini terserah
    const upload=uploader(path,'BUKTI').fields([{ name: 'bukti'}])
    upload(req,res,(err)=>{
        if(err){
            return res.status(500).json({ message: 'Upload picture failed !', error: err.message });
        }
        const {bukti} = req.files;
        console.log(bukti)
        // console.log(robin)
        const imagePath = bukti ? path + '/' + bukti[0].filename : null;
        console.log(imagePath)
        // console.log(req.body.data)
        const data = JSON.parse(req.body.data); 
        let sql=`update transactions set ? where id=${db.escape(data.idtrans)}` 
        let dataupdate={
            tanggal:new Date(),
            status:'OnwaitingApprove',
            metode:'bukti',
            buktipembayaran:imagePath
        }
        db.query(sql,dataupdate,(err)=>{
            if (err){
                if(imagePath){
                    fs.unlinkSync('./public'+imagePath)
                }
                return res.status(500).send(err)
            }
            return res.send('berhasil')// nggak perlu get cart lagi karena cart kalo berhasil otomatis kosong
        })
    })
},

inventDec:async (req,res)=>{
    try{
    const {datacart}=req.body
    // console.log(req.body)
    let sql=`SELECT * FROM product_details
    JOIN transactionsdetails ON transactionsdetails.product_id=product_details.product_id
    JOIN inventory ON product_details.kimia_id=inventory.kimia_id
    WHERE transactions_id=${datacart[0].idtrans}`
    const hasil= await QueryProm(sql)
    console.log(hasil)
    hasil.forEach(async (val) => {
        // sql = `SELECT stock FROM inventory where kimia_id=${val.kimia_id}`
        let sql2 = `UPDATE inventory i,( SELECT stock FROM inventory where id=${val.kimia_id}) as t1
            SET i.stock = t1.stock - (${val.dosis * val.qty})
            WHERE i.id = ${val.kimia_id};`
            await QueryProm(sql2)
        })        
    }   catch(err){
        return res.status(500).send({message:error.message})
    }
},

        // db.query(sql,(err,response)=>{
        //     if (err){
        //         console.log(err)
        //         return res.status(500).send(err)
        //     }
        //     console.log(response[0].stock)
        //     sql2 = `UPDATE inventory SET stock = ${response[0].stock - (val.dosis * val.qty)} WHERE id=${val.kimia_id}`
        //     console.log(sql2)
        // })
        // db.query(sql2,(err,response)=>{
        //     if (err){
        //         console.log(err)
        //         return res.status(500).send(err)
        //     }
        //     console.log(response.message)
        // })
        // try{
            // try{
            //     let sql2 = `SELECT stock FROM inventory where kimia_id=${val.kimia_id}`
            //     let stockNow = await QueryProm(sql2)
            //     let newStock = await stockNow[0].stock - (val.dosis * val.qty)
            //     console.log(stockNow)
            //     console.log(newStock)
            //     let sql3 = `UPDATE inventory SET stock = ${await stockNow[0].stock - (val.dosis * val.qty)} WHERE id=${val.kimia_id}`
            //     console.log(sql3)
            //     let newestStock = await QueryProm(sql3)
            //     console.log(newestStock.message)

            // }catch(err){
            //     return res.status(500).send({message:error.message})
            // }

        
        //     for (let i = 0; i < datacart.length; i++) {
        //         // console.log(datacart[i].idprod)
        //         let sql=`SELECT product_id, kimia_id, dosis  FROM product_details where product_id=${datacart[i].idprod}`
        //         console.log(sql)
                
        //         let  result= await QueryProm(sql)
        //         console.log(result[i])
        //         product_details.push(result[0])
        //     }
        //     console.log(product_details)
        //     for (let i = 0; i < await  product_details.length; i++) {
        //         // console.log(datacart[i].idprod)
        //         let sql1=`SELECT stock from inventory where kimia_id=${product_details[i].kimia_id}`
        //         let stockinv = await QueryProm(sql1)
        //         // console.log(stockinv)
        //         // console.log(sql1)
        //     }
        //         // console.log(product_details[0].kimia_id)
        
        
        //     // })

    


    
    

getAdminwaittingApprove:(req,res)=>{
    let sql=`select * from transactions where status='onwaitingapprove'`
    db.query(sql,(err,waitingapprove)=>{
        if (err){
            console.log(err)
            return res.status(500).send(err)
        }
        return res.send(waitingapprove)
    })
},
AdminApprove:(req,res)=>{
    const {id}=req.params
    let sql=`update transactions set ? where id=${db.escape(id)}`
    let dataupdate={
        status:'completed'
    }
    db.query(sql,dataupdate,(err)=>{
        if (err){
            console.log(err)
            return res.status(500).send(err)
        }
        sql=`select * from transactions where id=${db.escape(id)}`
        db.query(sql,(err,datatrans)=>{
            if (err){
                console.log(err)
                return res.status(500).send(err)
            }
            
            sql=`select * from users where id=${db.escape(datatrans[0].user_id)}`
            db.query(sql,(err,datausers)=>{
                if (err){
                    console.log(err)
                    return res.status(500).send(err)
                }
                const htmlrender=fs.readFileSync('./template/notif.html','utf8')//html berubah jadi string
                const template=handlebars.compile(htmlrender) 
                const htmlemail=template({message:'sleamat udah di approve bro'})
                transporter.sendMail({
                    from:"Opentrip hiha <dinotestes12@gmail.com>",
                    to:datausers[0].email,
                    subject:'Payment',
                    html:htmlemail
                },(err)=>{
                    if (err){
                        console.log(err)
                        return res.status(500).send(err)
                    }
                    this.getAdminwaittingApprove(req,res)
                })
            })
        })
    
        // let sql=`select * from transactions where status='onwaitingapprove'`
        // db.query(sql,(err,waitingapprove)=>{
        //     if (err){
        //         console.log(err)
        //         return res.status(500).send(err)
        //     }
        //     return res.send(waitingapprove)
        // })
    })
},
Adminreject:(req,res)=>{
    const {id}=req.params
    let sql=`update transactions set ? where id=${db.escape(id)}`
    let dataupdate={
        status:'rejected'
    }
    db.query(sql,dataupdate,(err)=>{
        if (err){
            console.log(err)
            return res.status(500).send(err)
        }
        this.getAdminwaittingApprove(req,res)
        // let sql=`select * from transactions where status='onwaitingapprove'`
        // db.query(sql,(err,waitingapprove)=>{
        //     if (err){
        //         console.log(err)
        //         return res.status(500).send(err)
        //     }
        //     return res.send(waitingapprove)
        // })
    })
},

}
