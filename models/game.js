import mongoose from "mongoose";

const gameSchema = new mongoose.Schema(
  {
    // ================= RAWG API DATA =================
    rawgId: { type: Number, unique: true },
    title: { type: String, required: true }, // nombre principal (RAWG)
    description: String,
    imageUrl: String,
    releaseDate: String,
    platform: [String],
    category: [String], // géneros RAWG

    // ================= TIENDA LOCAL =================
    name: {
      type: String,
      trim: true
    },

    price: {
      type: Number,
      default: 0,
      min: 0
    },

    image: String, // imagen local (si no usás RAWG)
    developer: String,

    // ================= REVIEWS & STATS =================
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },

    reviews: {
      positive: { type: Number, default: 0 },
      negative: { type: Number, default: 0 }
    },

    stats: {
      averageRating: { type: Number, default: 0, min: 0, max: 5 },
      totalReviews: { type: Number, default: 0 },
      totalWishlist: { type: Number, default: 0 }
    }
  },
  {
    timestamps: true
  }
);

// ================= ACTUALIZAR ESTADÍSTICAS =================
gameSchema.statics.updateStats = async function (gameId) {
  const Review = mongoose.model("Review");

  const stats = await Review.aggregate([
    { $match: { game: gameId } },
    {
      $group: {
        _id: "$game",
        averageRating: { $avg: "$rating" },
        totalReviews: { $sum: 1 }
      }
    }
  ]);

  if (stats.length > 0) {
    await this.findByIdAndUpdate(gameId, {
      "stats.averageRating": stats[0].averageRating,
      "stats.totalReviews": stats[0].totalReviews
    });
  }
};

// ================= EXPORT SEGURO =================
const Game = mongoose.models.Game || mongoose.model("Game", gameSchema);
export default Game;
