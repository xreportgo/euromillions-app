const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Chemin vers la base de données
const dbPath = path.join(__dirname, '../db/euromillions.sqlite');

/**
 * Réinitialise la base de données en supprimant toutes les données
 */
async function resetDatabase() {
  console.log('[resetDb] Réinitialisation de la base de données...');
  
  // Vérifier si la base de données existe
  if (!fs.existsSync(dbPath)) {
    console.log('[resetDb] Base de données inexistante. Rien à faire.');
    return {
      success: true,
      message: 'Base de données inexistante'
    };
  }
  
  // Ouvrir la connexion
  const db = new sqlite3.Database(dbPath);
  
  try {
    return new Promise((resolve, reject) => {
      db.serialize(() => {
        // Supprimer toutes les tables
        db.run('DROP TABLE IF EXISTS draws', (err) => {
          if (err) {
            reject({
              success: false,
              message: `Erreur lors de la suppression de la table draws: ${err.message}`
            });
          }
        });
        
        db.run('DROP TABLE IF EXISTS grids', (err) => {
          if (err) {
            reject({
              success: false,
              message: `Erreur lors de la suppression de la table grids: ${err.message}`
            });
          }
        });
        
        db.run('DROP TABLE IF EXISTS predictions', (err) => {
          if (err) {
            reject({
              success: false,
              message: `Erreur lors de la suppression de la table predictions: ${err.message}`
            });
          }
        });
        
        console.log('[resetDb] Toutes les tables ont été supprimées');
        
        // Fermer la connexion
        db.close((err) => {
          if (err) {
            reject({
              success: false,
              message: `Erreur lors de la fermeture de la connexion: ${err.message}`
            });
          }
          
          console.log('[resetDb] Réinitialisation terminée avec succès');
          resolve({
            success: true,
            message: 'Base de données réinitialisée avec succès'
          });
        });
      });
    });
  } catch (error) {
    console.error(`[resetDb] Erreur: ${error.message}`);
    
    // Fermer la connexion en cas d'erreur
    db.close();
    
    return {
      success: false,
      message: `Erreur lors de la réinitialisation: ${error.message}`
    };
  }
}

// Si le script est exécuté directement
if (require.main === module) {
  resetDatabase()
    .then(result => {
      console.log(`[resetDb] Résultat: ${result.message}`);
      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      console.error(`[resetDb] Erreur non gérée: ${error.message}`);
      process.exit(1);
    });
}

module.exports = { resetDatabase };
