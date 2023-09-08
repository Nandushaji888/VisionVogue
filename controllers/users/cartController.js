const Category = require('../../models/categoryModel') 
const User = require("../../models/userModel");
const Product = require("../../models/productModel");
const Order = require("../../models/orderModel")


// item adding to cart
const addToCart = async (req, res) => {
  try {
    console.log(req.body);
    const productId = req.body.productId;
    const quantity = parseInt(req.body.quantity);

    if (isNaN(quantity) || quantity <= 0) {
      res.status(400).json({ message: "Invalid quantity" });
    }
    const product = await Product.findById(productId)
    const price = product.price;
    const userId = req.session.user_id;
    console.log("userId------" + userId);
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
      user.cart.push({ productId, quantity,price });
    }

    await user.save();

    console.log("product added to cart");

    res.redirect("/cart");
    // res.redirect('/product/'+productId);
  } catch (error) {
    console.log(error.message);
  }
};

//loading cart pag
const loadCart = async (req,res)=>{
  try {
      const userCart = await User.findOne({_id: req.session.user_id}).populate('cart.productId')
      let grandTotal=0;
      for(let i =0;i<userCart.cart.length;i++){
          grandTotal= grandTotal + parseInt(userCart.cart[i].productId.price)* parseInt(userCart.cart[i].quantity)
      }
      console.log(grandTotal);

      const user = await User.findById(req.session.user_id)
      const categories = await Category.find()

      res.render('userCart',{userCart: userCart, grandTotal : grandTotal, user : user, categories : categories})
  } catch (error) {
      console.log(error.message);
  }
}


//changing quntity in 
const changeQuantity = async (req,res)=>{
  console.log(req.body)
  req.body.count = parseInt(req.body.count)
  try {
      const data = await User.updateOne(
          {
            _id: req.session.user_id,
             'cart.productId': req.body.productId,
          },
          {
            $inc: {
              'cart.$.quantity': req.body.count,
            }
          },
          {
              new:true
          }
      )
      console.log("Dataa", data)
  } catch (error) {
      console.log(error.message);
  }
}

//deleteCart items
const deleteCartItem = async (req, res) => {
  try {
    const userId = req.session.user_id;
    const productIdToDelete = req.params.id; 

    console.log('productId to remove'+productIdToDelete);
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    console.log('user'+user);
    user.cart = user.cart.filter((item) =>
      !item.productId.equals(productIdToDelete)
    );

    await user.save();

    console.log("Product removed from cart");

    res.redirect('/cart')
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

//load check out page

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
      res.redirect('/order-success')
    console.log(req.body);}
  } catch (error) {
    console.log(error.message);
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
  addToCart,
  loadCart,
  changeQuantity,
  deleteCartItem,
  loadPlaceOrder,
  postOrder,
  orderSuccessPage
};
