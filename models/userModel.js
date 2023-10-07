const mongoose = require("mongoose");
const moment = require('moment-timezone');

const addressSchema = new mongoose.Schema({
  customerName: {
    type: String,
  },
  addressLine1: {
    type: String,
  },
  city: {
    type: String,
  },
  state: {
    type: String,
  },
  zipcode: {
    type: String,
  },
  phone: {
    type: String,
  },
  email: {
    type: String,
  },
  addressType: {
    type: String,
  },
});

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  address: {
    type: Array,
  },
  password: {
    type: String,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  is_admin: {
    type: Number,
    default: 0,
  },
  address: [addressSchema],
  cart: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
      quantity: Number,
      price: Number,
    },
  ],
  wallet: {
    type: Number,
    default: 0,
    min: 0,
    max: 100000,
  },
  walletTransaction: [
    {
      order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
      },
      orderId : String,
      amount: Number,
      transcationType: String,
      reasonType: String,
      createdAt: {
        type: Date,
        default: () => moment.tz(Date.now(), "Asia/Kolkata"),
      },
    },
  ],
  wishlist: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    },
  ],
});

module.exports = mongoose.model("User", userSchema);
