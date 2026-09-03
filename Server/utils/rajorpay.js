// initialising razorpay instance
require("dotenv").config();
const Razorpay = require("razorpay");

const key_id = (process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_TEST_API_KEY_ID || "").trim();
const key_secret = (process.env.RAZORPAY_KEY_SECRET || process.env.RAZORPAY_TEST_KEY_SECRET || "").trim();

let instance;

if (key_id && key_secret) {
  instance = new Razorpay({
    key_id,
    key_secret,
  });
} else {
  console.warn("⚠️ [Razorpay] RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET is not configured in .env. Server running in standby mode for payments.");
  instance = {
    orders: {
      create: async () => {
        throw new Error("Razorpay credentials (RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET) are not configured in Server/.env");
      },
      fetchPayments: async () => [],
    }
  };
}

module.exports = instance;