const express = require('express');
const gridController = require('../controllers/gridController');
const router = express.Router();

// Routes
router.get('/', gridController.getAllGrids);
router.get('/export', gridController.exportGrids);
router.get('/:id', gridController.getGridById);
router.post('/generate', gridController.generateGrid);
router.post('/', gridController.saveGrid);
router.put('/:id', gridController.updateGrid);
router.delete('/:id', gridController.deleteGrid);

module.exports = router;

