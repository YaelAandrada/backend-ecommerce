const mongoose = requier('mongoose');

const gamrSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'El nombre es obligatorio'],
        trim: true
    },

    prince: {
        type: Number,
        required: [true, 'El precio es obligatorio'],
        min: [0, 'El precio no puede ser negativo']
    },

    category: {
        type: String,
        required: true,
        enum: ['Acción', 'Aventura', 'RPG', 'Deportes', 'Estrategia', 'Simulación']
  },
    
    image: {
    type: String,
    required: true
  },

   description: {
    type: String,
    required: true
  },

   developer: String,
  stats: {
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },

     totalReviews: {
      type: Number,
      default: 0
    },

     totalWishlist: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

//Actualizar Estadistica

gameSchema.statics.updateStats = async function(gameId) {
  const Review = mongoose.model('Review');
  
  const stats = await Review.aggregate([
    { $match: { game: gameId } },
    { $group: {
      _id: '$game',
      averageRating: { $avg: '$rating' },
      totalReviews: { $sum: 1 }
    }}
  ]);
  