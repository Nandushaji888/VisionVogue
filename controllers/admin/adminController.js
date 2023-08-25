const User = require('../../models/userModel')
const bcrypt = require('bcrypt');


//admin login

const loadLogin = async(req, res) => {
    try {
        res.render('adminLogin')
    } catch (error) {
        console.log(error.message);
    }
}





const verifyLogin = async(req, res) => {
    try {
        const email = req.body.email;
    const password = req.body.password;


    const adminData = await User.findOne({email:email})

    if(adminData) {
      const passwordMatch = await bcrypt.compare(password,adminData.password)

      if(passwordMatch && adminData.is_admin === 1) {
        
        req.session.admin = adminData._id
        res.redirect('/admin')
      }else{
        res.render('adminLogin', {message :'Email or password incorrect'})

      }
    }else{
        res.render('adminLogin', {message :'Email or password incorrect'})
    }
    } catch (error) {
        console.log(error.message);
    }
}




const loadHome = async(req, res) => {
    try {
        const adminData = await User.findById({_id:req.session.admin}) 
        res.render('adminHome', {adminData: adminData})
    } catch (error) {
        console.log(error.message);
    }
}

// const productList = async(req, res) => {
//     try {
//         res.render('products')
//     } catch (error) {
//         console.log(error.message);
//     }
// }

// const addProduct = async(req, res) => {
//     try {
//         res.render('addProduct')
//     } catch (error) {
//         console.log(error.message);
//     }
// }

const adminLogout = async(req, res) => {
    try {
        req.session.destroy()
        res.redirect('/admin')
    } catch (error) {
        console.log(error.message);
    }
}







module.exports = {
    loadLogin,
    loadHome,
    verifyLogin,
    adminLogout,
  
}
