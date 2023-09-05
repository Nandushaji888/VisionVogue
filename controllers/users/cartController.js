const Cart = require('../../models/cartSchema');
const User = require('../../models/userModel');
const Product = require('../../models/productModel');

const addToCart = async (req, res) => {
  try {
    const productId = req.params.id;
    const selectedSize = req.body.size; 
    const quantity = parseInt(req.body.quantity);

  
    if (isNaN(quantity) || quantity <= 0) {
      return res.status(400).json({ message: 'Invalid quantity' });
    }
    const userId = req.session.user_id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const existingItem = user.cart.items.find((item) => (
      item.productId.equals(productId) && item.size === selectedSize
    ));

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      user.cart.items.push({ productId, size: selectedSize, quantity });
    }

    await user.save();

    res.render('userCart',{user : user})
  
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};




// const loadCart = async(req, res) => {
//     try {

//         const id = req.session.user_id;
//         const user = await User.findById(id)
//       const cartItems = user.cart.items;
//       const productData = await Product.find({_id : {$in : cartItems.map(item => item.productId)} })

//       const cartWithProductDetails = cartItems.map(cartItem => {
//         const productDetail = productData.find(product => product._id.equals(cartItem.productId));
//         return {
//           ...cartItem,
//           productDetail, 
//         };
//       });

//       console.log(cartWithProductDetails);
//       res.render('userCart', { user : user, cartItems: cartWithProductDetails });
//     } catch (error) {
//         console.log(error.message);
//     }
// }

const loadCart = async (req,res)=>{
  try {
      const userCart = await User.findOne({_id: req.session.user_id}).populate('cart.items.productId')
      const cartItems = userCart.items;
      res.render('userCart',{userCart: userCart})
  } catch (error) {
      console.log(error.message);
  }
}

module.exports = {
  addToCart,
  loadCart
};
