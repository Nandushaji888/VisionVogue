const User = require('../../models/userModel')
const Product = require("../../models/productModel");
const Order = require("../../models/orderModel");


const loadOrderList = async(req, res) => {
    try {
        const order = await Order.find().populate('customerId')
        const id =order[0].customerId
        console.log(id);
        console.log(order);
        const user = await User.findById(id)
        res.render('orderList', {order : order, user : user})
    } catch (error) {
        console.log(error.message);
    }
}


module.exports = {
    loadOrderList
}