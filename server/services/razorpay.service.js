import dotenv from "dotenv"
dotenv.config()
import Razorpay from "razorpay"

let razorpay = null;

try {
  if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  } else {
    console.warn("⚠️ Razorpay keys are missing. Payments will not work.");
  }
} catch (error) {
  console.error("⚠️ Failed to initialize Razorpay:", error.message);
}

export default razorpay