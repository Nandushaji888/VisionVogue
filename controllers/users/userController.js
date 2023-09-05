const User = require("../../models/userModel");
const Product = require("../../models/productModel");
const Category = require("../../models/categoryModel");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
require("dotenv").config();
const twilio = require("twilio");
const phoneUtil = require("libphonenumber-js");

//for bcypting password
const securePassword = async (password) => {
  try {
    const passwordHash = await bcrypt.hash(password, 10);

    return passwordHash;
  } catch (error) {
    console.log(error.message);
  }
};

// for sending mail for verification

const generateOTP = () => {
  return Math.floor(Math.random() * 9000 + 1000).toString();
};

const sendVerificationMail = async (name, email) => {
  try {
    const otp = generateOTP();

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
      },
    });

    const message = {
      from: "nandushaji130@gmail.com",
      to: email,
      subject: "Verfication Mail",
      // html : '<p>Hi '+name+', click here to <a href="http://localhost:3000/verify?id='+user_id+'">Verify</a> your mail.</p>'
      text: `Your OTP for email verification with VisionVogue is : ${otp}`,
    };
    // req.session.otp = otp;

    transporter.sendMail(message, (error, info) => {
      if (error) {
        console.log(error);
      } else {
        console.log("Email has been sent :-", info.response);
        // console.log(otp);
        // res.redirect('registration')
      }
    });

    return otp;
  } catch (error) {
    console.log(error.message);
  }
};
//for loading signup page
const loadSignup = async (req, res) => {
  try {
    res.render("signup");
  } catch (error) {
    console.log(error.message);
  }
};

//for sending mail and loading register page with otp send message
const sendOtpAndRenderRegistration = async (req, res) => {
  try {
    console.log(req.body);
    const userDetails = req.body;
    const otp = await sendVerificationMail(userDetails.name, userDetails.email);
    req.session.otp = otp;
    console.log("otp for verification is " + otp);

    res.render("registration", {
      userDetails: userDetails,
      message: "OTP send, Please check your mail for verification",
    });
    console.log("otp for verification is " + otp);
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
      });

      delete req.session.otp;

      await user.save();
      req.session.user_id = user._id;

      res.redirect("/");
    } else {
      res.render("registration", { message: "OTP incorrect, Try Again!" });
    }
  } catch (error) {
    console.log(error.message);
  }
};

//renderig user login

const loadLogin = async (req, res) => {
  try {
    res.render("login");
  } catch (error) {
    console.log(error.message);
  }
};

//verification for user login

const verifyLogin = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;

    const userData = await User.findOne({ email: email }).lean();

    if (userData) {
      if (userData.isActive) {
        console.log("userdata", userData);
        const passwordMatch = await bcrypt.compare(password, userData.password);
        console.log(passwordMatch);

        if (passwordMatch && userData.is_admin === 0) {
          req.session.user_id = userData._id;

          res.redirect("/");
        } else {
          res.render("login", { message: "Email or password incorrect" });
        }
      } else {
        res.render("login", {
          message:
            "Your access has been restricted by the administrator. Please reach out to the administrator at admin@gmail.com for further assistance.",
        });
      }
    } else {
      res.render("login", { message: "Email or password incorrect" });
    }
  } catch (error) {
    console.log(error.message);
  }
};

//for loading home page
// const loadHome = async (req, res) => {
//   try {
//     const productData = await Product.aggregate([
//       {
//         $lookup: {
//           from: "categories",
//           localField: "category",
//           foreignField: "_id",
//           as: "category",
//         },
//       },
//       {
//         $match: {
//           isListed: true,
//           "category.isListed": true,
//         },
//       },
//     ]);
//     const categoryData = await Category.find({ isListed: true });
//     const userData = await User.findById(req.session.user_id);

//     res.render("home", {
//       products: productData,
//       categories: categoryData,
//       user: userData,
//     });
//   } catch (error) {
//     console.log(error.message);
//   }
// };

const loadHome = async (req, res) => {
  try {
    const productData = await Product.find({ isListed: true })
      .populate({
        path: "category",
        match: { isListed: true }, 
      })
      .exec();

      const categoryData = await Category.find({ isListed: true });
      const userData = await User.findById(req.session.user_id);
      const filteredProducts = productData.filter((product) => product.category);

    res.render("home", {
      products: filteredProducts,
      user: userData,
      categories: categoryData,

    });
  } catch (error) {
    console.log(error.message);
  }
};

const userLogout = async (req, res) => {
  try {
    req.session.destroy();
    res.redirect("/");
  } catch (error) {
    console.log(error.message);
  }
};

//for showing a product details

const loadProductDetails = async (req, res) => {
  try {
    const id = req.params.id;
    const productData = await Product.findById(id).populate("category");
    console.log(productData);
    res.render("productDetails", { product: productData });
  } catch (error) {
    console.log(error.message);
  }
};

//for listing category wise product list

const categoryWiseProducts = async (req, res) => {
  try {
    const categoryName = decodeURIComponent(req.params.id);
    console.log(categoryName);
    const category = await Category.findOne({ name: categoryName });

    if (category) {
      console.log(category);

      const products = await Product.find({ category: category._id }).populate(
        "category"
      );
      console.log(products);
      const categoryList = await Category.find({ isListed: true });

      res.render("categoryWiseProducts", {
        products: products,
        categories: categoryList,
      });
    } else {
      console.log("Category not found");
      res.render("categoryWise", { products: [] });
    }
  } catch (error) {
    console.log(error.message);
  }
};
const loadForgotPassword = async (req, res) => {
  try {
    res.render("forgotPassword");
  } catch (error) {
    console.log(error.message);
  }
};

function generateVerificationCode() {
  return Math.floor(Math.random() * 9000 + 1000).toString();
}

const sendVerificationMessage = async (req, res) => {
  console.log(typeof req.body.mno);
  const phone = req.body.mno;
  req.session.password = req.body.password;
  console.log(phone);
  try {
    const userData = await User.findOne({ phone: phone }).lean();
    if (userData) {
      console.log(userData);

      const verificationCode = generateVerificationCode();
      console.log(verificationCode);
      const phoneUtil = require("libphonenumber-js");
      const phoneNumber = req.body.mno;
      const countryCode = "+91";
      const formattedPhoneNumber = phoneUtil.format(
        phoneNumber,
        "IN",
        "International"
      );
      const fullPhoneNumber = formattedPhoneNumber.startsWith(countryCode)
        ? formattedPhoneNumber
        : countryCode + formattedPhoneNumber;

      console.log(fullPhoneNumber);

      const accountSid = process.env.TWILIO_ACCOUNT_SID;
      const authToken = process.env.TWILIO_AUTH_TOKEN;
      const client = twilio(accountSid, authToken);
      // console.log(verificationCode);
      // await client.messages.create({
      //   body: `Your verification code for resetting your password is : ${verificationCode}`,
      //   from: process.env.PHONE,
      //   to: fullPhoneNumber,
      // });
      req.session.otp = verificationCode;
      req.session.mno = phoneNumber;
      res.render("forgotPassOTP", { message: "Check your phone for otp" });
    } else {
      res.render("forgotPassword", {
        message:
          "Mobile Number Not Found: Please verify the number and try again.",
      });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const passwordChange = async (req, res) => {
  try {
    // console.log(req.body.otp);
    console.log(req.session.otp);
    console.log(req.session.password);
    const enteredOtp = req.body.otp;
    const phone = req.session.mno;
    console.log(enteredOtp);
    console.log(phone);
    console.log(enteredOtp === req.session.otp);
    if (enteredOtp === req.session.otp) {
      const newPassword = req.session.password;
      const spassword = await securePassword(newPassword);

      const updatedData = await User.findOneAndUpdate(
        { phone: phone },
        { $set: { password: spassword } }
      );
      if (updatedData) {
        res.render("forgotPassOTP", {
          message: "Password Successfully Updated",
        });
      }
    } else {
      res.render("forgotPassOTP", { message: "Entered OTP is incorrect" });
    }
  } catch (error) {
    console.log(error.mess);
  }
};

const loadAccount = async(req, res) => {
  try {
    res.render('userProfile')
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
  categoryWiseProducts,
  sendVerificationMessage,
  loadForgotPassword,
  passwordChange,
  loadAccount
 
};
