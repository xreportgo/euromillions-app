const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const winston = require('winston');

// Création du logger pour la base de données
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => {
      return `[${timestamp}] [${level.toUpperCase()}] [database] ${message}`;
    })
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({
      filename: path.join(__dirname, '../logs/database.log')
    })
  ]
});

// Assurez-vous que le répertoire logs existe
const logDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Assurez-vous que le répertoire db existe
const dbDir = path.join(__dirname, '.');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Chemin vers la base de données
const dbPath = path.join(__dirname, 'euromillions.sqlite');

// Création de la base de données
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    logger.error(`Erreur lors de la connexion à la base de données: ${err.message}`);
    return;
  }
  logger.info('Connexion à la base de données SQLite établie');
});

// Configuration de la base de données
db.serialize(() => {
  // Activation des clés étrangères
  db.run('PRAGMA foreign_keys = ON');
});

/**
 * Exécute une requête SQL avec des paramètres
 * @param {string} sql - Requête SQL
 * @param {Array} params - Paramètres pour la requête
 * @returns {Promise} - Promesse résolue avec les résultats ou rejetée en cas d'erreur
 */
function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) {
        logger.error(`Erreur d'exécution SQL: ${err.message}`);
        reject(err);
        return;
      }
      resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

/**
 * Exécute une requête SQL et retourne la première ligne du résultat
 * @param {string} sql - Requête SQL
 * @param {Array} params - Paramètres pour la requête
 * @returns {Promise} - Promesse résolue avec le résultat ou rejetée en cas d'erreur
 */
function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        logger.error(`Erreur de récupération SQL: ${err.message}`);
        reject(err);
        return;
      }
      resolve(row);
    });
  });
}

/**
 * Exécute une requête SQL et retourne toutes les lignes du résultat
 * @param {string} sql - Requête SQL
 * @param {Array} params - Paramètres pour la requête
 * @returns {Promise} - Promesse résolue avec les résultats ou rejetée en cas d'erreur
 */
function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        logger.error(`Erreur de récupération SQL: ${err.message}`);
        reject(err);
        return;
      }
      resolve(rows);
    });
  });
}

/**
 * Ferme la connexion à la base de données
 * @returns {Promise} - Promesse résolue lorsque la connexion est fermée
 */
function close() {
  return new Promise((resolve, reject) => {
    db.close((err) => {
      if (err) {
        logger.error(`Erreur lors de la fermeture de la base de données: ${err.message}`);
        reject(err);
        return;
      }
      logger.info('Connexion à la base de données fermée');
      resolve();
    });
  });
}

// Exporter les fonctions utilitaires
module.exports = {
  db,
  run,
  get,
  all,
  close
};
