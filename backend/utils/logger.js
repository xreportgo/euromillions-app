const winston = require('winston');
const path = require('path');

// Configuration du format de log
const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.printf(({ timestamp, level, message }) => {
    return `[${timestamp}] [${level.toUpperCase()}] ${message}`;
  })
);

// Création du logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  transports: [
    // Console logs
    new winston.transports.Console(),
    // Fichier pour tous les logs
    new winston.transports.File({ 
      filename: path.join(__dirname, '../logs/combined.log') 
    }),
    // Fichier séparé pour les erreurs
    new winston.transports.File({ 
      filename: path.join(__dirname, '../logs/error.log'), 
      level: 'error' 
    })
  ]
});

// Création du répertoire logs s'il n'existe pas
const fs = require('fs');
const logDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

module.exports = logger;
