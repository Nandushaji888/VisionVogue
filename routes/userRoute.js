const express = require('express');
const userController = require("../controllers/users/userController");
const cartController = require('../controllers/users/cartController')
const session = require('express-session');
const user_route = express()
const config = require('../config/config');
const auth = require('../middlewares/Auth')



user_route.use(session({
    secret: config.sessionSecret,
    resave: false, 
    saveUninitialized: false, 
    cookie : {maxAge : 600000}
  }));

user_route.set('view engine', 'ejs')
user_route.set('views','./views/users') 
user_route.use(express.json());
user_route.use(express.urlencoded({ extended: true }));



user_route.get("/register",userController.loadSignup)
user_route.post('/register',userController.sendOtpAndRenderRegistration)
user_route.get('/',userController.loadHome)
user_route.get('/register/verify', userController.loadSignup)
user_route.post('/register/verify', userController.verifyAndRegisterUser)

user_route.get('/forgot-password',userController.loadForgotPassword)
user_route.post('/forgot-password',userController.sendVerificationMessage)
user_route.get('/password-change',userController.loadForgotPassword)
user_route.post('/password-change',userController.passwordChange)


user_route.get('/login',auth.isLogout,userController.loadLogin)
user_route.post('/login',userController.verifyLogin)
user_route.get('/logout',auth.isLogin, userController.userLogout)

user_route.get('/product/:id',userController.loadProductDetails)

user_route.get('/category/:id',userController.categoryWiseProducts)

user_route.get('/cart',cartController.loadCart)
user_route.post('/add-to-cart/:id',cartController.addToCart)
user_route.get('/user-account',userController.loadAccount)



module.exports = user_route;