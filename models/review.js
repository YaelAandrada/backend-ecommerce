const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({

    user: {
        typer: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'El usuario es obligatorio']
    },

    game: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Game',
        required: [true, 'El juego es obligatorio']
    },

    rating: {
        type: Number,
        required: [true, 'La calificación es obligatoria'],
        min: [1, 'La calificación mínima es 1'],
        max: [5, 'La calificación máxima es 5']
    },

    title: {
    type: String,
    required: [true, 'El título es obligatorio'],
    trim: true,
    maxlength: [100, 'El título no puede tener más de 100 caracteres']
  },
   
  comment: {
    type: String,
    required: [true, 'El comentario es obligatorio'],
    trim: true,
    maxlength: [1000, 'El comentario no puede tener más de 1000 caracteres']
  },
   
  pros: [{
    type: String,
    trim: true,
    maxlength: [200, 'Cada aspecto positivo no puede tener más de 200 caracteres']
  }],

  cons: [{
    type: String,
    trim: true,
    maxlength: [200, 'Cada aspecto negativo no puede tener más de 200 caracteres']
  }],

  //Respuesta del Admin

   response: {
    comment: String,
    respondedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    respondedAt: Date
  },

  //Votos de las reseña

   helpful: {
    count: {
      type: Number,
      default: 0
    },
    users: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }]
  },

  userSnapshot: {
    username: String,
    avatar: String,
    gamesCount: Number
  }
}, {
  timestamps: true
});

//Para evitar reseñas duplicadas

reviewSchema.index({ user: 1, game: 1 }, { unique: true });


reviewSchema.pre('save', async function(next) {
  if (this.isNew) {
    const User = mongoose.model('User');
    const user = await User.findById(this.user);

    this.usersnaphot = {
        username: user.username,
        avatar: user.avatar,
        gamesCount: user.purchasedGames.length
    };
  }
  
  next();

});

//Middleware, actualizar estadisticas del juego

reviewSchema.post('save', async function() {
  const Game = mongoose.model('Game');
  await Game.updateStats(this.game);
});

//Marcar como Util

reviewSchema.statics.markHelpful = async function(reviewId, userId) {
  const review = await this.findById(reviewId);
  
  if (!review) {
    throw new Error('Reseña no encontrada');
  }

  //Se verifica si el usurio ya marcó, quitar voto - agregar voto 

   const alreadyHelpful = review.helpful.users.includes(userId);
  
  if (alreadyHelpful) {
    
    review.helpful.users = review.helpful.users.filter(
      id => id.toString() !== userId.toString()
    );
    review.helpful.count = review.helpful.users.length;
  } else { 
    review.helpful.users.push(userId);
    review.helpful.count = review.helpful.users.length;
  }
  
  await review.save();
  return review;
};

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;