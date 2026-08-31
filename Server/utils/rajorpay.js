// initialising razorpay instance
require("dotenv").config();
const Razorpay = require("razorpay");

const key_id = (process.env.RAZORPAY_TEST_API_KEY_ID || process.env.RAZORPAY_KEY_ID || 'rzp_test_RxiHjMose0no0s').trim();
const key_secret = (process.env.RAZORPAY_TEST_KEY_SECRET || process.env.RAZORPAY_KEY_SECRET || 'Wh11eBWxn0vR7IjIfpuLrpQ1').trim();

var instance = new Razorpay({
  key_id,
  key_secret,
});

module.exports = instance;