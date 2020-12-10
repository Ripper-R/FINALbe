const {db}=require('../connections')
const {uploader}=require('../helpers/uploader')
const fs=require('fs')

module.exports={
    AddProduct:(req,res)=>{
        try {
            const path='/product'//ini terserah
            const upload=uploader(path,'PROD').fields([{ name: 'image'}])
            upload(req,res,(err)=>{
                if(err){
                    return res.status(500).json({ message: 'Upload picture failed !', error: err.message });
                }
                console.log('berhasil upload')
               
                const {image} = req.files;
                console.log(image)
                // console.log(robin)
                const imagePath = image ? path + '/' + image[0].filename : null;
                console.log(imagePath)
                console.log(req.body.data)
                const data = JSON.parse(req.body.data); 
                let datainsert={
                    nama:data.nama,
                    price:data.price,
                    deskripsi:data.deskripsi,
                    banner:imagePath,
                }
                // data.banner=imagePath
                console.log(datainsert)
                // res.send('berhasil')
                db.query('insert into product set ?',datainsert,(err)=>{
                    if (err){
                        if(imagePath){
                            fs.unlinkSync('./public'+imagePath)
                        }
                        return res.status(500).send(err)
                    }
                    let sql=`select * from product`
                    db.query(sql,(err,dataproduct)=>{
                        if (err) return res.status(500).send(err)
                        return res.status(200).send(dataproduct)
                    })
                })
            })
        } catch (error) {
            return res.status(500).send(error)
        }
    },
    getProduct:(req,res)=>{
        let sql=    `select * from product`
        db.query(sql,(err,dataproduct)=>{
            if (err) return res.status(500).send(err)
            return res.status(200).send(dataproduct)
        })
    },
    Addproductfoto:(req,res)=>{
        try {
            const path='/product/foto'//ini terserah
            const upload=uploader(path,'FOTOPROD').fields([{ name: 'image'}])
            upload(req,res,(err)=>{
                if(err){
                    return res.status(500).json({ message: 'Upload picture failed !', error: err.message });
                }
                console.log('berhasil upload')
                console.log(req.files)
                const {image} = req.files;
                console.log(image)
                // console.log(robin)
                const datamany=[]
                const data = JSON.parse(req.body.data); 
                
                // console.log(imagePaths)
                console.log(data,'data')
                let imagePath
                image.forEach(val=>{
                    imagePath =  path + '/' + val.filename
                    datamany.push([imagePath,data.product_id])
                })
                // const imagePath = image ? path + '/' + image[0].filename : null;
                // res.send('berhasil')
                console.log(datamany)
                db.query('insert into productfoto (gambar,product_id) VALUES ?',[datamany],(err)=>{
                    if (err){
                        // kalo insert gagal hapus foto
                        image.forEach(val=>{
                            imagePath =  path + '/' + val.filename
                            fs.unlinkSync('./public'+ imagePath)
                        })
                        console.log(err)
                        return res.status(500).send(err)
                    }
                    return res.status(200).send('success')
                    // let sql=`select * from product`
                    // db.query(sql,(err,dataproduct)=>{
                    //     if (err) return res.status(500).send(err)
                    // })
                })
            })
        } catch (error) {
            return res.status(500).send(error)
        }
    },
    getProductsdetails:(req,res)=>{
        const {id}=req.params
        let sql=`select * from product where id=?`
        db.query(sql,id,(err,dataprod)=>{
            if (err){
                return res.status(500).send(err.message)
            }
            sql=`select * from  productfoto where product_id=?`
            db.query(sql,id,(err,datafoto)=>{
                if (err){
                    return res.status(500).send(err.message)
                }
                return res.status(200).send({dataprod:dataprod[0],datafoto})
            })
        })
    },
    addkimia:(req,res)=>{
           const data=req.body
           console.log(data)
           let datain={
                stock:data.stock,
                nama:data.nama,
                kimia_id:data.kimia_id
           }
           console.log(datain)
           db.query('insert into inventory join set ?',datain,(err)=>{
               if(err) {
                console.log(err)   
                res.status(500).send(err)
               }
               let sql='select * from inventory'
               db.query(sql,(err,dataa)=>{
                   if (err) return res.status(500).send(err)
                   return res.status(200).send(dataa)
                })
           })
    },
    getkimia:(req,res)=>{
        let sql='select * , sum(inventory.stock) as sum from inventory  join kimia on inventory.kimia_id=kimia.id group by inventory.kimia_id' 
               db.query(sql,(err,dataa)=>{
                   if (err) return res.status(500).send(err)
                   return res.status(200).send(dataa)
                })
    },
    adddosis:(req,res)=>{
        const data=req.body
           console.log(data)
           let datain={
                product_id:data.product_id,
                kimia_id:data.kimia_id,
                dosis:data.dosis
           }
           console.log(datain)
           db.query('insert into product_details set ?',datain,(err)=>{
               if(err) {
                console.log(err)   
                res.status(500).send(err)
               }
               let sql='select * from product_details'
               db.query(sql,(err,dataa)=>{
                   if (err) return res.status(500).send(err)
                   return res.status(200).send(dataa)
                })
           })
    }
}
