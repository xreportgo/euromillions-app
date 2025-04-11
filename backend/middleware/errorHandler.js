/**
 * Middleware de gestion d'erreurs centralisé
 */
const AppError = require('../utils/AppError');
const config = require('../config');
const logger = require('../utils/logger');

/**
 * Gère les erreurs de validation
 */
const handleValidationError = (err) => {
  const errors = Object.values(err.errors || {}).map(el => el.message);
  const message = `Données invalides. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

/**
 * Gère les erreurs de SQLite
 */
const handleSqliteError = (err) => {
  if (err.code === 'SQLITE_CONSTRAINT') {
    return new AppError('Violation de contrainte de base de données', 400);
  }
  return new AppError('Erreur de base de données', 500);
};

/**
 * Gère les erreurs de JWT
 */
const handleJWTError = () => new AppError('Token invalide. Veuillez vous reconnecter.', 401);

/**
 * Gère les erreurs d'expiration de JWT
 */
const handleJWTExpiredError = () => new AppError('Votre session a expiré. Veuillez vous reconnecter.', 401);

/**
 * Gère les erreurs du module Joi
 */
const handleJoiError = (err) => {
  const errorDetails = err.details.map(detail => detail.message).join(', ');
  return new AppError(`Validation échouée: ${errorDetails}`, 400);
};

/**
 * Formate et envoie les erreurs en environnement de développement
 */
const sendErrorDev = (err, res) => {
  logger.error(`ERREUR ${err.statusCode}: ${err.message}`, { stack: err.stack });
  
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    stack: err.stack,
    error: err
  });
};

/**
 * Formate et envoie les erreurs en environnement de production
 */
const sendErrorProd = (err, res) => {
  // Erreurs opérationnelles: envoyées au client
  if (err.isOperational) {
    logger.error(`ERREUR OPÉRATIONNELLE ${err.statusCode}: ${err.message}`);
    
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });
  } 
  // Erreurs de programmation: ne pas divulguer les détails
  else {
    logger.error('ERREUR NON OPÉRATIONNELLE:', err);
    
    res.status(500).json({
      status: 'error',
      message: 'Une erreur est survenue. Veuillez réessayer plus tard.'
    });
  }
};

/**
 * Middleware de gestion globale des erreurs
 */
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  
  if (config.env === 'development') {
    sendErrorDev(err, res);
  } else if (config.env === 'production') {
    let error = { ...err };
    error.message = err.message;
    error.stack = err.stack;
    
    // Gérer les différents types d'erreurs
    if (error.name === 'ValidationError') error = handleValidationError(error);
    if (error.code && error.code.startsWith('SQLITE_')) error = handleSqliteError(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();
    if (error.isJoi) error = handleJoiError(error);
    
    sendErrorProd(error, res);
  }
};
