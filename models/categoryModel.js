const mongoose = require('mongoose');

const categorySchema = mongoose.Schema({
    name : {
        type : String,
        required : true,
    },
    image : {
        type : String,
        required : true,
        default : ''
    },
    isListed : {
        type : Number,
         default :0
    },
    description : {
        type : String,
        required :true
    }
})

module.exports = mongoose.model('Category', categorySchema);