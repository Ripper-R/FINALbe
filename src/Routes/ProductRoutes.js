const Router=require('express').Router()
const productControllers = require('../controllers/productControllers')
const {ProductContrrollers}=require('./../controllers')
// const {auth}=require('./../helpers/Auth')

Router.post('/Addproduct',ProductContrrollers.AddProduct)
Router.post('/Addproductfoto',ProductContrrollers.Addproductfoto)
Router.get('/getproduct',ProductContrrollers.getProduct)
Router.get('/getproduct/:id',ProductContrrollers.getProductsdetails)
Router.post('/addinventory',ProductControllers.addkimia)


// cannot get||post||put||delete artinya endpointnya belum adaa
module.exports=Router