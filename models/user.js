import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "El nombre de usuario es obligatorio"],
      unique: true,
      trim: true,
      minlength: [3, "El nombre de usuario debe tener al menos 3 caracteres"],
      maxlength: [30, "El nombre de usuario no puede tener más de 30 caracteres"],
      match: [/^[a-zA-Z0-9_]+$/, "El username solo puede contener letras, números y guión bajo"]
    },

    email: {
      type: String,
      required: [true, "El email es obligatorio"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Email inválido"]
    },

    password: {
      type: String,
      required: [true, "La contraseña es obligatoria"],
      minlength: [6, "La contraseña debe tener al menos 6 caracteres"],
      select: false
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user"
    },

    avatar: {
      type: String,
      default: "https://res.cloudinary.com/tu-cloud/image/upload/v1/default-avatar.png"
    },

    avatarPublicId: {
      type: String,
      default: null
    },

    bio: {
      type: String,
      maxlength: [500, "La biografía no puede tener más de 500 caracteres"],
      default: ""
    },

    // Estadísticas
    stats: {
      totalGames: { type: Number, default: 0 },
      totalReviews: { type: Number, default: 0 },
      averageRating: { type: Number, default: 0, min: 0, max: 5 },
      memberSince: { type: Date, default: Date.now }
    },

    // Configuración
    settings: {
      emailNotifications: { type: Boolean, default: true },
      darkMode: { type: Boolean, default: false },
      language: { type: String, enum: ["es", "en"], default: "es" }
    },

    // Juegos comprados
    purchasedGames: [
      {
        game: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Game"
        },
        purchasedAt: {
          type: Date,
          default: Date.now
        },
        price: Number
      }
    ],

    // Reset password
    resetPasswordToken: String,
    resetPasswordExpire: Date,

    // Email verification
    emailVerified: {
      type: Boolean,
      default: false
    },
    emailVerificationToken: String,

    // Última actividad
    lastActive: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// ================= VIRTUALS =================

userSchema.virtual("wishlist", {
  ref: "Wishlist",
  localField: "_id",
  foreignField: "user"
});

userSchema.virtual("reviews", {
  ref: "Review",
  localField: "_id",
  foreignField: "user"
});

// ================= HASH PASSWORD =================

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ================= MÉTODOS =================

userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.generateAuthToken = function () {
  return jwt.sign(
    {
      id: this._id,
      username: this.username,
      role: this.role,
      email: this.email
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );
};

userSchema.methods.generateResetToken = function () {
  const resetToken = crypto.randomBytes(20).toString("hex");

  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

userSchema.methods.generateVerificationToken = function () {
  const token = crypto.randomBytes(32).toString("hex");

  this.emailVerificationToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  return token;
};

userSchema.methods.updateLastActive = function () {
  this.lastActive = Date.now();
  return this.save({ validateBeforeSave: false });
};

// ================= STATIC =================

userSchema.statics.findByEmailWithPassword = function (email) {
  return this.findOne({ email }).select("+password");
};

// ================= ÍNDICES =================

// unique ya crea índices en email y username
userSchema.index({ "stats.totalReviews": -1 });

// ================= EXPORT =================

export default mongoose.model("User", userSchema);
