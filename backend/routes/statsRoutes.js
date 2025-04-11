/**
 * Routes pour les statistiques
 */
const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');

// GET /api/stats - Statistiques générales
router.get('/', function(req, res) {
  // Implémentation temporaire pour éviter l'erreur
  res.json({
    message: "Statistiques générales",
    status: "En cours de développement"
  });
});

// GET /api/stats/numbers - Fréquences des numéros
router.get('/numbers', function(req, res) {
  // Implémentation temporaire pour éviter l'erreur
  res.json({
    message: "Fréquences des numéros",
    status: "En cours de développement"
  });
});

// GET /api/stats/stars - Fréquences des étoiles
router.get('/stars', function(req, res) {
  // Implémentation temporaire pour éviter l'erreur
  res.json({
    message: "Fréquences des étoiles",
    status: "En cours de développement"
  });
});

// GET /api/stats/intervals - Statistiques des intervalles
router.get('/intervals', function(req, res) {
  // Implémentation temporaire pour éviter l'erreur
  res.json({
    message: "Statistiques des intervalles",
    status: "En cours de développement"
  });
});

module.exports = router;
