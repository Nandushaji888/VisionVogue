const express = require('express');
const userController = require("../controllers/users/userController");
const cartController = require('../controllers/users/cartController')
const orderController = require('../controllers/users/orderController')
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

//user registration
user_route.get("/register",userController.loadSignup)
user_route.post('/register',userController.sendOtpAndRenderRegistration)
user_route.get('/',userController.loadHome)
user_route.get('/register/verify', userController.loadSignup)
user_route.post('/register/verify', userController.verifyAndRegisterUser)
user_route.post('/resend-otp',userController.resendOtp)


//forgot password
user_route.get('/forgot-password',userController.loadForgotPassword)
user_route.post('/forgot-password',userController.otpForForgotPass)
user_route.get('/password-change',userController.loadForgotPassword)
user_route.post('/password-change',userController.forgotPassword)

//login and logout
user_route.get('/login',auth.isLogout,userController.loadLogin)
user_route.post('/login',userController.verifyLogin)
user_route.get('/logout',auth.isLogin, userController.userLogout)


user_route.get('/product/:id',userController.loadProductDetails)

user_route.get('/category/:id',userController.categoryWiseProducts)


//user cart
user_route.get('/cart',auth.isLogin,cartController.loadCart)
user_route.get('/add-to-cart',auth.isLogin,cartController.addToCart)
user_route.post('/change-quantity',auth.isLogin,cartController.changeQuantity)
user_route.post ('/remove-cart',auth.isLogin,cartController.deleteCartItem)

//check out
user_route.get('/checkout',auth.isLogin,orderController.loadPlaceOrder)
user_route.post('/checkout',auth.isLogin,orderController.postOrder)
// user_route.get('/order-success',auth.isLogin,orderController.orderSuccessPage)
user_route.post('/verify-payment',auth.isLogin,orderController.verifyPayment)


//user account
user_route.get('/user-account',auth.isLogin,userController.loadAccount)
user_route.get('/add-address',auth.isLogin, userController.loadAddAddress)
user_route.post('/add-address',auth.isLogin, userController.addAddress)
user_route.get('/edit-address/:id',auth.isLogin,userController.loadEditAddress)
user_route.post('/edit-address',auth.isLogin,userController.editAddress)
user_route.get('/order-details/:id',auth.isLogin, orderController.loadOrderDetails)
user_route.get('/order-cancel/:id',auth.isLogin, orderController.orderCancellation)
user_route.post('/reset-password',auth.isLogin,userController.resetPassword)
user_route.post('/return',auth.isLogin,orderController.returnProduct)
user_route.get('/search-orderid',auth.isLogin,userController.orderSearch)

user_route.post('/invoice-download',auth.isLogin,userController.downloadInvoice)



user_route.get('/priceLowTohigh',userController.priceLowTohigh)
user_route.get('/priceHighToLow',userController.priceHighToLow)
user_route.post('/search-items', userController.searchResult )
user_route.get('/search-items', userController.searchResult )

//coupon
user_route.post('/apply-coupon',auth.isLogin, userController.applyCoupon )

//wishlist
user_route.get('/wishlist',auth.isLogin,userController.loadWishlist)
user_route.get('/add-to-wishlist',auth.isLogin,userController.addToWishlist)
user_route.get('/remove-wishlist',auth.isLogin,userController.removeWiishlist)
user_route.get('/addcart-from-wishlist',auth.isLogin,userController.cartFromWishlist)

// user_route.get("*",userController.errorPage)

module.exports = user_route;