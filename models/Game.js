import mongoose from "mongoose";

const GameSchema = new mongoose.Schema({
  rawgId: { type: Number, unique: true }, // ID único de RAWG
  title: { type: String, required: true },
  description: String,
  imageUrl: String,
  price: { type: Number, default: 0 }, // si querés manejar precios manualmente
  category: [String], // géneros
  platform: [String], // plataformas
  releaseDate: String,
  rating: { type: Number, default: 0 },
  developer: String,
  reviews: {
    positive: { type: Number, default: 0 },
    negative: { type: Number, default: 0 }
  }
}, { timestamps: true });

export default mongoose.model("Game", GameSchema);