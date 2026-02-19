import mongoose from "mongoose";
import crypto from "crypto";

const wishlistSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },

    items: [
      {
        game: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Game",
          required: true
        },

        addedAt: {
          type: Date,
          default: Date.now
        },

        price: {
          type: Number,
          min: 0
        },

        // Notificar cuando baje el precio
        notify: {
          type: Boolean,
          default: false
        }
      }
    ],

    isPublic: {
      type: Boolean,
      default: false
    },

    shareToken: {
      type: String,
      unique: true,
      sparse: true
    }
  },
  { timestamps: true }
);

/* ================= INDEX ================= */

// Evitar duplicados dentro del array
wishlistSchema.index(
  { user: 1, "items.game": 1 },
  { unique: true, sparse: true }
);

/* ================= METHODS ================= */

// Agregar juego
wishlistSchema.methods.addGame = async function (gameId, price = null) {
  const exists = this.items.some(
    (item) => item.game.toString() === gameId.toString()
  );

  if (exists) {
    throw new Error("El juego ya está en la lista de deseos");
  }

  this.items.push({
    game: gameId,
    price,
    addedAt: new Date()
  });

  await this.save();
  return this;
};

// Quitar juego
wishlistSchema.methods.removeGame = async function (gameId) {
  this.items = this.items.filter(
    (item) => item.game.toString() !== gameId.toString()
  );

  await this.save();
  return this;
};

// Generar token compartido
wishlistSchema.methods.generateShareToken = function () {
  this.shareToken = crypto.randomBytes(16).toString("hex");
  return this.shareToken;
};

// Obtener o crear wishlist
wishlistSchema.statics.getOrCreate = async function (userId) {
  let wishlist = await this.findOne({ user: userId }).populate("items.game");

  if (!wishlist) {
    wishlist = await this.create({ user: userId, items: [] });
  }

  return wishlist;
};

const Wishlist = mongoose.model("Wishlist", wishlistSchema);

export default Wishlist;
