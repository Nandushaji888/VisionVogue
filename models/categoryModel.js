const mongoose = require('mongoose');

const categorySchema = mongoose.Schema({
    name : {
        type : String,
        required : true,
        unique: true,
        
    },
    image : {
        type : String,
        required : true,
   
    },
    isListed : {
        type : Boolean,
        required :true,
         default :false
    },
    description : {
        type : String,
        required :true
    }
})

module.exports = mongoose.model('Category', categorySchema);