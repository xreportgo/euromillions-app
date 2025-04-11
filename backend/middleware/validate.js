/**
 * Middleware de validation avec Joi
 */
const Joi = require('joi');
const AppError = require('../utils/AppError');

/**
 * Crée un middleware de validation avec le schéma Joi spécifié
 * @param {Object} schema - Schéma Joi pour valider les données
 * @param {string} source - Source des données ('body', 'query', 'params')
 * @returns {Function} Middleware Express
 */
module.exports = (schema, source = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[source], {
      abortEarly: false,
      stripUnknown: true
    });
    
    if (error) {
      const errorMessage = error.details.map(detail => detail.message).join(', ');
      return next(new AppError(errorMessage, 400));
    }
    
    // Remplacer les données validées
    req[source] = value;
    return next();
  };
};
