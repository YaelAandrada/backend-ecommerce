import mongoose from "mongoose";

const GameSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  image: String,
  price: { type: Number, default: 0 },
  category: String,
}, { timestamps: true });

export default mongoose.model("Game", GameSchema);