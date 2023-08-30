const User = require('../../models/userModel');
const Product = require('../../models/productModel')
const Category = require('../../models/categoryModel')
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const {EMAIL, PASSWORD} = require('../../env.js')



const securePassword = async(password) => {
    try {
       const passwordHash = await bcrypt.hash(password,10);

       return passwordHash

    } catch (error) {
        console.log(error.message);
    }
}

// for sending mail 

const generateOTP = () => {
    return Math.floor(Math.random() * 9000 + 1000).toString()
};

const sendVerificationMail = async(name,email) => {
    try {
        const otp = generateOTP();

     const transporter = nodemailer.createTransport({
            host : 'smtp.gmail.com',
            post : 587,
            secure : false,
            requireTLS : true,
            auth : {
                user :EMAIL,
                pass:PASSWORD
            }
        })

    
      
        const message = {
            from : 'nandushaji130@gmail.com',
            to : email,
            subject :'Verfication Mail',
            // html : '<p>Hi '+name+', click here to <a href="http://localhost:3000/verify?id='+user_id+'">Verify</a> your mail.</p>'
            text : `Your OTP for email verification with VisionVogue is : ${otp}`
        }
        // req.session.otp = otp;

        transporter.sendMail(message,(error,info) => {
            if(error) {
                console.log(error);
            }
            else{
                console.log('Email has been sent :-',info.response);
                // res.redirect('registration')
            }
        })

        return otp;

    } catch (error) {
        console.log(error.message);
    }
}

const loadSignup = async(req,res) => {
    try {
        res.render('signup');

    } catch (error) {
        console.log(error.message);
    }
}
const sendOtpAndRenderRegistration = async (req, res) => {
    try {
        const userDetails = req.body; 
        const otp = await sendVerificationMail(userDetails.name, userDetails.email);
        req.session.otp = otp;
        res.render('registration', { userDetails:userDetails,message : 'OTP send, Please check your mail for verification'});
    } catch (error) {
        console.log(error.message);
    }
};

const verifyAndRegisterUser = async (req, res) => {
    
    try {
        const userDetails = req.body;
        const enteredOtp = req.body.otp; 

        console.log("Session OTP:", req.session.otp);
        console.log("Entered OTP:", enteredOtp);

        if (enteredOtp === req.session.otp) {
            const spassword = await securePassword(userDetails.password);

            const user = new User({
                name: userDetails.name,
                email: userDetails.email,
                phone: userDetails.mno,
                password: spassword,
                is_admin: 0,
                // is_verified: 1 
            });

            delete req.session.otp

            await user.save();

            res.render('registration', { message: 'User successfully registered' });
        } else {
            res.render('registration', { message: 'OTP incorrect, Try Again!' });
        }
    } catch (error) {
        console.log(error.message);
    }
};


//user login

const loadLogin = async(req, res) => {
    try {
        res.render('login')
    } catch (error) {
        console.log(error.message);
    }
}

const verifyLogin = async(req, res) => {

    try{
    const email = req.body.email;
    const password = req.body.password;

    const userData = await User.findOne({email:email}).lean()

    if(userData) {
        console.log("userdata",userData);
      const passwordMatch = await bcrypt.compare(password,userData.password)
        console.log(passwordMatch);

      if(passwordMatch && userData.is_admin === 0) {

        req.session.user_id = userData._id;

        res.redirect('/')
      }else{
        res.render('login', {message :'Email or password incorrect'})

      }
    }else{
        res.render('login', {message :'Email or password incorrect'})
    }
}catch (error){
    console.log(error.message);
}
}

const loadHome = async(req, res) => {
    try {
        const productData = await Product.find({isListed : true}).populate('category')
        const categoryData = await Category.find({isListed : true})
        console.log(categoryData);
        const userData = await User.findById(req.session.user_id)
        console.log(userData);

        res.render('home',{products : productData, categories : categoryData, user : userData})
    } catch (error) {
        console.log(error.message);
    }
}
const userLogout = async(req, res) => {
    try {
        req.session.destroy()
        res.redirect('/')
    } catch (error) {
        console.log(error.message);
    }
}

const loadProductDetails = async(req, res) => {
    try {
        const id = req.params.id;
        const productData = await Product.findById(id).populate('category')
        console.log(productData);
        res.render('productDetails',{product : productData})
    } catch (error) {
        console.log(error.message);
    }
}
const categoryWiseProducts = async (req, res) => {
    try {
        const categoryName = decodeURIComponent(req.params.id);
        console.log(categoryName);
        const category = await Category.findOne({ name: categoryName });

        if (category) {
            console.log(category);

            const products = await Product.find({ category: category._id }).populate('category')
            console.log(products);

            res.render('categoryWiseProducts', { products: products });
        } else {
            console.log("Category not found");
            res.render('categoryWise', { products: [] });
        }
    } catch (error) {
        console.log(error.message);
    }
}









module.exports = {
    loadSignup,
    sendOtpAndRenderRegistration,
    verifyAndRegisterUser,
    loadLogin,
    verifyLogin,
    loadHome,
    userLogout,
    loadProductDetails,
    categoryWiseProducts

}