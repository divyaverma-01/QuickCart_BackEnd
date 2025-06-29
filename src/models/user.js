import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true }, // Enforces unique usernames
    lastName: { type: String, required: true }, // Enforces unique usernames
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // Store hashed password (use bcrypt)
    role: { type: String, default: "user" }, // For role-based auth
    profileImage: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
