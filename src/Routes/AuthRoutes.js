const Router=require('express').Router()
const { getuserid } = require('../controllers/AuthControllers')
const {AuthControllers}=require('./../controllers')
// const {auth}=require('./../helpers/Auth')

Router.post('/register',AuthControllers.register)
Router.post('/login',AuthControllers.Login)
Router.get('/keeplogin/:id',AuthControllers.keepLogin)
Router.get('/getuserid'  ,AuthControllers.getuserid)
// Router.post('/login',AuthControllers.Login)
// Router.post('/sendverify',AuthControllers.sendverified)
// Router.get('/verified',auth,AuthControllers.verified)
// Router.get('/keeplogin/:id',AuthControllers.keeplogin)

// cannot get||post||put||delete artinya endpointnya belum adaa
module.exports=Router