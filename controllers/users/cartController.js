const Category = require("../../models/categoryModel");
const User = require("../../models/userModel");
const Product = require("../../models/productModel");
const Order = require("../../models/orderModel");

// item adding to cart
const addToCart = async (req, res) => {
  try {
    // console.log(req.body);
    const productId = req.body.productId;
    const quantity = parseInt(req.body.quantity);

    if (isNaN(quantity) || quantity <= 0) {
      res.status(400).json({ message: "Invalid quantity" });
    }
    const product = await Product.findById(productId);
    const price = product.price;
    const userId = req.session.user_id;
    // console.log("userId------" + userId);
    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({ message: "user not found" });
    }

    const existingItem = user.cart.find((item) =>
      item.productId.equals(productId)
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      user.cart.push({ productId, quantity, price });
    }

    await user.save();

    // console.log("product added to cart");

    res.redirect("/cart");
    // res.redirect('/product/'+productId);
  } catch (error) {
    console.log(error.message);
  }
};

//loading cart pag
const loadCart = async (req, res) => {
  try {
    const userCart = await User.findOne({ _id: req.session.user_id }).populate(
      "cart.productId"
    );

    let grandTotal = 0;
    for (let i = 0; i < userCart.cart.length; i++) {
      grandTotal =
        grandTotal +
        parseInt(userCart.cart[i].productId.price) *
          parseInt(userCart.cart[i].quantity);
    }


    const user = await User.findById(req.session.user_id);
    const categories = await Category.find();

    // console.log("req.session.cartErrorMessage" + req.session.cartErrorMessage);

    let cartErrorMessage = req.session.cartErrorMessage;
    // console.log("cartErrorMessage" + cartErrorMessage);
    delete req.session.cartErrorMessage;

    res.render("userCart", {
      userCart: userCart,
      grandTotal: grandTotal,
      user: user,
      categories: categories,
      cartErrorMessage: cartErrorMessage,
    });
  } catch (error) {
    console.log(error.message);
  }
};

//changing quntity in
const changeQuantity = async (req, res) => {
  try {

    console.log("quantity");
    console.log(req.body);
    const productId = req.body.productId 
    const product = await Product.findById(req.body.productId)
    console.log(product.stock);
    const user =await User.findById(req.session.user_id).populate("cart.productId")
    console.log(user.cart);
    if (user && user.cart) {
      const cartProduct = user.cart.find(item => item.productId.equals(productId));
      if (cartProduct) {
        console.log("cartProduct.quantity");
        console.log(cartProduct.quantity);

        if(cartProduct.quantity >= product.stock){
          res.status(200).json({ status: false });
        }
      }}



    const data = await User.updateOne(
      {
        _id: req.session.user_id,
        "cart.productId": req.body.productId,
      },
      {
        $inc: {
          "cart.$.quantity": req.body.count,
        },
      },
      {
        new: true,
      }
    );

    res.status(200).json({ status: true });
  } catch (error) {
    console.log(error.message);
  }
};

//deleteCart items
const deleteCartItem = async (req, res) => {
  try {
    const userId = req.session.user_id;
    const productIdToDelete = req.body.id;
    

    const user = await User.findById(userId);

    // if (!user) {
    //   return res.status(404).json({ message: "User not found" });
    // }

    user.cart = user.cart.filter(
      (item) => !item.productId.equals(productIdToDelete)
    );

    await user.save();

    console.log("Product removed from cart");
    res.status(200).json({ success: true });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

//load check out page

module.exports = {
  addToCart,
  loadCart,
  changeQuantity,
  deleteCartItem,
};
