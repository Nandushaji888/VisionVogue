const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name : {
        type : String,
        required : true
    },
    desciption : {
        type : String,
        required : true
    },
    details : {
        type : String,
        default : ''
    }, 
    image : {
        type : String,
        default : ''
    },
    images : [{
        type : String
    }],
    brand : {
        type : String,
        default : ''
    },
    price : {
        type : Number,
        default : 0
    },
    category : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'Category',
        required : true
    },
    countInStock :{
        type : Number,
        required : true,
        min : 0,
        max : 2000
    },
    rating :{
        type : Number,
        default : 0,
    },
    numReviews : {
        type : Number,
        default : 0,
    },
    isFeatured : {
        type : Boolean,
        default : false,
    },
    dateCreated : {
        type : Date,
        default : Date.now,
    },
})

module.exports = mongoose.model('Product', productSchema)