const Category = require("../../models/categoryModel");
const User = require("../../models/userModel");
const Product = require("../../models/productModel");
const Order = require("../../models/orderModel");
const { Error } = require("mongoose");
const Razorpay = require("razorpay");
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
    console.log("details of 0th product");
    console.log(order.products[0].productId);
    console.log("address" + order.shippingAddress.addressLine1);
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
      // await User.updateOne({ _id: userId }, { $unset: { cart: 1 } });
      if (req.body.paymentMethod === "COD") {
        console.log("razzzz2");
        res.status(200).json({
          status: true,
          msg: "Order created for COD",
        });
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

const verifyPayment = (req, res) => {
  try {
      console.log(req.body.orderId);
    const hmac = crypto.createHmac('sha256', RAZORPAY_SECRET_KEY);
    hmac.update(req.body.payment.razorpay_order_id + "|" + req.body.payment.razorpay_payment_id);
    const calculatedSignature = hmac.digest('hex');

    if (calculatedSignature === req.body.payment.razorpay_signature) {
      Order.updateMany({_id : req.body.orderId}, {$set : {
        paymentStatus : 'RECEIVED',
        orderStatus :"PLACED"
      }})
      res.status(200).json({ status: 'success', msg: 'Payment verified' });
    } else {

      res.status(400).json({ status: 'error', msg: 'Payment verification failed' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'error', msg: 'Internal server error' });
  }
};

module.exports = verifyPayment;




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

module.exports = {
  orderSuccessPage,
  postOrder,
  loadPlaceOrder,
  orderCancellation,
  loadOrderDetails,
  verifyPayment
};
