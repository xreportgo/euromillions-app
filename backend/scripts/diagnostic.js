// backend/scripts/diagnostic.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Chemin à la base de données - ajustez selon votre configuration
const dbPath = path.join(__dirname, '..', 'db', 'euromillions.sqlite');

console.log(`\n===== DIAGNOSTIC DE LA BASE DE DONNÉES EUROMILLIONS =====`);
console.log(`Chemin utilisé: ${dbPath}`);

// Vérifier si le fichier existe
if (!fs.existsSync(dbPath)) {
  console.error(`ERREUR: Le fichier de base de données n'existe pas à l'emplacement: ${dbPath}`);
  console.log(`Répertoire parent contient: ${fs.readdirSync(path.dirname(dbPath)).join(', ')}`);
  process.exit(1);
}

// Ouvrir la base de données
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
  if (err) {
    console.error(`ERREUR: Impossible d'ouvrir la base de données:`, err.message);
    process.exit(1);
  }
  console.log(`Base de données ouverte avec succès.`);
  
  // Vérifier les tables
  db.all("SELECT name FROM sqlite_master WHERE type='table'", [], (err, tables) => {
    if (err) {
      console.error(`ERREUR: Impossible de lister les tables:`, err.message);
      return;
    }
    
    console.log(`\n----- TABLES TROUVÉES -----`);
    console.log(tables.map(t => t.name).join(', '));
    
    // Vérifier la structure de la table draws
    if (tables.some(t => t.name === 'draws')) {
      db.all("PRAGMA table_info(draws)", [], (err, columns) => {
        if (err) {
          console.error(`ERREUR: Impossible de récupérer la structure de la table:`, err.message);
          return;
        }
        
        console.log(`\n----- STRUCTURE DE LA TABLE 'draws' -----`);
        columns.forEach(col => {
          console.log(`${col.name} (${col.type})`);
        });
        
        // Compter les enregistrements
        db.get("SELECT COUNT(*) as count FROM draws", [], (err, result) => {
          if (err) {
            console.error(`ERREUR: Impossible de compter les enregistrements:`, err.message);
            return;
          }
          
          console.log(`\n----- STATISTIQUES -----`);
          console.log(`Nombre total de tirages: ${result.count}`);
          
          // Récupérer le premier et le dernier tirage
          db.get("SELECT * FROM draws ORDER BY date ASC LIMIT 1", [], (err, firstDraw) => {
            if (!err && firstDraw) {
              console.log(`\nPremier tirage:`, firstDraw);
            }
            
            db.get("SELECT * FROM draws ORDER BY date DESC LIMIT 1", [], (err, lastDraw) => {
              if (!err && lastDraw) {
                console.log(`\nDernier tirage:`, lastDraw);
              }
              
              console.log(`\n===== DIAGNOSTIC TERMINÉ =====\n`);
              db.close();
            });
          });
        });
      });
    } else {
      console.error(`ERREUR: La table 'draws' n'existe pas dans la base de données.`);
      db.close();
    }
  });
});
