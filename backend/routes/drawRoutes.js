const express = require('express');
const drawController = require('../controllers/drawController');

const router = express.Router();

// Routes publiques
router.get('/', drawController.getAllDraws);
router.get('/latest', drawController.getLatestDraw);
router.get('/:date', drawController.getDrawByDate);

// Routes protégées
router.post('/', drawController.addDraw);
router.put('/:id', drawController.updateDraw);
router.delete('/:id', drawController.deleteDraw);

module.exports = router;
