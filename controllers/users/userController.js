const User = require("../../models/userModel");
const Product = require("../../models/productModel");
const Category = require("../../models/categoryModel");
const Order = require("../../models/orderModel");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const mongoose = require("mongoose");
require("dotenv").config();
const twilio = require("twilio");
const phoneUtil = require("libphonenumber-js");
const Coupon = require("../../models/couponModel");
const Banner = require("../../models/bannerModel");

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
  return Math.floor(Math.random() * 900000 + 10000).toString();
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

//
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

const resendOtp = async (req, res) => {
  try {
    console.log(req.body);
    const userData = req.body;
    const resentOtp = await sendVerificationMail(userData.name, userData.email);
    console.log("old" + req.session.otp);
    console.log("old" + req.session.id);
    req.session.otp = resentOtp;
    req.session.save();
    console.log(req.session.otp);
    console.log(resentOtp);
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
    const categories = await Category.find();
    const user = req.session.user_id;
    console.log('hereeeee4');
    res.render("login", { user: user, categories: categories });
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
        const passwordMatch = await bcrypt.compare(password, userData.password);

        if (passwordMatch && userData.is_admin === 0) {
          req.session.user_id = userData._id;
          const originalURL = req.session.originalURL || "/";
          console.log(originalURL);
          delete req.session.originalURL;
          res.json({ success: true, originalURL });
        } else {
          res.status(401).json({ success: false });
        }
      } else {
        res.status(403).json({
          success: false,
        });
      }
    } else {
      res.status(401).json({ success: false });
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      success: false,
      message: "An error occurred while processing your request.",
    });
  }
};

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

    if (userData) {
      console.log(userData.cart.length);
    }
    const banner = await Banner.find({ isListed: true });

    res.render("home", {
      products: filteredProducts,
      user: userData,
      categories: categoryData,
      banner: banner,
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
    req.session.originalURL = `/product/${id}`;
    const productData = await Product.findById(id).populate("category");
    console.log(productData);
    const categories = await Category.find();
    const user = await User.findById(req.session.user_id);
    res.render("productDetails", {
      product: productData,
      user: user,
      categories: categories,
    });
  } catch (error) {
    console.log(error.message);
  }
};

function paginateQuery(query, page, limit) {
  try {
    const skip = (page - 1) * limit;
    return query.skip(skip).limit(limit);
  } catch (error) {
    console.error("Error in paginateQuery:", error);
    throw error;
  }
}

const searchResult = async (req, res) => {
  try {
    // const search = req.body.search;
    if (req.body.search) {
      req.session.search = req.body.search;
    }

    let search = req.session.search || "";
    console.log("search " + search);
    const categoryList = await Category.find({ isListed: true });
    const categoryName = await Category.find({
      name: { $regex: search, $options: "i" },
    });

    // Calculate page and limit based on query parameters
    var page = 1;
    if (req.query.page) {
      page = req.query.page;
    }
    const limit = 3;

    const productsQuery = Product.find({
      isListed: true,
      $or: [
        { name: { $regex: search, $options: "i" } },
        { category: { $in: categoryName } },
        { brand: { $regex: search, $options: "i" } },
      ],
    }).populate("category");

    const count = await Product.find({
      isListed: true,
      $or: [
        { name: { $regex: search, $options: "i" } },
        { category: { $in: categoryName } },
        { brand: { $regex: search, $options: "i" } },
      ],
    })
      .populate("category")
      .countDocuments();
    // console.log("productsQuery is" + productsQuery.getFilter());

    const products = await paginateQuery(productsQuery, page, limit).exec();
    console.log("products", products);

    console.log("count is " + count);

    const user = await User.findById(req.session.user_id);
    

    res.render("categoryWiseProducts", {
      products: products,
      categories: categoryList,
      user: user,
      pathurl: null,
      totalPages: Math.ceil(count / limit),
      count: count,
      page: page,
      search: search,
    });
  } catch (error) {
    console.log(error.message);
  }
};

//for listing category wise product list

const categoryWiseProducts = async (req, res) => {
  try {
    const categoryName = decodeURIComponent(req.params.id);

    req.session.originalURL = `/category/${categoryName}`;
    const pathurl = `${categoryName}`;
    // console.log(categoryName);
    const category = await Category.findOne({ name: categoryName });

    if (category) {
      // console.log(category);
      var page = 1;
      if (req.query.page) {
        page = req.query.page;
      }
      const limit = 3;
      const productsQuery = Product.find({ category: category._id })
        .populate("category")
        .sort({ createdAt: -1 });

      const products = await paginateQuery(productsQuery, page, limit).exec();
      const count = await Product.find({ category: category._id })
        .populate("category")
        .countDocuments();
      console.log("count is " + count);

      // console.log(products);
      const categoryList = await Category.find({ isListed: true });

      const user = await User.findById(req.session.user_id);

      res.render("categoryWiseProducts", {
        products: products,
        categories: categoryList,
        user: user,
        pathurl: pathurl,
        totalPages: Math.ceil(count / limit),
        count: count,
        page: page,
        search: undefined,
      });
    } else {
      console.log("Category not found");
      res.render("categoryWise", { products: [] });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const priceLowTohigh = async (req, res) => {
  try {
    console.log(req.query.url);
    const categoryName = decodeURIComponent(req.params.id);

    // const pathurl = `${categoryName}`;
    const category = await Category.findOne({ name: categoryName });

    // if (category) {
    console.log(category);
    var page = 1;
    if (req.query.page) {
      page = req.query.page;
    }

    const limit = 3;
    const productsQuery = Product.find({ category: category._id })
      .populate("category")
      .sort({ price: -1 });

    const products = await paginateQuery(productsQuery, page, limit).exec();

    // const products = await paginateQuery(productsQuery, page, limit).exec();
    const count = await Product.find({ category: category._id })
      .populate("category")
      .countDocuments();
    console.log("count is " + count);

    console.log(products);
    const categoryList = await Category.find({ isListed: true });

    const user = await User.findById(req.session.user_id);
    let search = req.session.search || "";

    res.render("categoryWiseProducts", {
      products: products,
      categories: categoryList,
      user: user,
      pathurl: pathurl,
      totalPages: Math.ceil(count / limit),
      count: count,
      page: page,
      search: search,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error", msg: "Internal server error" });
  }
};

const priceHighToLow = async (req, res) => {
  try {
    const categoryName = decodeURIComponent(req.params.id);
    const pathurl = `/${categoryName}`;
    const category = await Category.findOne({ name: categoryName });

    if (category) {
      console.log(category);
      var page = 1;
      if (req.query.page) {
        page = req.query.page;
      }

      const limit = 3;
      const productsQuery = Product.find({ category: category._id })
        .populate("category")
        .sort({ price: 1 });

      const products = await paginateQuery(productsQuery, page, limit).exec();

      // const products = await paginateQuery(productsQuery, page, limit).exec();
      const count = await Product.find({ category: category._id })
        .populate("category")
        .countDocuments();
      console.log("count is " + count);

      console.log(products);
      const categoryList = await Category.find({ isListed: true });

      const user = await User.findById(req.session.user_id);
      let search = req.session.search || "";

      res.render("categoryWiseProducts", {
        products: products,
        categories: categoryList,
        user: user,
        pathurl: pathurl,
        totalPages: Math.ceil(count / limit),
        count: count,
        page: page,
        search: search,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error", msg: "Internal server error" });
  }
};

const loadForgotPassword = async (req, res) => {
  try {
    res.render("forgotPassword");
  } catch (error) {
    console.log(error.message);
  }
};

const otpForForgotPass = async (req, res) => {
  try {
    console.log(req.body);
    //  const userDetails = await Order.findOne({_id : new mongoose.Types.ObjectId(req.body.email)}).lean()
    const userDetails = await User.findOne({ email: req.body.email });
    console.log(userDetails);
    if (userDetails) {
      const otp = await sendVerificationMail(
        userDetails.name,
        userDetails.email
      );
      req.session.email = userDetails.email;
      req.session.password = req.body.password;
      req.session.otp = otp;
      console.log("otp for verification is " + otp);

      res.render("forgotPassOTP", {
        message: "OTP send, Please check your mail for OTP",
      });
    } else {
      res.render("forgotPassword", {
        message: "Email doesnt register with us",
      });
    }
    console.log("otp for verification is " + otp);
  } catch (error) {
    console.error(error.message);
  }
};

const forgotPassword = async (req, res) => {
  try {
    // console.log(req.body.otp);
    console.log(req.session.otp);
    console.log(req.session.password);
    const enteredOtp = req.body.otp;
    const email = req.session.email;
    console.log(enteredOtp);
    console.log(email);
    console.log(enteredOtp === req.session.otp);
    if (enteredOtp === req.session.otp) {
      const newPassword = req.session.password;
      const spassword = await securePassword(newPassword);

      const updatedData = await User.findOneAndUpdate(
        { email: email },
        { $set: { password: spassword } }
      );
      delete req.session.otp;
      delete req.session.password;
      delete req.session.email;
      if (updatedData) {
        req.session.user_id = updatedData._id;
        res.redirect("/");
      }
    } else {
      res.render("forgotPassOTP", { message: "Entered OTP is incorrect" });
    }
  } catch (error) {
    console.log(error.mess);
  }
};

const loadAddAddress = async (req, res) => {
  try {
    const user = await User.findById(req.session.user_id);
    res.render("addAddress", { user: user });
  } catch (error) {
    console.log(error.message);
  }
};

const addAddress = async (req, res) => {
  try {
    const address = req.body;
    console.log("address" + address);
    const user = await User.findById(req.session.user_id);

    user.address.push(address);
    await user.save();
    if (req.session.originalURL) {
      res.redirect("/checkout");
      delete req.session.originalURL;
    }

    res.redirect("/user-account");
  } catch (error) {
    console.log(error.message);
  }
};

const loadAccount = async (req, res) => {
  try {
    let search = null;
    if (req.query.orderSearch) {
      search = req.query.orderSearch;
    }
    var page = 1;
    if (req.query.page) {
      page = req.query.page;
    }
    const limit = 5;
    const count = await Order.find({
      customerId: req.session.user_id,
      orderStatus: { $ne: "PENDING" },
    })
      .sort({
        createdAt: -1,
      })
      .countDocuments();

    const orderData = Order.find({
      customerId: req.session.user_id,
      orderStatus: { $ne: "PENDING" },
    }).sort({
      createdAt: -1,
    });
    const orders = await paginateQuery(orderData, page, limit).exec();

    const userData = await User.findById(req.session.user_id)
    const categories = await Category.find();
    // console.log(userData.address[0].city);

    res.render("userProfile", {
      user: userData,
      order: orders,
      categories: categories,
      totalPages: Math.ceil(count / limit),
      count: count,
      page: parseInt(page),
      limit: limit,
      search: search,
    });
  } catch (error) {
    console.log(error.message);
  }
};
const loadEditAddress = async (req, res) => {
  try {
    const id = req.params.id;
    console.log(id);
    const user = await User.findById(req.session.user_id);
    console.log(user);
    const address = user.address[id];
    console.log(address);
    res.render("editAddress", { address: address });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error", msg: "Internal server error" });
  }
};

const editAddress = async (req, res) => {
  try {
    console.log(req.body);
    // const user = await User.findById(req.session.user_id);
    const addressId = req.body.addressId;
    console.log(addressId);

    // Use findOneAndUpdate to update the specific address
    const updatedUser = await User.findOneAndUpdate(
      {
        _id: req.session.user_id,
        "address._id": addressId,
      },
      {
        $set: {
          "address.$.customerName": req.body.customerName,
          "address.$.addressLine1": req.body.addressLine1,
          "address.$.city": req.body.city,
          "address.$.state": req.body.state,
          "address.$.zipcode": req.body.zipcode,
          "address.$.phone": req.body.phone,
          "address.$.email": req.body.email,
          "address.$.addressType": req.body.addressType,
        },
      },
      { new: true } // To return the updated user document
    );

    if (updatedUser) {
      console.log("User address updated:", updatedUser);
      res.redirect("/user-account");
    } else {
      console.log("Address not found or user not found.");
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error", msg: "Internal server error" });
  }
};

const resetPassword = async (req, res) => {
  try {
    const password = req.body.oldPass.toString();
    const newPass = req.body.newPass.toString();
    if (password === newPass) {
      return res.status(200).json({ success1: true });
    } else {
      console.log(newPass);
      const userData = await User.findById(req.session.user_id);
      // console.log('user'+userData);
      const passwordMatch = await bcrypt.compare(password, userData.password);
      if (passwordMatch) {
        const spassword = await securePassword(newPass);

        await User.updateOne(
          { _id: req.session.user_id },
          { password: spassword }
        );
        res.status(200).json({ success: true });
      } else {
        console.log("wrong pass");
        return res.status(200).json({ success: false });
      }
    }
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ status: "error", msg: "Cannot proceed reset password" });
  }
};

const applyCoupon = async (req, res) => {
  try {
    const couponCode = req.body.couponName;
    console.log(couponCode);
    const user = await Coupon.findOne({
      couponCode: couponCode,
      users: { $in: req.session.user_id },
    });
    if (user) {
      res.status(200).json({
        success2: true,
        msg: "Coupon already applied",
      });
    } else {
      const coupon = await Coupon.findOne({ couponCode: couponCode });
      const grandTotal = req.body.grandTotal;
      const percentageDiscount = parseInt(coupon.discount);
      if (coupon.minOrderPrice > grandTotal) {
        res.status(200).json({
          success1: true,
          msg: `minimun Order Price should be ${coupon.minOrderPrice}`,
        });
      } else {
        const discountCal = Math.floor((grandTotal * percentageDiscount) / 100);
        let discount;
        if (discountCal > coupon.maxDiscount) {
          discount = coupon.maxDiscount;
        } else {
          discount = discountCal;
        }
        const newGrandTotal = grandTotal - discount;
        console.log("success");
        res.status(200).json({
          success: true,
          newGrandTotal: newGrandTotal,
          discount: discount,
          msg: `Coupon applied successfully... You will get ${coupon.discount}% upto ₹${coupon.maxDiscount} coupon discount on this order !!!`,
        });
      }
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error", msg: "Cannot apply coupon" });
  }
};

const orderSearch = async (req, res) => {
  try {
    if (req.query.orderSearch) {
      req.session.orderSearch = req.query.orderSearch;
    }

    let search = req.session.orderSearch;

    console.log("search:", search);

    // console.log("vxcvcxvxxzcbzzzzzzzz" + search);
    var page = 1;
    if (req.query.page) {
      page = req.query.page;
    }
    const limit = 5;
    const orderData = Order.find({
      customerId: req.session.user_id,
      $or: [
        { orderId: { $regex: new RegExp(search, "i") } },
        { orderStatus: { $regex: new RegExp(search, "i") } },
      ],
    });

    const count = await Order.countDocuments({
      customerId: req.session.user_id,
      orderId: { $regex: new RegExp(search, "i") },
    });
    console.log("orderDataaaaaa" + orderData);

    const orders = await paginateQuery(orderData, page, limit).exec();
    const userData = await User.findById(req.session.user_id);
    const categories = await Category.find();
    res.render("userProfile", {
      user: userData,
      order: orders,
      categories: categories,
      totalPages: Math.ceil(count / limit),
      count: count,
      page: page,
      limit: limit,
      search: search,
    });
  } catch (error) {
    console.error(error);
  }
};

const loadWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.session.user_id).populate('wishlist.productId')
    const categories = await Category.find({ isListed: true });
    res.render("wishlist", { user: user, categories: categories });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error", msg: "Cannot load wishlist" });
  }
};

const addToWishlist = async (req, res) => {
  try {
    // console.log('req.query');
    // console.log(req.query);
    const userId = req.session.user_id;
    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({ message: "user not found" });
    }
    const productId = req.query.productId;
    const product = await Product.findById(productId);

    const existingItem = user.wishlist.find((item) =>
      item.productId.equals(productId)
    );

    if (existingItem) {
      res.status(200).json({success : true ,msg : 'Product already exists'})
    } else {
      user.wishlist.push({ productId });
      await user.save();
      res.status(200).json({success1 : true ,length : user?.wishlist.length,msg : 'Product added to your Wishlist'})

    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error", msg: "Cannot add to wishlist" });
  }
};

const removeWiishlist = async(req,res) => {
  try {
    const id = req.query.id;
    console.log('id '+id );
    const userId = req.session.user_id;
    const user = await User.findById(userId);
    user.wishlist = user.wishlist.filter(
      (item)=> !item._id.equals(id)
    ) 
    await user.save()
    console.log(user.wishlist);
    res.status(200).json({ success: true });

  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error", msg: "Cannot delete item from wishlist" });
  }
}


const cartFromWishlist = async (req, res) => {
  try {
    const productId = req.query.productId;
    const product = await Product.findById(productId)
    const price = product.price
    const wishId = req.query.wishId;
    const userId = req.session.user_id;
    const user = await User.findById(userId);

    const quantity = 1;
    if (user.cart && Array.isArray(user.cart)) {
      const existingItem = user.cart.find((item) =>
        item.productId && item.productId.equals(productId)
      );
    
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        user.cart.push({ productId, quantity,price });
      }
    } else {
      console.error('user.cart is not valid');
    }
    

    // Remove the item from the wishlist based on wishId
    user.wishlist = user.wishlist.filter((item) => !item._id.equals(wishId));

    await user.save();
    res.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ status: "error", msg: "Cannot move item from wishlist to cart" });
  }
};






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
  otpForForgotPass,
  loadForgotPassword,
  forgotPassword,
  loadAccount,
  loadAddAddress,
  addAddress,
  loadEditAddress,
  editAddress,
  priceLowTohigh,
  priceHighToLow,
  resetPassword,
  searchResult,
  applyCoupon,
  resendOtp,
  orderSearch,
  loadWishlist,
  addToWishlist,
  removeWiishlist,
  cartFromWishlist
};
