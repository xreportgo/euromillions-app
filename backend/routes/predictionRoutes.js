/**
 * Routes pour les prédictions
 */
const express = require('express');
const router = express.Router();
const predictionController = require('../controllers/predictionController');
const validate = require('../middleware/validate');
const { predictionSchemas } = require('../middleware/validateSchemas');

// GET /api/predictions - Générer une prédiction
router.get('/', validate(predictionSchemas.generate, 'query'), predictionController.predictDraw);

module.exports = router;
