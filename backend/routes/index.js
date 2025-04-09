/**
 * @file index.js
 * @description Fichier principal des routes de l'API EuroMillions
 */

const express = require('express');
const router = express.Router();

const drawRoutes = require('./drawRoutes');
const gridRoutes = require('./gridRoutes');
const predictionRoutes = require('./predictionRoutes');
const statsRoutes = require('./statsRoutes');

// Info sur l'API
router.get('/', (req, res) => {
    res.status(200).json({
        message: 'API EuroMillions',
        version: '1.0.0',
        endpoints: {
            draws: '/api/draws',
            grids: '/api/grids',
            predictions: '/api/predictions',
            stats: '/api/stats'
        }
    });
});

// Assembler les routes
router.use('/draws', drawRoutes);
router.use('/grids', gridRoutes);
router.use('/predictions', predictionRoutes);
router.use('/stats', statsRoutes);

// Gestion des erreurs 404 pour les routes non trouvées
router.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: `Route non trouvée: ${req.originalUrl}`
    });
});

module.exports = router;
