const mongoose = require('mongoose');
    const moment = require('moment-timezone');


const orderSchema = new mongoose.Schema({
    orderId: String,
    customerId: {
        type : mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    products : [{
        productId: {
            type : mongoose.Schema.Types.ObjectId,
            ref: 'Product'
        },
        quantity: Number,
        price: Number,
    }],
    // paymentMethod : String,
    paymentStatus: {
        type : String,
        default: "PENDING"
    },
    paymentMethod:{
        type: Object,
        default : 'COD'
    },
    shippingMethod: {
        type : String,
        default: "Post Mail Courier"
    },
    shippingCost: {
        type : Number,
        default: 0
    },
    totalItems : Number,
    paidAmount : Number,   

    couponDiscount: {
		type: Number,
		default: 0,
	},
    shippingAddress : {},
    orderStatus: {
        type : String,
        default: "PENDING"
    },
    createdAt: {
        type: Date,
        default: () => moment.tz(Date.now(), "Asia/Kolkata")
    },
    updatedAt:{
        type: Date,
        default: () => moment.tz(Date.now(), "Asia/Kolkata")
    },
    deliveredDate : {
        type : Date,
        
    },
    paymentId : {
        type : String
    },
    paymentOrderId : {
        type : String

    },
    returnReason : {
        type : String
    },
    coupon: {
        type : mongoose.Schema.Types.ObjectId,
        ref: 'Coupon'
    },
});

module.exports = mongoose.model('order', orderSchema);

