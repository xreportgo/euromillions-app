/**
 * Schémas de validation pour les différentes routes
 */
const Joi = require('joi');

// Schémas de validation pour les tirages
exports.drawSchemas = {
  create: Joi.object({
    date: Joi.date().iso().required()
      .messages({
        'date.base': 'La date doit être une date valide',
        'date.empty': 'La date ne peut pas être vide',
        'date.format': 'La date doit être au format ISO (YYYY-MM-DD)',
        'any.required': 'La date est requise'
      }),
    numbers: Joi.string().pattern(/^(\d{1,2},){4}\d{1,2}$/).required()
      .messages({
        'string.pattern.base': 'Les numéros doivent être 5 chiffres séparés par des virgules',
        'any.required': 'Les numéros sont requis'
      }),
    stars: Joi.string().pattern(/^(\d{1,2},){1}\d{1,2}$/).required()
      .messages({
        'string.pattern.base': 'Les étoiles doivent être 2 chiffres séparés par une virgule',
        'any.required': 'Les étoiles sont requises'
      }),
    jackpot: Joi.string().allow('').optional(),
    winners: Joi.string().allow('').optional()
  }),
  
  update: Joi.object({
    date: Joi.date().iso().optional()
      .messages({
        'date.base': 'La date doit être une date valide',
        'date.format': 'La date doit être au format ISO (YYYY-MM-DD)'
      }),
    numbers: Joi.string().pattern(/^(\d{1,2},){4}\d{1,2}$/).optional()
      .messages({
        'string.pattern.base': 'Les numéros doivent être 5 chiffres séparés par des virgules'
      }),
    stars: Joi.string().pattern(/^(\d{1,2},){1}\d{1,2}$/).optional()
      .messages({
        'string.pattern.base': 'Les étoiles doivent être 2 chiffres séparés par une virgule'
      }),
    jackpot: Joi.string().allow('').optional(),
    winners: Joi.string().allow('').optional()
  }),
  
  getById: Joi.object({
    id: Joi.number().integer().positive().required()
      .messages({
        'number.base': 'L\'ID doit être un nombre',
        'number.integer': 'L\'ID doit être un nombre entier',
        'number.positive': 'L\'ID doit être un nombre positif',
        'any.required': 'L\'ID est requis'
      })
  }),
  
  getByDate: Joi.object({
    date: Joi.date().iso().required()
      .messages({
        'date.base': 'La date doit être une date valide',
        'date.empty': 'La date ne peut pas être vide',
        'date.format': 'La date doit être au format ISO (YYYY-MM-DD)',
        'any.required': 'La date est requise'
      })
  }),
  
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1)
      .messages({
        'number.base': 'La page doit être un nombre',
        'number.integer': 'La page doit être un nombre entier',
        'number.min': 'La page doit être au moins 1'
      }),
    limit: Joi.number().integer().min(1).max(100).default(10)
      .messages({
        'number.base': 'La limite doit être un nombre',
        'number.integer': 'La limite doit être un nombre entier',
        'number.min': 'La limite doit être au moins 1',
        'number.max': 'La limite ne peut pas dépasser 100'
      })
  })
};

// Schémas de validation pour les prédictions
exports.predictionSchemas = {
  generate: Joi.object({
    method: Joi.string().valid('frequency', 'rarity', 'pattern', 'random').default('frequency')
      .messages({
        'string.base': 'La méthode doit être une chaîne de caractères',
        'any.only': 'La méthode doit être l\'une des suivantes: frequency, rarity, pattern, random'
      })
  })
};

// Schémas de validation pour les grilles
exports.gridSchemas = {
  create: Joi.object({
    numbers: Joi.array().items(
      Joi.number().integer().min(1).max(50).required()
    ).length(5).required()
      .messages({
        'array.base': 'Les numéros doivent être un tableau',
        'array.length': 'Vous devez sélectionner exactement 5 numéros',
        'number.base': 'Les numéros doivent être des nombres',
        'number.integer': 'Les numéros doivent être des entiers',
        'number.min': 'Les numéros doivent être entre 1 et 50',
        'number.max': 'Les numéros doivent être entre 1 et 50',
        'any.required': 'Les numéros sont requis'
      }),
    stars: Joi.array().items(
      Joi.number().integer().min(1).max(12).required()
    ).length(2).required()
      .messages({
        'array.base': 'Les étoiles doivent être un tableau',
        'array.length': 'Vous devez sélectionner exactement 2 étoiles',
        'number.base': 'Les étoiles doivent être des nombres',
        'number.integer': 'Les étoiles doivent être des entiers',
        'number.min': 'Les étoiles doivent être entre 1 et 12',
        'number.max': 'Les étoiles doivent être entre 1 et 12',
        'any.required': 'Les étoiles sont requises'
      }),
    name: Joi.string().max(50).allow('').optional()
      .messages({
        'string.max': 'Le nom ne peut pas dépasser 50 caractères'
      })
  }),
  
  getById: Joi.object({
    id: Joi.number().integer().positive().required()
      .messages({
        'number.base': 'L\'ID doit être un nombre',
        'number.integer': 'L\'ID doit être un nombre entier',
        'number.positive': 'L\'ID doit être un nombre positif',
        'any.required': 'L\'ID est requis'
      })
  }),
  
  update: Joi.object({
    numbers: Joi.array().items(
      Joi.number().integer().min(1).max(50).required()
    ).length(5).optional()
      .messages({
        'array.base': 'Les numéros doivent être un tableau',
        'array.length': 'Vous devez sélectionner exactement 5 numéros',
        'number.base': 'Les numéros doivent être des nombres',
        'number.integer': 'Les numéros doivent être des entiers',
        'number.min': 'Les numéros doivent être entre 1 et 50',
        'number.max': 'Les numéros doivent être entre 1 et 50'
      }),
    stars: Joi.array().items(
      Joi.number().integer().min(1).max(12).required()
    ).length(2).optional()
      .messages({
        'array.base': 'Les étoiles doivent être un tableau',
        'array.length': 'Vous devez sélectionner exactement 2 étoiles',
        'number.base': 'Les étoiles doivent être des nombres',
        'number.integer': 'Les étoiles doivent être des entiers',
        'number.min': 'Les étoiles doivent être entre 1 et 12',
        'number.max': 'Les étoiles doivent être entre 1 et 12'
      }),
    name: Joi.string().max(50).allow('').optional()
      .messages({
        'string.max': 'Le nom ne peut pas dépasser 50 caractères'
      })
  })
};
