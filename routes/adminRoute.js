const express = require('express');
const adminController = require('../controllers/admin/adminController')
const categoryController = require('../controllers/admin/categoryContoller')
const session = require('express-session'); 
const admin_route = express()
const config = require('../config/config');
const auth = require('../middlewares/adminAuth')
const multer = require('multer')
const path = require('path')


const storage = multer.diskStorage({
  destination :(req,file,cb) => {
    cb(null,path.join(__dirname, '../public/assets2/imgs/category'))
  },
  filename : (req, file, cb) => {
    cb(null, Date.now() +'-'+ file.originalname)
  }
})
const upload = multer({storage : storage})

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


admin_route.get('/category',auth.isLogin,categoryController.categoryLoad)
admin_route.post('/category',upload.single("image") ,auth.isLogin, categoryController.addCatgory)
admin_route.post('/category-search',auth.isLogin,categoryController.searchCategory)
admin_route.get('/edit-category',auth.isLogin,categoryController.editCategory)
admin_route.post('/edit-category',auth.isLogin,categoryController.updateCategory)


// admin_route.get('/products',auth.isLogin,adminController.productList)
// admin_route.get('/add-product', auth.isLogin, adminController.addProduct)


module.exports = admin_route;