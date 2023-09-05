const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    name : {
        type : String,
        required : true
    },
    email : {
        type : String,
        required : true
    },
    phone : {
        type : String,
        required : true,
    },
    password : {
        type : String,
        required : true
    },
    isActive : {
        type : Boolean,
        default : true
    },
    is_admin : {
        type : Number,
        default : 0
    },
    cart : {
        items: [{
       productId: {
         type: mongoose.Schema.Types.ObjectId,
         ref: 'Product', 
       },
       size: String,     
       quantity: Number,  
   }]
}
})


module.exports = mongoose.model('User', userSchema)