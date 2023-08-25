const express = require('express');
const userController = require("../controllers/users/userController");
const session = require('express-session');
const user_route = express()
const config = require('../config/config');
const auth = require('../middlewares/Auth')



user_route.use(session({
    secret: config.sessionSecret,
    resave: false, 
    saveUninitialized: false, 
  }));

user_route.set('view engine', 'ejs')
user_route.set('views','./views/users') 
user_route.use(express.json());
user_route.use(express.urlencoded({ extended: true }));



user_route.get("/register",userController.loadSignup)
user_route.post('/register',userController.sendOtpAndRenderRegistration)
user_route.get('/',userController.loadHome)
// user_route.get('/register/verify')
user_route.post('/register/verify', userController.verifyAndRegisterUser)
user_route.get('/home', userController.loadHome)


user_route.get('/login',userController.loadLogin)
user_route.post('/login',userController.verifyLogin)

module.exports = user_route;