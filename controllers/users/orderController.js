const Category = require("../../models/categoryModel");
const User = require("../../models/userModel");
const Product = require("../../models/productModel");
const Order = require("../../models/orderModel");
const Coupon = require("../../models/couponModel");

const { Error } = require("mongoose");
const Razorpay = require("razorpay");
const mongoose = require("mongoose");
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
    res.status(500).render("errorPage");
  }
};

// const loadPlaceOrder1 = async (req, res) => {
//   try {
//     const categories = await Category.find();
//     const coupons = await Coupon.find({
//       $and: [{ users: { $ne: req.session.user_id } }, { isListed: true }],
//     });
//     req.session.originalURL = "/checkout";
//     const userCart = await User.findOne({ _id: req.session.user_id });
//     const user = await User.findOne({ _id: req.session.user_id }).populate(
//       "cart.productId"
//     );
//     console.log("user.cart");
//     console.log(user.cart);
//     for (const cartItem of user.cart) {
//       console.log(
//         "jhkgfgjhgklfagkljhsdjklhjklsahjklsfhdajklghsfdakljgsfdkljgsfdal"
//       );
//       const product = await Product.findById(cartItem.productId);
//       console.log("product");
//       console.log(product);
//       console.log(cartItem.quantity);
//       if (product && product.stock < cartItem.quantity) {
//         res.redirect("/cart");
//       }
//     }
//     // console.log(req.body);
//     res.render("checkout.ejs", {
//       user: user,
//       userCart: userCart,
//       categories: categories,
//       coupons: coupons,
//     });
//   } catch (error) {
//     console.log(error.message);
//   }
// };

const loadPlaceOrder = async (req, res) => {
  try {
    let shouldRedirect = false;
    const categories = await Category.find();
    const user = await User.findOne({ _id: req.session.user_id }).populate(
      "cart.productId"
    );
    const coupons = await Coupon.find({
      $and: [{ users: { $ne: req.session.user_id } }, { isListed: true }],
    });
    req.session.originalURL = "/checkout";
    const userCart = await User.findOne({ _id: req.session.user_id });

    // console.log("checkkkkkkkkk");
    // console.log(userCart.cart);

    req.session.cart = userCart.cart;

    for (const cartItem of user.cart) {
      const product = await Product.findById(cartItem.productId);
      if (product && product.stock < cartItem.quantity) {
        // console.log('checkkkkkkkkk222');
        shouldRedirect = true;
        break;
      }
    }

    if (shouldRedirect) {
      req.session.cartErrorMessage =
        "Some items in your cart are out of stock. Please review your cart.";
      return res.redirect("/cart");
    } else {
      res.render("checkout.ejs", {
        user: user,
        userCart: userCart,
        categories: categories,
        coupons: coupons,
      });
    }

    // console.log(req.body);
  } catch (error) {
    console.log(error.message);
  }
};

const postOrder = async (req, res) => {
  try {
    const user = await User.findById(req.session.user_id).populate(
      "cart.productId"
    );

    if (user && user.cart) {
      let allItemsInStock = true;

      for (const cartItem of user.cart) {
        const product = await Product.findById(cartItem.productId);

        if (!product || cartItem.quantity > product.stock) {
          allItemsInStock = false;
          break;
        }
      }
      if (!allItemsInStock) {
        return res.status(200).json({ status2: true });
      }
    }

    let couponCode;
    const consumedUser = await Coupon.findOne({
      couponCode: req.body.Coupon,
      users: { $in: req.session.user_id },
    });
    if (!consumedUser) {
      couponCode = req.body.Coupon;
    }

    const userId = req.session.user_id;
    const userreq = await User.findById(userId, { cart: 1, _id: 0 });
    const oldCart = req.session.cart;


    if (JSON.stringify(oldCart) !== JSON.stringify(userreq.cart)) {
      delete req.session.cart;
      res.status(200).json({
        status1: true,
        msg: "Your Cart has been changed",
      });

    } else {
      const discountCoupon = await Coupon.findOne({
        couponCode: couponCode,
      });

      let grandAmount;
      let discountValue;

      const GrandTotal = parseInt(req.body.GrandTotal);
      if (discountCoupon) {

        if (GrandTotal > discountCoupon.minOrderPrice) {
          const percentageDiscount = parseInt(discountCoupon.discount);
          const discountCal = Math.floor(
            (GrandTotal * percentageDiscount) / 100
          );

          if (discountCal < discountCoupon.maxDiscount) {
            discountValue = discountCal;
          } else {
            discountValue = discountCoupon.maxDiscount;
          }
          grandAmount = GrandTotal - discountValue;
        } else {
          grandAmount = GrandTotal;
        }
      } else {
        grandAmount = GrandTotal;
      }
      const order = new Order({
        customerId: userId,
        products: userreq.cart,
        quantity: req.body.quantity,
        price: req.body.salePrice,
        paidAmount: grandAmount,
        paymentMethod: req.body.paymentMethod,
        shippingAddress: JSON.parse(req.body.address),
        couponDiscount: discountValue,

        // orderId :
      });

      const orderId = order._id;
      const orderSuccess = await order.save();
      const orderIdentity = "ODR" + order._id.toString().slice(0, 13);
      await Order.findByIdAndUpdate(
        { _id: order._id },
        { orderId: orderIdentity }
      );
      if (couponCode) {
        await Order.findByIdAndUpdate(
          { _id: order._id },
          { couponCode: couponCode }
        );
        await Coupon.updateOne(
          { couponCode: couponCode },
          { $push: { users: req.session.user_id } },
          { new: true }
        );
      }

      if (orderSuccess) {
        //<......for COD delovery....>
        if (req.body.paymentMethod === "COD") {
          // console.log("usercart" + userreq.cart);
          for (const cartItem of userreq.cart) {
            const product = await Product.findById(cartItem.productId);

            if (product) {
              product.stock -= cartItem.quantity;
              await product.save();
            }
          }
          await User.updateOne({ _id: userId }, { $unset: { cart: 1 } });

          await Order.updateOne(
            { _id: new mongoose.Types.ObjectId(orderId) },
            { orderStatus: "PLACED" }
          ).lean();
          res.status(200).json({
            status: true,
            msg: "Order created for COD",
          });

          // FOR ONLINE PAYMENT
        }
        
        else if(req.body.paymentMethod === "wallet"){
          if(user.wallet < grandAmount ) {
            res.status(200).json({
              statuswalletfail: true,
            });
          }else{

            await User.findOneAndUpdate(
              { _id: req.session.user_id },
              { $inc: { wallet: -grandAmount } }
            );
          

            let transData = {
              orderId: order._id,
              amount: grandAmount,
              transcationType: "DEBIT",
              reasonType: "PURCHASE",
            };
        
            user.walletTranscation.push(transData);
            await user.save();

            for (const cartItem of userreq.cart) {
              const product = await Product.findById(cartItem.productId);
  
              if (product) {
                product.stock -= cartItem.quantity;
                await product.save();
              }
            }
            await User.updateOne({ _id: userId }, { $unset: { cart: 1 } });
  
            await Order.updateOne(
              { _id: new mongoose.Types.ObjectId(orderId) },
              { orderStatus: "PLACED" }
            ).lean();
            res.status(200).json({
              statuswallet: true,
            });



          }
        }
        
        else if (req.body.paymentMethod === "razorpay") {
          console.log("online");

          const amount = grandAmount * 100;
          console.log("amount" + amount);
          const options = {
            amount: amount,
            currency: "INR",
            receipt: orderId,
          };
          console.log("checking.......");
          razorpay.orders.create(options, (err, order) => {
            // console.log(err);
            if (!err) {
              // console.log("order sending");
              res.status(200).send({
                success: true,
                msg: "Order created",
                order_id: order.id,
                amount: amount,
                products: userreq.cart,
                receipt: orderId,
                key_id: RAZORPAY_ID_KEY,
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
    }
  } catch (error) {
    console.log(error.message);
  }
};
const crypto = require("crypto");

const verifyPayment = async (req, res) => {
  try {
    // console.log("this is id:", req.body.orderId);
    const kk = await Order.find({
      _id: new mongoose.Types.ObjectId(req.body.orderId),
    }).lean();
    // if (kk) console.log(kk);
    // console.log(req.body.orderId);
    const hmac = crypto.createHmac("sha256", RAZORPAY_SECRET_KEY);
    hmac.update(
      req.body.payment.razorpay_order_id +
        "|" +
        req.body.payment.razorpay_payment_id
    );
    await Order.updateOne(
      { _id: new mongoose.Types.ObjectId(req.body.orderId) },
      {
        $set: {
          paymentId: req.body.payment.razorpay_payment_id,
          paymentOrderId: req.body.payment.razorpay_order_id,
        },
      }
    ).lean();

    const calculatedSignature = hmac.digest("hex");

    if (calculatedSignature === req.body.payment.razorpay_signature) {
      // console.log(typeof req.body.orderId);

      const products = req.body.products;
      // console.log(products);
      for (const cartItem of products) {
        const product = await Product.findById(cartItem.productId);

        if (product) {
          product.stock -= cartItem.quantity;
          await product.save();
        }
      }
      await User.updateOne(
        { _id: req.session.user_id },
        { $unset: { cart: 1 } }
      );
      await Order.updateOne(
        { _id: new mongoose.Types.ObjectId(req.body.orderId) },
        { $set: { paymentStatus: "COMPLETED", orderStatus: "PLACED" } }
      ).lean();
      // console.log("order placedddddd");

      res.status(200).json({ status: "success", msg: "Payment verified" });
    } else {
      res
        .status(400)
        .json({ status: "error", msg: "Payment verification failed" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", msg: "Internal server error" });
  }
};

const orderCancellation = async (req, res) => {
  try {
    const id = req.params.id;
    const order = await Order.findById(id);
    // console.log(order.products[0]);
    for (const item of order.products) {
      const product = await Product.findById(item.productId);

      if (product) {
        product.stock += item.quantity;
        await product.save();
      }
    }
    await order.updateOne({ orderStatus: "CANCELLED" });

    const user = await User.findById(req.session.user_id);
    const wallet = order.paidAmount;
    if (user.wallet > 0) {
      await User.findOneAndUpdate(
        { _id: req.session.user_id },
        { $inc: { wallet: wallet } }
      );
    } else {
      await User.findOneAndUpdate(
        { _id: req.session.user_id },
        { $set: { wallet: wallet } }
      );
    }

    let transData = {
      orderId: order._id,
      amount: order.paidAmount,
      transcationType: "CREDIT",
      reasonType: "RETURNED",
    };

    user.walletTranscation.push(transData);
    await user.save();

    // console.log(user.wallet);

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

const returnProduct = async (req, res) => {
  try {
    const reason = req.body.reason;
    const id = req.body.id;
    const order = await Order.findById({
      _id: new mongoose.Types.ObjectId(id),
    });
    // console.log(reason);
    // console.log("order ID" + req.body.id);
    await Order.findByIdAndUpdate(
      { _id: new mongoose.Types.ObjectId(id) },
      {
        $set: {
          returnReason: reason,
          orderStatus: "RETURNED",
          paymentStatus: "REFUNDED",
        },
      }
    ).lean();

    const user = await User.findById(req.session.user_id);
    const wallet = order.paidAmount;
    if (user.wallet > 0) {
      await User.findOneAndUpdate(
        { _id: req.session.user_id },
        { $inc: { wallet: wallet } }
      );
    } else {
      await User.findOneAndUpdate(
        { _id: req.session.user_id },
        { $set: { wallet: wallet } }
      );
    }
    let transData = {
      orderId: order._id,
      amount: order.paidAmount,
      transactionType: "CREDIT",
      reasonType: "RETURNED",
    };

    user.walletTranscation.push(transData);
    await user.save();
    for (const item of order.products) {
      const product = await Product.findById(item.productId);

      if (product) {
        product.stock += item.quantity;
        await product.save();
      }
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error", msg: "Cannot return product" });
  }
};

module.exports = {
  orderSuccessPage,
  postOrder,
  loadPlaceOrder,
  orderCancellation,
  loadOrderDetails,
  verifyPayment,
  returnProduct,
};
