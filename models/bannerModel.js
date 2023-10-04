const mongoose = require('mongoose');

// Define the Banner Schema
const bannerSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  brand : {
    type : String,
    required : true
  },
  image: {
    type: String,
    required: true,
  },
  linkToProduct: {
    type: String,
    required: true,
  },
  validity: {
    type: Date, // Add a validity field
    required: true,
  },
  isListed: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  details : {
    type : String,
    required : true
  },
  description : {
    type : String,
    required : true
  }

});

// Create the Banner model
const Banner = mongoose.model('Banner', bannerSchema);

module.exports = Banner;
