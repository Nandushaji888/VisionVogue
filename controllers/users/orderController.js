const Category = require('../../models/categoryModel') 
const User = require("../../models/userModel");
const Product = require("../../models/productModel");
const Order = require("../../models/orderModel");
const { Error } = require('mongoose');
const Razorpay = require('razorpay')
const {RAZORPAY_ID_KEY,RAZORPAY_SECRET_KEY} = process.env

const razorpayInstance = new Razorpay({
  key_id : RAZORPAY_ID_KEY,
  key_secret : RAZORPAY_SECRET_KEY

});




const loadOrderDetails = async(req, res) => {
    try {
      const categories = await Category.find()
      const orderId = req.params.id;
        const user = await User.findById(req.session.user_id)
          const order = await Order.findOne({_id: orderId}).populate('products.productId')
          console.log('details of 0th product');
          console.log(order.products[0].productId);
          console.log('address'+ order.shippingAddress.addressLine1);
          res.render('orderDetails', {order : order, user : user,categories :categories})
    } catch (error) {
      console.error(error); 
      res.status(500).send('Internal Server Error');
    }
  }
  
  

  const loadPlaceOrder = async(req, res) => {
    try {
      const user = await User.findOne({_id: req.session.user_id}).populate('cart.productId')
      const userCart = await User.findOne({_id: req.session.user_id})
      // console.log(req.body);
      const categories = await Category.find()
        res.render('checkout.ejs', {user : user, userCart : userCart,categories : categories})
    } catch (error) {
      console.log(error.message);
    }
  }
  
  const postOrder= async(req, res) => {
    try {
      const userId = req.session.user_id
      const userData = await User.findById(userId,{cart:1,_id :0})
      
      const order =  new Order ({
        
        customerId: userId,
        products: userData.cart,
        quantity: req.body.quantity,
        price: req.body.salePrice,
        totalAmount: req.body.GrandTotal,
        shippingAddress: JSON.parse(req.body.address),
      })
      const orderSuccess = await order.save();
      if(orderSuccess) {
        for (const cartItem of userData.cart) {
          const product = await Product.findById(cartItem.productId);
  
          if (product) {
            product.stock -= cartItem.quantity;
            await product.save();
          }
        }
        await User.updateOne({_id : userId}, {$unset : {cart :1}})
        res.redirect('/order-success')
      console.log(req.body);}
    } catch (error) {
      console.log(error.message);
    }
  }

  const orderCancellation = async (req,res)=>{
    try {
        const id = req.params.id;
        const order = await Order.findById(id)
        console.log(order.products[0]);
        for(const item of order.products){
        const product = await Product.findById(item.productId);

        if(product){
           product.stock += item.quantity;
           await product.save();
        }}
       await order.deleteOne({_id : id})
        res.redirect('/user-account')
    } catch (error) {
      console.error(error); 
      res.status(500).send('Internal Server Error');
    }
  }
  
  
    const orderSuccessPage = async(req, res) => {
      try {
        res.render('orderSuccessPage')
      } catch (error) {
        console.log(error.message);
      }
    }

    module.exports = {
        orderSuccessPage,
        postOrder,
        loadPlaceOrder,
        orderCancellation,
        loadOrderDetails

    }