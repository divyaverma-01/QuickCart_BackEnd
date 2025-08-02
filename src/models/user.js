import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true }, // Enforces unique usernames
    lastName: { type: String, required: true }, // Enforces unique usernames
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // Store hashed password (use bcrypt)
    role: { type: String, enum: ["user", "admin"], default: "user" }, // For role-based auth
    profileImage: { type: String, default: "" }, // Store profile image URL
    razorpayAccountId: { type: String, default: null }, // Razorpay sub-account ID for merchants (used for transfers)
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
