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
