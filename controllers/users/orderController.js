const Category = require("../../models/categoryModel");
const User = require("../../models/userModel");
const Product = require("../../models/productModel");
const Order = require("../../models/orderModel");
const { Error } = require("mongoose");
const Razorpay = require("razorpay");
const mongoose=require('mongoose')
// const { log } = require("har-validator");
const { RAZORPAY_ID_KEY, RAZORPAY_SECRET_KEY } = process.env;

const razorpay = new Razorpay({
  key_id: RAZORPAY_ID_KEY,
  key_secret: RAZORPAY_SECRET_KEY,
});

const loadOrderDetails = async (req, res) => {
  try {
    const categories = await Category.find();
    const orderId = req.params.id;
    const user = await User.findById(req.session.user_id);
    const order = await Order.findOne({ _id: orderId }).populate(
      "products.productId"
    );

    res.render("orderDetails", {
      order: order,
      user: user,
      categories: categories,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

const loadPlaceOrder = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.session.user_id }).populate(
      "cart.productId"
    );
    const userCart = await User.findOne({ _id: req.session.user_id });
    // console.log(req.body);
    const categories = await Category.find();
    res.render("checkout.ejs", {
      user: user,
      userCart: userCart,
      categories: categories,
    });
  } catch (error) {
    console.log(error.message);
  }
};

const postOrder = async (req, res) => {
  try {
    const userId = req.session.user_id;
    const userreq = await User.findById(userId, { cart: 1, _id: 0 });

    const order = new Order({
      customerId: userId,
      products: userreq.cart,
      quantity: req.body.quantity,
      price: req.body.salePrice,
      totalAmount: req.body.GrandTotal,
      paymentMethod: req.body.paymentMethod,
      shippingAddress: JSON.parse(req.body.address),
    });
    const orderId = order._id
    const orderSuccess = await order.save();
    if (orderSuccess) {
      for (const cartItem of userreq.cart) {
        const product = await Product.findById(cartItem.productId);

        if (product) {
          product.stock -= cartItem.quantity;
          await product.save();
        }
      }
      await User.updateOne({ _id: userId }, { $unset: { cart: 1 } });




      //<......for COD delovery....>
      if (req.body.paymentMethod === "COD") {
        // Order.findByIdAndUpdate(orderId,{orderStatus :"PLACED"})
        await Order.updateOne({_id : new mongoose.Types.ObjectId(orderId)},{ orderStatus :"PLACED"}).lean()

        console.log("razzzz2");
        res.status(200).json({
          status: true,
          msg: "Order created for COD",
        });


        // FOR ONLINE PAYMENT
      } else if (req.body.paymentMethod === "razorpay") {
        // console.log(req.body);
        console.log(orderId);

        const amount = req.body.GrandTotal * 100;
        const options = {
          amount: amount,
          currency: "INR",
          receipt: orderId,
        };

        razorpay.orders.create(options, (err, order) => {
          if (!err) {
            // console.log('bgkjhgjhjh '+orderId);
            res.status(200).send({
              success: true,
              msg: "Order created",
              order_id: order.id,
              amount: amount,
              receipt : orderId,
              key_id: RAZORPAY_ID_KEY,
              // productId : req.body.products.productId,
              contact: "9998887776",
              name: "admin",
              email: "admin@gmail.com",
            });
          } else {
            res
              .status(400)
              .send({ success: false, msg: "Something went wrong!" });
          }
        });
      }
    }
  } catch (error) {
    console.log(error.message);
  }
};
const crypto = require('crypto');

const verifyPayment = async(req, res) => {
  try {
    console.log('this is id:',req.body.orderId);
    const kk = await Order.find({_id : new mongoose.Types.ObjectId(req.body.orderId)}).lean()
    if(kk)
      console.log(kk);
      console.log(req.body.orderId);
    const hmac = crypto.createHmac('sha256', RAZORPAY_SECRET_KEY);
    hmac.update(req.body.payment.razorpay_order_id + "|" + req.body.payment.razorpay_payment_id);
    await Order.updateOne({_id : new mongoose.Types.ObjectId(req.body.orderId)},{$set : { paymentId : req.body.payment.razorpay_payment_id, paymentOrderId :req.body.payment.razorpay_order_id }}).lean()

    const calculatedSignature = hmac.digest('hex');

    if (calculatedSignature === req.body.payment.razorpay_signature) {
      console.log(typeof(req.body.orderId));
      await Order.updateOne({_id : new mongoose.Types.ObjectId(req.body.orderId)},{$set : { paymentStatus : 'COMPLETED', orderStatus :"PLACED"}}).lean()

      res.status(200).json({ status: 'success', msg: 'Payment verified' });
    } else {

      res.status(400).json({ status: 'error', msg: 'Payment verification failed' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'error', msg: 'Internal server error' });
  }
};




const orderCancellation = async (req, res) => {
  try {
    const id = req.params.id;
    const order = await Order.findById(id);
    console.log(order.products[0]);
    for (const item of order.products) {
      const product = await Product.findById(item.productId);

      if (product) {
        product.stock += item.quantity;
        await product.save();
      }
    }
    await order.updateOne({ orderStatus: "CANCELLED" });
    res.redirect("/user-account");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

const orderSuccessPage = async (req, res) => {
  try {
    res.render("orderSuccessPage");
  } catch (error) {
    console.log(error.message);
  }
};


// exports.cancelOrder = async (req, res, next) => {
//   try{
//       console.log(req.body);
//       if(req.body){
//       const {orderId, reason} = req.body;
//       if(!orderId){
//           return res.status(500).render('error', {
//               message: "Error while updating order status!",
//               errStatus : 500
//           });
//       }
//       await Orderdb.findById(orderId)
//           .then( async (order)=>{
//               if(order !== null){
//                   //re-stock ordered products
//                   const updateOperations = [];
//                   let i = 0;
//                   for(const item of order.products) {
//               updateOperations.push({
//                 updateOne: {
//                   filter: { _id: item.productId.toString() },
//                   update: { $inc: { stock: item.quantity } },
//                 },
//               });
//                       i++;
//             }
//                   const result = await Productdb.bulkWrite(updateOperations);
//                   if (result.modifiedCount !== order.products.length) {
//                       return res.status(500).render('error', {
//                           message: "Unable to return the order",
//                           errStatus : 500
//                       });
//                   }
//                   //refund payment
//                   const editOrder = {
//                       _id: orderId,
//                       orderStatus: "CANCELLED",
//                       reason: reason
//                   };
//                   if(order.paymentStatus === "PAID"){
//                       const amount = order.finalAmount*100;
//                       const remarks = "Refund of order"
//                       await addWalletTransactionToDb(req.session.user._id, amount, "C", remarks)
//                           .then((data)=>{
//                               console.log(`Refund of amount "₹${data.amount}" is successful!`);
//                               // res.json({status:true, data: data});
//                               editOrder.paymentStatus = "REFUNDED";
//                           })
//                           .catch((err)=>{
//                               console.log(`Refund of amount failed!`);
//                               console.log(err);
//                               // res.json({status: false, errMsg:'Payment failed!'});
//                           });
//                   } else{
//                       editOrder.paymentStatus = "NOT PAID";
//                   }                    
//                   await Orderdb.findByIdAndUpdate(orderId, editOrder)
//                           .then(data => {
//                               if (!data) {
//                                   res.status(500).render('error', {
//                                       message: "Unable to cancel the order",
//                                       errStatus : 500
//                                   });
//                               }
//                               else {
//                                   //res.send(data);   
//                                   console.log("Order cancelled successfully!");
//                                   res.redirect('back');
//                               }
//                           })
//                           .catch(err => {
//                               res.status(500).render('error', {
//                                   message: "Error cancelling the order",
//                                   errStatus : 500
//                               });
//                               console.log(err.message);
//                           });                  
//               }
//           }).catch(err =>{
//                   console.log(err);
//           });
//       }
//   } catch(err){
//       res.status(500).render('error', {
//           message: "Error while updating order status!",
//           errStatus : 500
//       });
//       console.log(err);
//   }
// };

module.exports = {
  orderSuccessPage,
  postOrder,
  loadPlaceOrder,
  orderCancellation,
  loadOrderDetails,
  verifyPayment
};
