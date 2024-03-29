const express = require('express');
const adminController = require('../controllers/admin/adminController')
const categoryController = require('../controllers/admin/categoryContoller')
const productController = require('../controllers/admin/productController')
const userController = require('../controllers/admin/userController')
const orderController = require('../controllers/admin/orderController')
const couponController = require('../controllers/admin/couponController')
const bannerController = require('../controllers/admin/bannerController')
const session = require('express-session'); 
const admin_route = express()
const config = require('../config/config');
const auth = require('../middlewares/adminAuth')
const multer = require('multer')
const path = require('path')

const categoryStorage = multer.diskStorage({
  destination :(req,file,cb) => {
    cb(null,path.join(__dirname, '../public/assets2/imgs/category'))
  },
  filename : (req, file, cb) => {
    cb(null, Date.now() +'-'+ file.originalname)
  }
})
const categoryUpload = multer({storage : categoryStorage})

const productStorage = multer.diskStorage({
  destination :(req,file,cb) => {
    cb(null,path.join(__dirname, '../public/assets2/imgs/products'))
  },
  filename : (req, file, cb) => {
    cb(null, Date.now() +'-'+ file.originalname)
  }
})
const productUpload = multer({storage :productStorage})


const bannerStorage = multer.diskStorage({
  destination :(req,file,cb) => {
    cb(null,path.join(__dirname, '../public/assets2/imgs/banners'))
  },
  filename : (req, file, cb) => {
    cb(null, Date.now() +'-'+ file.originalname)
  }
})
const bannerUpload = multer({storage :bannerStorage})

admin_route.use(session({
    secret: config.sessionSecret,
    resave: false, 
    saveUninitialized: false, 
  }));


admin_route.set('view engine', 'ejs')
admin_route.set('views','./views/admin') 
admin_route.use(express.json());
admin_route.use(express.urlencoded({ extended: true }));


admin_route.get('/login',auth.isLogout,adminController.loadLogin)
admin_route.get('/',auth.isLogin, adminController.loadHome)
admin_route.post('/login',adminController.verifyLogin)
admin_route.get('/logout',auth.isLogin, adminController.adminLogout)


admin_route.get('/create-report',auth.isLogin,adminController.generateReport)


admin_route.get('/category',auth.isLogin,categoryController.categoryLoad)
admin_route.post('/category',categoryUpload.single("image") , categoryController.addCategory)
// admin_route.post('/category-search',categoryController.searchCategory)
admin_route.get('/edit-category',auth.isLogin,categoryController.editCategory)
admin_route.post('/edit-category/:id',categoryUpload.single('image'),categoryController.updateCategory)
admin_route.get('/category-status',auth.isLogin, categoryController.categoryStatus)


admin_route.get('/products',auth.isLogin,productController.productList)
admin_route.get('/add-product', auth.isLogin, productController.LoadAddProduct)
admin_route.post('/add-product',productUpload.array("image") ,productController.addProduct)
admin_route.get('/edit-product/:id', auth.isLogin,productController.loadEditProduct)
admin_route.post('/edit-product/:id',productUpload.array("image"),productController.updateProduct)
// admin_route.get('/delete-product/:id', auth.isLogin,productController.deleteProduct)
admin_route.get('/product-status/:id',auth.isLogin,productController.productStatus)
admin_route.get('/delete-image/:id/:img',productController.deleteImage)


admin_route.get('/users', auth.isLogin, userController.loadUsers)
admin_route.get('/edit-user/:id', auth.isLogin, userController.loadEditUser)
admin_route.post('/edit-user/:id',userController.updateUser)
admin_route.get('/user-status/:id', userController.userStatus)


admin_route.get('/orders',auth.isLogin,orderController.loadOrderList)
admin_route.get('/order-details/:id',auth.isLogin,orderController.orderDetails)
admin_route.post('/change-order-status',auth.isLogin,orderController.changeOrderStatus)


admin_route.get('/add-coupon',auth.isLogin,couponController.loadAddCoupon)
admin_route.post('/add-coupon',auth.isLogin,couponController.addCoupon)
admin_route.get('/coupon',auth.isLogin,couponController.loadCouponList)
admin_route.get('/coupon-status/:id',auth.isLogin,couponController.couponStatus)


admin_route.get('/add-banner',auth.isLogin,bannerController.loadAddBanner)
admin_route.post('/add-banner',auth.isLogin,bannerUpload.single("image"),bannerController.addBanner)
admin_route.get('/banners',auth.isLogin,bannerController.loadBannerList)
admin_route.get('/banner-status/:id',auth.isLogin,bannerController.bannerStatus)


module.exports = admin_route;