/**
 * Fichier principal des routes de l'API EuroMillions
 */
const express = require('express');
const router = express.Router();

// Info sur l'API
router.get('/', (req, res) => {
  res.status(200).json({
    message: 'API EuroMillions',
    version: '1.0.0',
    status: 'En construction'
  });
});

// Créer une route temporaire pour les prédictions
router.get('/predictions', (req, res) => {
  const numbers = [];
  const stars = [];
  
  // Générer 5 numéros aléatoires entre 1 et 50
  while (numbers.length < 5) {
    const num = Math.floor(Math.random() * 50) + 1;
    if (!numbers.includes(num)) {
      numbers.push(num);
    }
  }
  
  // Générer 2 étoiles aléatoires entre 1 et 12
  while (stars.length < 2) {
    const star = Math.floor(Math.random() * 12) + 1;
    if (!stars.includes(star)) {
      stars.push(star);
    }
  }
  
  numbers.sort((a, b) => a - b);
  stars.sort((a, b) => a - b);
  
  res.json({
    method: req.query.method || 'random',
    prediction: {
      date: new Date().toISOString().split('T')[0],
      numbers,
      stars
    },
    disclaimer: "Version temporaire: les prédictions sont générées aléatoirement"
  });
});

// Créer une route temporaire pour les statistiques
router.get('/stats', (req, res) => {
  res.json({
    message: "Statistiques générales",
    status: "En cours de développement"
  });
});

// Gestion des erreurs 404 pour les routes non trouvées
router.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route non trouvée: ${req.originalUrl}`
  });
});

module.exports = router;
