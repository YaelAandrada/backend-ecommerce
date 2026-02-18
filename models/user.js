const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { type } = require('os');

const userSchema = new nongoose.Schema({
    username:{
        type: String,
        require:  [true, 'El nombre de usuario es obligatorio'],
        unique: true,
        trim: true,
        minlength: [3, 'El nombre de usuario debe tener al menos 3 caracteres'],
        maxlength: [30, 'El nombre de usuario no puede tener más de 30 caracteres'],
        match: [/^[a-zA-Z0-9_]+$/, 'El username solo puede contener letras, números y guión bajo']
    },

    email: {
        type: String,
        require:  [true, 'El email es obligatorio'],
        unique: true,
        lowercase: true,
        trim: true,
        match:  [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email inválido']
    },

    password: {
        type: String,
        require: [true, 'La contraseña es obligatoria'],
        minlength: [6, 'La contraseña debe tener al menos 6 caracteres'],
        selec: false
    },

    role: {
        type: String,
        enum:  ['user', 'admin'],
        default: 'user'
    },

    avatar: {
        type: String,
        default: 'https://res.cloudinary.com/tu-cloud/image/upload/v1/default-avatar.png'
    },

    avatarPublicId: {
    type: String,
    default: null
  },

    bio: {
    type: String,
    maxlength: [500, 'La biografía no puede tener más de 500 caracteres'],
    default: ''
  },
   
  // Estadísticas del usuario
  
  stats: {
    totalGames: {
      type: Number,
      default: 0
    },
    
    totalReviews: {
      type: Number,
      default: 0
    },
   
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
   
    memberSince: {
      type: Date,
      default: Date.now
    }
  },
   
  // Configuración del usuario
  
   settings: {
    emailNotifications: {
      type: Boolean,
      default: true
    },
    
    darkMode: {
      type: Boolean,
      default: false
    },
    
    language: {
      type: String,
      enum: ['es', 'en'],
      default: 'es'
    }
  },

  // Lista de juegos comprados (para futuro)
  
  purchasedGames: [{
    game: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Game'
    },
    
    purchasedAt: {
      type: Date,
      default: Date.now
    },
    price: Number
  }],

    // Para recuperación de contraseña
  
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  
  // Verificación de email
  
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
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtuals - Relaciones que no se guardan en DB

userSchema.virtual('wishlist', {
  ref: 'Wishlist',
  localField: '_id',
  foreignField: 'user',
  justOne: false
});

userSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'user',
  justOne: false
});

// Middleware: Hashear password antes de guardar

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Método: Comparar contraseñas

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Método: Generar JWT

userSchema.methods.generateAuthToken = function() {
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

// Método: Generar token para reset password

userSchema.methods.generateResetToken = function() {
  
    // Generar token aleatorio
  
    const resetToken = crypto.randomBytes(20).toString('hex');
  
  // Hashear token y guardar en DB
  
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  
  // Expira en 10 minutos
  
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
  
  return resetToken;
};
