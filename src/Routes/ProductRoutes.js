const Router=require('express').Router()

const {ProductContrrollers}=require('./../controllers')
// const {auth}=require('./../helpers/Auth')

Router.post('/Addproduct',ProductContrrollers.AddProduct)
Router.post('/Addproductfoto',ProductContrrollers.Addproductfoto)
Router.get('/getproduct',ProductContrrollers.getProduct)
Router.get('/getproduct/:id',ProductContrrollers.getProductsdetails)
Router.post('/addinventory',ProductContrrollers.addkimia)
Router.get('/getkimia',ProductContrrollers.getkimia)
Router.post('/adddosis',ProductContrrollers.adddosis)
// cannot get||post||put||delete artinya endpointnya belum adaa
module.exports=Router