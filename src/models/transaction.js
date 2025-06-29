import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  amount: Number,
  currency: { type: String, default: "INR" },
  status: {
    type: String,
    enum: ["pending", "success", "failed"],
    default: "pending",
  },
  paymentMethod: String,
  timestamp: { type: Date, default: Date.now },
});

export default mongoose.model("Transaction", transactionSchema);
