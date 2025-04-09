const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const scrapingService = require('../services/scrapingService');
const drawModel = require('../models/drawModel');

// Assurez-vous que le répertoire db existe
const dbDir = path.join(__dirname, '../db');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(__dirname, '../db/euromillions.sqlite');
const db = new sqlite3.Database(dbPath);

/**
 * Initialise la base de données avec le schéma et les données initiales
 */
async function initDatabase() {
  console.log('[initDb] Démarrage de l\'initialisation de la base de données');
  
  try {
    // Création des tables
    await createTables();
    
    // Vérification si des données existent déjà
    const count = await getDrawCount();
    
    if (count === 0) {
      console.log('[initDb] Aucun tirage trouvé dans la base de données. Récupération de l\'historique...');
      
      // Récupération de l'historique complet à partir de 2004
      const startYear = 2004;
      const currentYear = new Date().getFullYear();
      
      console.log(`[initDb] Récupération des tirages de ${startYear} à ${currentYear}...`);
      
      // Option 1: Récupérer via le service de scraping
      console.log('[initDb] Méthode: Scraping en direct');
      const allDraws = [];
      
      for (let year = startYear; year <= currentYear; year++) {
        console.log(`[initDb] Scraping année ${year}...`);
        const yearDraws = await scrapingService.scrapeYear(year);
        allDraws.push(...yearDraws);
        console.log(`[initDb] ${yearDraws.length} tirages récupérés pour l'année ${year}`);
        
        // Pause entre chaque année
        if (year < currentYear) {
          console.log('[initDb] Pause de 2 secondes...');
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
      
      console.log(`[initDb] ${allDraws.length} tirages récupérés au total.`);
      
      if (allDraws.length > 0) {
        console.log('[initDb] Insertion des tirages dans la base de données...');
        await insertDraws(allDraws);
        console.log('[initDb] Initialisation terminée avec succès');
      } else {
        console.warn('[initDb] Aucun tirage récupéré via le scraping. Génération de données de test...');
        
        // Option 2: Si le scraping a échoué, utiliser des données de test
        const testDraws = generateTestDraws();
        await insertDraws(testDraws);
        
        console.log('[initDb] Initialisation avec données de test terminée');
      }
    } else {
      console.log(`[initDb] La base de données contient déjà ${count} tirages`);
    }
  } catch (error) {
    console.error(`[initDb] Erreur lors de l'initialisation: ${error.message}`);
  } finally {
    // Fermeture de la connexion à la base de données
    db.close();
  }
}

/**
 * Crée les tables nécessaires dans la base de données
 */
function createTables() {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Table des tirages
      db.run(`
        CREATE TABLE IF NOT EXISTS draws (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          draw_date TEXT NOT NULL,
          numbers TEXT NOT NULL,
          stars TEXT NOT NULL,
          jackpot REAL,
          jackpot_winners INTEGER,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      // Index sur la date de tirage pour les recherches rapides
      db.run('CREATE INDEX IF NOT EXISTS idx_draw_date ON draws(draw_date)');
      
      // Table des grilles générées
      db.run(`
        CREATE TABLE IF NOT EXISTS grids (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          numbers TEXT NOT NULL,
          stars TEXT NOT NULL,
          generation_method TEXT NOT NULL,
          confidence_score REAL,
          user_id INTEGER,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      // Table des prédictions
      db.run(`
        CREATE TABLE IF NOT EXISTS predictions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          draw_date TEXT,
          numbers TEXT NOT NULL,
          stars TEXT NOT NULL,
          prediction_method TEXT NOT NULL,
          confidence_score REAL,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      resolve();
    });
  });
}

/**
 * Récupère le nombre de tirages dans la base de données
 */
function getDrawCount() {
  return new Promise((resolve, reject) => {
    db.get('SELECT COUNT(*) as count FROM draws', (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row.count);
      }
    });
  });
}

/**
 * Insère les tirages dans la base de données
 */
function insertDraws(draws) {
  return new Promise((resolve, reject) => {
    const stmt = db.prepare(`
      INSERT INTO draws (draw_date, numbers, stars, jackpot, jackpot_winners)
      VALUES (?, ?, ?, ?, ?)
    `);
    
    db.serialize(() => {
      db.run('BEGIN TRANSACTION');
      
      draws.forEach(draw => {
        const numbersStr = draw.numbers.join(',');
        const starsStr = draw.stars.join(',');
        
        stmt.run(
          draw.date,
          numbersStr,
          starsStr,
          draw.jackpot,
          draw.winners
        );
      });
      
      stmt.finalize();
      
      db.run('COMMIT', (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  });
}

/**
 * Génère des tirages de test au cas où le scraping échoue complètement
 * @returns {Array} Liste de tirages de test
 */
function generateTestDraws() {
  // Code existant pour générer des données de test
  // ...
}

// Exécution de l'initialisation
initDatabase();
