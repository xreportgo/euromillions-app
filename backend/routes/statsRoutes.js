const express = require('express');
const statsController = require('../controllers/statsController');

const router = express.Router();

router.get('/frequency', statsController.getFrequencyStats);
router.get('/jackpot', statsController.getJackpotStats);
router.get('/pairs', statsController.getPairStats);

module.exports = router;
