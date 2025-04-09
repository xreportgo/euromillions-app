// models/gridModel.js
const mongoose = require('mongoose');

const gridSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  numbers: {
    type: [Number],
    required: true,
    validate: {
      validator: function(numbers) {
        return numbers.length === 5 && 
               numbers.every(num => num >= 1 && num <= 50);
      },
      message: 'Une grille doit contenir exactement 5 numéros entre 1 et 50'
    }
  },
  stars: {
    type: [Number],
    required: true,
    validate: {
      validator: function(stars) {
        return stars.length === 2 && 
               stars.every(star => star >= 1 && star <= 12);
      },
      message: 'Une grille doit contenir exactement 2 étoiles entre 1 et 12'
    }
  },
  method: {
    type: String,
    enum: ['random', 'frequency', 'hot_numbers', 'custom', 'manual'],
    default: 'manual'
  },
  confidence: {
    type: Number,
    min: 0,
    max: 1,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Si vous implémentez l'authentification plus tard
  }
});

// Index pour améliorer les performances de recherche
gridSchema.index({ userId: 1, createdAt: -1 });

const Grid = mongoose.model('Grid', gridSchema);

module.exports = Grid;
