// backend/db.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Assurez-vous que le répertoire de la base de données existe
const dbDir = path.join(__dirname, 'db');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Chemin vers le fichier de base de données
const dbPath = path.join(dbDir, 'euromillions.sqlite');

// Créer une nouvelle instance de base de données
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Erreur lors de la connexion à la base de données:', err.message);
  } else {
    console.log('Connexion à la base de données SQLite établie avec succès.');
  }
});

// Activer les clés étrangères
db.run('PRAGMA foreign_keys = ON');

// Fonction pour exécuter une requête SQL avec des paramètres
const run = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) {
        console.error('Erreur dans run:', err.message);
        reject(err);
      } else {
        resolve({ id: this.lastID, changes: this.changes });
      }
    });
  });
};

// Fonction pour récupérer plusieurs lignes
const all = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        console.error('Erreur dans all:', err.message);
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};

// Fonction pour récupérer une seule ligne
const get = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        console.error('Erreur dans get:', err.message);
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
};

// Fonction pour exécuter plusieurs requêtes dans une transaction
const batch = (operations) => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run('BEGIN TRANSACTION');
      
      const promises = operations.map(op => {
        return run(op.sql, op.params);
      });
      
      Promise.all(promises)
        .then(results => {
          db.run('COMMIT', (err) => {
            if (err) {
              console.error('Erreur lors du commit:', err.message);
              db.run('ROLLBACK');
              reject(err);
            } else {
              resolve(results);
            }
          });
        })
        .catch(err => {
          console.error('Erreur dans la transaction:', err.message);
          db.run('ROLLBACK');
          reject(err);
        });
    });
  });
};

// Initialisation de la base de données (création des tables si elles n'existent pas)
const init = async () => {
  try {
    // Table des tirages
    await run(`
      CREATE TABLE IF NOT EXISTS draws (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        draw_number INTEGER,
        date TEXT NOT NULL,
        numbers TEXT NOT NULL,
        stars TEXT NOT NULL,
        jackpot TEXT,
        winners INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Index pour accélérer les recherches par date
    await run('CREATE INDEX IF NOT EXISTS idx_draws_date ON draws(date)');
    
    // Table des prédictions
    await run(`
      CREATE TABLE IF NOT EXISTS predictions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        numbers TEXT NOT NULL,
        stars TEXT NOT NULL,
        date TEXT NOT NULL,
        confidence INTEGER,
        method TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Table des statistiques
    await run(`
      CREATE TABLE IF NOT EXISTS stats (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL,
        data TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Table des grilles de l'utilisateur
    await run(`
      CREATE TABLE IF NOT EXISTS user_grids (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        numbers TEXT NOT NULL,
        stars TEXT NOT NULL,
        description TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    console.log('Base de données initialisée avec succès');
  } catch (err) {
    console.error('Erreur lors de l\'initialisation de la base de données:', err);
    throw err;
  }
};

// Fermer la connexion à la base de données
const close = () => {
  return new Promise((resolve, reject) => {
    db.close((err) => {
      if (err) {
        console.error('Erreur lors de la fermeture de la base de données:', err.message);
        reject(err);
      } else {
        console.log('Connexion à la base de données fermée avec succès.');
        resolve();
      }
    });
  });
};

module.exports = {
  db,
  run,
  all,
  get,
  batch,
  init,
  close
};
