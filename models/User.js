import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const userSchema = new mongoose.Schema(
  {
    // ================= DATOS BÁSICOS =================
    username: {
      type: String,
      required: [true, "El nombre de usuario es obligatorio"],
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
      match: [/^[a-zA-Z0-9_]+$/, "Solo letras, números y _"]
    },

    email: {
      type: String,
      required: [true, "El email es obligatorio"],
      unique: true,
      lowercase: true,
      trim: true
    },

    password: {
      type: String,
      required: [true, "La contraseña es obligatoria"],
      minlength: 6,
      select: false
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user"
    },

    // ================= PERFIL =================
    avatar: {
      type: String,
      default: "https://res.cloudinary.com/tu-cloud/image/upload/v1/default-avatar.png"
    },

    bio: {
      type: String,
      maxlength: 500,
      default: ""
    },

    // ================= ESTADÍSTICAS =================
    stats: {
      totalGames: { type: Number, default: 0 },
      totalReviews: { type: Number, default: 0 },
      averageRating: { type: Number, default: 0 }
    },

    // ================= CONFIG =================
    settings: {
      emailNotifications: { type: Boolean, default: true },
      darkMode: { type: Boolean, default: false },
      language: { type: String, default: "es" }
    },

    // ================= JUEGOS COMPRADOS =================
    purchasedGames: [
      {
        game: { type: mongoose.Schema.Types.ObjectId, ref: "Game" },
        purchasedAt: { type: Date, default: Date.now },
        price: Number
      }
    ],

    // ================= RESET PASSWORD =================
    resetPasswordToken: String,
    resetPasswordExpire: Date,

    // ================= VERIFICACIÓN EMAIL =================
    emailVerified: { type: Boolean, default: false },
    emailVerificationToken: String,

    // ================= ÚLTIMA ACTIVIDAD =================
    lastActive: { type: Date, default: Date.now }
  },
  {
    timestamps: true
  }
);

// ================= HASH PASSWORD =================
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// ================= MÉTODOS =================
userSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.password);
};

userSchema.methods.generateAuthToken = function () {
  if(!process.env.JWT_SECRET){
    throw new Error ('JWT_SECRET no esta definido');
  }

  return jwt.sign(
    { id: this._id, role: this.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};


// ================= VERIFICACIÓN EMAIL =================

userSchema.methods.generateEmailVerificationToken = function () {
  return jwt.sign(
    { id: this._id },
    process.env.JWT_SECRET,
    {expiresIn: "1d"}
  )
}

//================ ACTUALIZAR ULTIMA VEZ ================

userSchema.methods.updateLastActive = async function () {
  this.lastActive = new Date();
  await this.save();
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

// ================= EXPORT SEGURO (ANTI DUPLICADOS) =================
const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;
