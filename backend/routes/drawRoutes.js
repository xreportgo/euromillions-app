/**
 * Routes pour la gestion des tirages
 */
const express = require('express');
const router = express.Router();
const drawController = require('../controllers/drawController');
const validate = require('../middleware/validate');
const { drawSchemas } = require('../middleware/validateSchemas');

// GET /api/draws - Récupérer tous les tirages avec pagination
router.get('/', validate(drawSchemas.pagination, 'query'), drawController.getAllDraws);

// GET /api/draws/latest - Récupérer le dernier tirage
router.get('/latest', drawController.getLatestDraw);

// GET /api/draws/:id - Récupérer un tirage par ID
router.get('/:id', validate(drawSchemas.getById, 'params'), drawController.getDrawById);

// GET /api/draws/date/:date - Récupérer un tirage par date
router.get('/date/:date', validate(drawSchemas.getByDate, 'params'), drawController.getDrawByDate);

// POST /api/draws - Ajouter un nouveau tirage
router.post('/', validate(drawSchemas.create), drawController.addDraw);

// PUT /api/draws/:id - Mettre à jour un tirage
router.put('/:id', validate(drawSchemas.getById, 'params'), validate(drawSchemas.update), drawController.updateDraw);

// DELETE /api/draws/:id - Supprimer un tirage
router.delete('/:id', validate(drawSchemas.getById, 'params'), drawController.deleteDraw);

module.exports = router;
