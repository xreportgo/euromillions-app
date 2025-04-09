const express = require('express');
const predictionController = require('../controllers/predictionController');

const router = express.Router();

router.get('/', predictionController.predictNextDraw);

module.exports = router;
