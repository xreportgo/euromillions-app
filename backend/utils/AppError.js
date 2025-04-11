// backend/utils/AppError.js
/**
 * Classe d'erreur personnalisée pour l'application
 */
class AppError extends Error {
  /**
   * @param {string} message - Message d'erreur
   * @param {number} statusCode - Code HTTP de l'erreur
   * @param {boolean} isOperational - Indique si l'erreur est opérationnelle ou programmation
   */
  constructor(message, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
