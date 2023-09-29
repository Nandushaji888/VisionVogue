const User = require('../../models/userModel')
const Product = require("../../models/productModel");
const Order = require("../../models/orderModel");


const loadOrderList = async(req, res) => {
    try {
        const order = await Order.find().populate('customerId').sort({createdAt : 1})
        res.render('orderList', {order : order})
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', msg: 'Internal server error' });
    }
}

const orderDetails = async(req, res) => {
    try {
        const orderId = req.params.id
        console.log(orderId);
        const order = await Order.findOne({ _id: orderId }).populate(
            "products.productId",
          );
          const customer = await Order.findOne({_id: orderId}).populate(
            "customerId"
          )
        res.render('editOrder',{order : order,customer : customer})
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', msg: 'Internal server error' });
    }
}

const changeOrderStatus = async(req, res) => {
    try {
        const status = ""+req.body.status+""
        const id = req.body.id
        console.log('status is'+status +'id is'+id);
        await Order.updateOne({_id:id},{$set:{orderStatus : status}})
        const order = await Order.findById(id)
        if(order.orderStatus == 'DELIVERED') {
            await Order.updateOne({_id:id},{$set:{deliveredDate :  new Date()}})

            // order.deliveredDate = new Date()
            console.log( 'order status'+ order.deliveredDate);
        }
        res.redirect('/admin/orders')
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', msg: 'Internal server error' });
    }
}


module.exports = {
    loadOrderList,
    orderDetails,
    changeOrderStatus
}