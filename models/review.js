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
})