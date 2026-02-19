import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: String,
    email: { type: String, unique: true },
    password: String,
    role: { type: String, default: "user" },
    isVerified: { type: Boolean, default: false }
  },
  { timestamps: true }
);


export default mongoose.model("User", userSchema);
