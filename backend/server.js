const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const winston = require('winston');
const fs = require('fs');
const routes = require('./routes');

// Configuration de base
const app = express();
const PORT = process.env.PORT || 3000;

// Création du répertoire logs s'il n'existe pas
const logDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Configuration du logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => {
      return `[${timestamp}] [${level.toUpperCase()}] [server] ${message}`;
    })
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ 
      filename: path.join(__dirname, 'logs/server.log') 
    })
  ]
});

// Middleware de base
// Configuration personnalisée de Helmet pour permettre les CDN et les scripts inline
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
      imgSrc: ["'self'", "data:", "https:"],
      fontSrc: ["'self'", "https:", "data:"],
      connectSrc: ["'self'", "http://localhost:3000"],
    },
  },
}));

app.use(cors()); // CORS
app.use(express.json()); // Parsing JSON
app.use(express.urlencoded({ extended: true })); // Parsing URL-encoded
app.use(morgan('combined')); // Journalisation des requêtes HTTP

// Servir les fichiers statiques du frontend
app.use(express.static(path.join(__dirname, '../frontend/public')));

// Routes API
app.use('/api', routes);

// Route de base pour l'API
app.get('/api', (req, res) => {
  res.json({
    message: 'Bienvenue sur l\'API EuroMillions!',
    version: '1.0.0',
    documentation: '/api/docs'
  });
});

// Redirection de toutes les autres routes vers l'application frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/public/index.html'));
});

// Gestion des erreurs 404
app.use((req, res, next) => {
  res.status(404).json({
    error: 'Ressource non trouvée',
    path: req.path
  });
});

// Gestion des erreurs générales
app.use((err, req, res, next) => {
  logger.error(`Erreur: ${err.message}`);
  
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' ? 'Erreur serveur' : err.message
  });
});

// Démarrage du serveur
app.listen(PORT, () => {
  logger.info(`Serveur démarré sur le port ${PORT}`);
  logger.info(`Mode: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
