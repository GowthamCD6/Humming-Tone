// initialising razorpay instance
require("dotenv").config();
const Razorpay = require("razorpay");

const key_id = (process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_TEST_API_KEY_ID || "").trim();
const key_secret = (process.env.RAZORPAY_KEY_SECRET || process.env.RAZORPAY_TEST_KEY_SECRET || "").trim();

if (!key_id || !key_secret) {
  console.warn("⚠️ [Razorpay] RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET is not configured in .env");
}

const instance = new Razorpay({
  key_id,
  key_secret,
});

module.exports = instance;