/**
 * Middleware de limitation de taux de requêtes
 */
const rateLimit = require('express-rate-limit');
const config = require('../config');
const logger = require('../utils/logger');

/**
 * Crée un middleware de limitation de taux de requêtes
 */
const apiLimiter = rateLimit({
  windowMs: config.rateLimit?.windowMs || 15 * 60 * 1000, // 15 minutes par défaut
  max: config.rateLimit?.max || 100, // 100 requêtes max par fenêtre
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`Limite de taux dépassée: ${req.ip}`);
    res.status(429).json({
      status: 'error',
      message: 'Trop de requêtes, veuillez réessayer plus tard.'
    });
  }
});

module.exports = apiLimiter;
