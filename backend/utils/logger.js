// backend/utils/logger.js
/**
 * Module de logging centralisé
 */
const winston = require('winston');
const path = require('path');
const fs = require('fs');

// Créer le répertoire des logs s'il n'existe pas
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Configuration du format
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.printf(({ timestamp, level, message, stack }) => {
    return `${timestamp} [${level}]: ${message} ${stack || ''}`;
  })
);

// Création du logger
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: logFormat,
  defaultMeta: { service: 'euromillions-app' },
  transports: [
    // Fichier pour tous les logs
    new winston.transports.File({ 
      filename: path.join(logsDir, 'app.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    // Fichier spécifique pour les erreurs
    new winston.transports.File({ 
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  ]
});

// En développement, également afficher dans la console
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

// Version minimaliste pour éviter les erreurs si winston n'est pas installé
const fallbackLogger = {
  info: (message) => console.log(`[INFO] ${message}`),
  error: (message, error) => console.error(`[ERROR] ${message}`, error),
  warn: (message) => console.warn(`[WARN] ${message}`),
  debug: (message) => console.debug(`[DEBUG] ${message}`)
};

// Exporter le logger ou une version de fallback
try {
  module.exports = logger;
} catch (error) {
  console.warn('Winston logger initialization failed, using fallback logger');
  module.exports = fallbackLogger;
}
