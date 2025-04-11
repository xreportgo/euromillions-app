/**
 * Modèle pour gérer les grilles utilisateur
 */
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const logger = require('../utils/logger'); // Adapter selon votre structure

// Chemin vers votre fichier de base de données SQLite
const dbPath = path.join(__dirname, '../db/euromillions.db'); // Adapter selon votre structure

/**
 * Ouvre une connexion à la base de données SQLite
 * @returns {Promise<Object>} - L'objet de connexion à la base de données
 */
function openDatabase() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE, (err) => {
      if (err) {
        console.error(`Erreur d'ouverture de la base de données: ${err.message}`);
        console.error(`Chemin de la base: ${dbPath}`);
        reject(err);
      } else {
        resolve(db);
      }
    });
  });
}

/**
 * Convertit une méthode SQLite basée sur les callbacks en Promise
 * @param {Object} db - Connexion à la base de données
 * @param {string} method - Nom de la méthode ('run', 'get', 'all')
 * @returns {Function} - Fonction promisifiée
 */
function promisify(db, method) {
  return function(...args) {
    return new Promise((resolve, reject) => {
      db[method](...args, function(err, result) {
        if (err) reject(err);
        else resolve(method === 'run' ? this : result);
      });
    });
  };
}

/**
 * Initialise la table des grilles si elle n'existe pas
 */
async function initGrillesTable() {
  let db;
  try {
    db = await openDatabase();
    const run = promisify(db, 'run');
    
    // Créer la table des grilles si elle n'existe pas
    await run(`
      CREATE TABLE IF NOT EXISTS grilles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        numbers TEXT NOT NULL,
        stars TEXT NOT NULL,
        date TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    logger.info('Table des grilles initialisée avec succès');
  } catch (error) {
    logger.error(`Erreur lors de l'initialisation de la table des grilles: ${error.message}`);
    throw error;
  } finally {
    if (db) db.close();
  }
}

/**
 * Récupère toutes les grilles de l'utilisateur
 * @returns {Promise<Array>} - Liste des grilles
 */
async function getAllGrilles() {
  let db;
  try {
    db = await openDatabase();
    const all = promisify(db, 'all');
    
    const grilles = await all(`SELECT * FROM grilles ORDER BY date DESC`);
    
    // Convertir les champs numbers et stars de JSON texte en tableaux
    return grilles.map(grille => ({
      ...grille,
      numbers: JSON.parse(grille.numbers),
      stars: JSON.parse(grille.stars)
    }));
  } catch (error) {
    logger.error(`Erreur lors de la récupération des grilles: ${error.message}`);
    throw error;
  } finally {
    if (db) db.close();
  }
}

/**
 * Ajoute une nouvelle grille
 * @param {Object} grille - Données de la grille à ajouter
 * @returns {Promise<Object>} - La grille ajoutée avec son ID
 */
async function addGrille(grille) {
  let db;
  try {
    db = await openDatabase();
    const run = promisify(db, 'run');
    const get = promisify(db, 'get');
    
    // Vérifier que les données sont valides
    if (!grille.numbers || !Array.isArray(grille.numbers) || grille.numbers.length !== 5) {
      throw new Error('La grille doit contenir exactement 5 numéros');
    }
    
    if (!grille.stars || !Array.isArray(grille.stars) || grille.stars.length !== 2) {
      throw new Error('La grille doit contenir exactement 2 étoiles');
    }
    
    if (!grille.date) {
      throw new Error('La date de tirage est requise');
    }
    
    // Convertir les tableaux en chaînes JSON pour le stockage
    const numbersJson = JSON.stringify(grille.numbers);
    const starsJson = JSON.stringify(grille.stars);
    
    // Insérer la grille
    const result = await run(
      `INSERT INTO grilles (name, numbers, stars, date) VALUES (?, ?, ?, ?)`,
      [grille.name || null, numbersJson, starsJson, grille.date]
    );
    
    // Récupérer la grille insérée avec son ID
    const insertedGrille = await get(
      `SELECT * FROM grilles WHERE id = ?`,
      [result.lastID]
    );
    
    // Convertir les chaînes JSON en tableaux pour le retour
    return {
      ...insertedGrille,
      numbers: JSON.parse(insertedGrille.numbers),
      stars: JSON.parse(insertedGrille.stars)
    };
  } catch (error) {
    logger.error(`Erreur lors de l'ajout d'une grille: ${error.message}`);
    throw error;
  } finally {
    if (db) db.close();
  }
}

/**
 * Supprime une grille par son ID
 * @param {number} id - ID de la grille à supprimer
 * @returns {Promise<boolean>} - true si supprimé avec succès, false sinon
 */
 
async function ensureDatabaseExists() {
  // Vérifier si le fichier existe
  const exists = fs.existsSync(dbPath);
  
  if (!exists) {
    console.log(`Le fichier de base de données n'existe pas, création: ${dbPath}`);
    // Créer un fichier vide
    try {
      fs.writeFileSync(dbPath, '', { flag: 'wx' });
      console.log('Fichier de base de données créé avec succès');
    } catch (err) {
      console.error(`Erreur lors de la création du fichier: ${err.message}`);
      throw err;
    }
  }
} 
 
async function deleteGrille(id) {
  let db;
  try {
    db = await openDatabase();
    const run = promisify(db, 'run');
    
    const result = await run(
      `DELETE FROM grilles WHERE id = ?`,
      [id]
    );
    
    return result.changes > 0;
  } catch (error) {
    logger.error(`Erreur lors de la suppression de la grille ${id}: ${error.message}`);
    throw error;
  } finally {
    if (db) db.close();
  }
}

// (avant initGrillesTable().catch...)
ensureDatabaseExists()
  .then(() => initGrillesTable())
  .catch(err => {
    logger.error(`Erreur d'initialisation: ${err.message}`);
  });

// Initialiser la table au démarrage
initGrillesTable().catch(err => {
  logger.error(`Erreur d'initialisation: ${err.message}`);
});

module.exports = {
  getAllGrilles,
  addGrille,
  deleteGrille
};
