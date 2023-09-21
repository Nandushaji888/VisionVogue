const mongoose = require('mongoose');
const moment = require('moment-timezone');

const couponSchema = new mongoose.Schema({
    couponCode: String,
    description: String,
    discount: Number,
    minOrderPrice: Number,
    maxDiscount: Number,
    isListed:{
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: () => Date.now()
    },
    users : {
        type : Array
    }
});

module.exports= mongoose.model('coupon', couponSchema);
