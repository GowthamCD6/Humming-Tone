// initialising razorpay instance

require("dotenv")
const Razorpay = require("razorpay");

var instance = new Razorpay({
  key_id: process.env.RAZORPAY_TEST_API_KEY_ID,
  key_secret: process.env.RAZORPAY_TEST_KEY_SECRET,
});

module.exports = instance;