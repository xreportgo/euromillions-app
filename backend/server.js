// backend/server-clean.js
const express = require('express');
const path = require('path');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

// Créer l'application Express
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware de base
app.use(cors());
app.use(express.json());

// Chemin vers la base de données
const dbPath = path.join(__dirname, 'db', 'euromillions.sqlite');

// Vérifier si la base de données existe
if (!fs.existsSync(dbPath)) {
  console.error(`ERREUR: Base de données non trouvée à ${dbPath}`);
  console.error('Veuillez vérifier que le fichier de base de données existe.');
  process.exit(1);
}

// Connexion à la base de données
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
  if (err) {
    console.error(`Erreur lors de l'ouverture de la base de données: ${err.message}`);
    process.exit(1);
  }
  console.log(`Connecté à la base de données SQLite: ${dbPath}`);
  
  // Vérifier le contenu de la base de données
  db.get("SELECT COUNT(*) as count FROM draws", [], (err, row) => {
    if (err) {
      console.error(`Erreur lors de la requête: ${err.message}`);
    } else {
      console.log(`La base de données contient ${row.count} tirages.`);
    }
  });
});

// Middleware de validation pour s'assurer que seules des données réelles sont renvoyées
const validateRealData = (req, res, next) => {
  const originalJson = res.json;
  
  res.json = function(data) {
    // Vérifier si les données incluent une date
    if (data && data.date) {
      const drawDate = new Date(data.date);
      const today = new Date();
      
      if (drawDate > today) {
        console.error('🚨 Données fictives détectées dans la réponse!', JSON.stringify(data).substring(0, 100));
        return res.status(500).send('Erreur serveur: données invalides détectées');
      }
    }
    
    // Vérifier si c'est une liste de tirages
    if (data && data.data && Array.isArray(data.data)) {
      for (const item of data.data) {
        if (item.date) {
          const drawDate = new Date(item.date);
          const today = new Date();
          
          if (drawDate > today) {
            console.error('🚨 Données fictives détectées dans la liste!', JSON.stringify(item).substring(0, 100));
            return res.status(500).send('Erreur serveur: données invalides détectées');
          }
        }
      }
    }
    
    return originalJson.call(this, data);
  };
  
  next();
};

app.use(validateRealData);

// API DES TIRAGES - ACCÈS DIRECT À LA BASE DE DONNÉES
// ===================================================

// Obtenir le dernier tirage
app.get('/api/draws/latest', (req, res) => {
  console.log('Récupération du dernier tirage depuis la base de données...');
  
  db.get("SELECT * FROM draws ORDER BY date(date) DESC LIMIT 1", [], (err, row) => {
    if (err) {
      console.error(`Erreur lors de la récupération du dernier tirage: ${err.message}`);
      return res.status(500).json({ error: 'Erreur serveur' });
    }
    
    if (!row) {
      return res.status(404).json({ error: 'Aucun tirage trouvé' });
    }
    
    // Log pour vérification
    console.log('Dernier tirage récupéré:', row);
    
    // Transformer les données pour la réponse
    const result = {
      id: row.id,
      date: row.date,
      numbers: row.numbers.split(',').map(num => parseInt(num.trim(), 10)),
      stars: row.stars.split(',').map(star => parseInt(star.trim(), 10)),
      jackpot: row.jackpot || '',
      winners: row.winners || '0'
    };
    
    // Log pour vérification
    console.log('Réponse formatée:', result);
    
    res.json(result);
  });
});

// Obtenir tous les tirages avec pagination
app.get('/api/draws', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;
  
  console.log(`Récupération des tirages (page ${page}, limite ${limit})...`);
  
  // D'abord, compter le nombre total de tirages
  db.get("SELECT COUNT(*) as total FROM draws", [], (err, countRow) => {
    if (err) {
      console.error(`Erreur lors du comptage des tirages: ${err.message}`);
      return res.status(500).json({ error: 'Erreur serveur' });
    }
    
    const total = countRow.total;
    
    // Ensuite, récupérer les tirages pour la page demandée
    db.all("SELECT * FROM draws ORDER BY date(date) DESC LIMIT ? OFFSET ?", [limit, offset], (err, rows) => {
      if (err) {
        console.error(`Erreur lors de la récupération des tirages: ${err.message}`);
        return res.status(500).json({ error: 'Erreur serveur' });
      }
      
      // Transformer les données pour la réponse
      const formattedDraws = rows.map(row => ({
        id: row.id,
        date: row.date,
        numbers: row.numbers.split(',').map(num => parseInt(num.trim(), 10)),
        stars: row.stars.split(',').map(star => parseInt(star.trim(), 10)),
        jackpot: row.jackpot || '',
        winners: row.winners || '0'
      }));
      
      res.json({
        data: formattedDraws,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      });
    });
  });
});

// Obtenir un tirage par ID
app.get('/api/draws/:id', (req, res) => {
  const id = parseInt(req.params.id);
  
  if (isNaN(id)) {
    return res.status(400).json({ error: 'ID invalide' });
  }
  
  db.get("SELECT * FROM draws WHERE id = ?", [id], (err, row) => {
    if (err) {
      console.error(`Erreur lors de la récupération du tirage ${id}: ${err.message}`);
      return res.status(500).json({ error: 'Erreur serveur' });
    }
    
    if (!row) {
      return res.status(404).json({ error: 'Tirage non trouvé' });
    }
    
    res.json({
      id: row.id,
      date: row.date,
      numbers: row.numbers.split(',').map(num => parseInt(num.trim(), 10)),
      stars: row.stars.split(',').map(star => parseInt(star.trim(), 10)),
      jackpot: row.jackpot || '',
      winners: row.winners || '0'
    });
  });
});

// API DES PRÉDICTIONS
// ==================

// Générer une prédiction
app.get('/api/predictions', (req, res) => {
  const method = req.query.method || 'frequency';
  
  // Récupérer les tirages pour l'analyse
  db.all("SELECT * FROM draws ORDER BY date(date) DESC LIMIT 100", [], (err, rows) => {
    if (err) {
      console.error(`Erreur lors de la récupération des tirages pour prédiction: ${err.message}`);
      return res.status(500).json({ error: 'Erreur serveur' });
    }
    
    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: 'Aucun tirage trouvé pour la prédiction' });
    }
    
    // Formater les tirages pour l'analyse
    const draws = rows.map(row => ({
      numbers: row.numbers.split(',').map(num => parseInt(num.trim(), 10)),
      stars: row.stars.split(',').map(star => parseInt(star.trim(), 10))
    }));
    
    // Générer la prédiction selon la méthode
    let prediction;
    let confidenceScore;
    let explanation;
    
    switch (method) {
      case 'frequency':
        prediction = predictByFrequency(draws);
        confidenceScore = 0.60;
        explanation = "Prédiction basée sur les numéros et étoiles apparaissant le plus fréquemment dans l'historique des tirages.";
        break;
      case 'rarity':
        prediction = predictByRarity(draws);
        confidenceScore = 0.40;
        explanation = "Prédiction basée sur les numéros et étoiles apparaissant le plus rarement dans l'historique des tirages.";
        break;
      case 'pattern':
        prediction = predictByPattern(draws);
        confidenceScore = 0.50;
        explanation = "Prédiction basée sur l'analyse des patterns et tendances des tirages récents.";
        break;
      default:
        prediction = predictRandom();
        confidenceScore = 0.30;
        explanation = "Prédiction basée sur une sélection aléatoire de numéros et d'étoiles.";
        break;
    }
    
    // Calculer la date du prochain tirage
    const nextDrawDate = getNextDrawDate();
    
    res.json({
      method,
      prediction: {
        date: nextDrawDate,
        numbers: prediction.numbers,
        stars: prediction.stars
      },
      confidenceScore,
      explanation,
      disclaimer: "Les prédictions sont basées sur des analyses statistiques et ne garantissent pas de gains."
    });
  });
});

// FONCTIONS UTILITAIRES POUR LES PRÉDICTIONS
// =========================================

// Prédiction basée sur la fréquence
function predictByFrequency(draws) {
  const numberFreq = {};
  const starFreq = {};
  
  for (let i = 1; i <= 50; i++) numberFreq[i] = 0;
  for (let i = 1; i <= 12; i++) starFreq[i] = 0;
  
  draws.forEach(draw => {
    draw.numbers.forEach(num => numberFreq[num]++);
    draw.stars.forEach(star => starFreq[star]++);
  });
  
  const numberEntries = Object.entries(numberFreq)
    .map(([num, count]) => ({ num: parseInt(num), count }))
    .sort((a, b) => b.count - a.count);
  
  const starEntries = Object.entries(starFreq)
    .map(([star, count]) => ({ star: parseInt(star), count }))
    .sort((a, b) => b.count - a.count);
  
  const numbers = numberEntries.slice(0, 5).map(e => e.num).sort((a, b) => a - b);
  const stars = starEntries.slice(0, 2).map(e => e.star).sort((a, b) => a - b);
  
  return { numbers, stars };
}

// Prédiction basée sur la rareté
function predictByRarity(draws) {
  const numberFreq = {};
  const starFreq = {};
  
  for (let i = 1; i <= 50; i++) numberFreq[i] = 0;
  for (let i = 1; i <= 12; i++) starFreq[i] = 0;
  
  draws.forEach(draw => {
    draw.numbers.forEach(num => numberFreq[num]++);
    draw.stars.forEach(star => starFreq[star]++);
  });
  
  const numberEntries = Object.entries(numberFreq)
    .map(([num, count]) => ({ num: parseInt(num), count }))
    .sort((a, b) => a.count - b.count);
  
  const starEntries = Object.entries(starFreq)
    .map(([star, count]) => ({ star: parseInt(star), count }))
    .sort((a, b) => a.count - b.count);
  
  const numbers = numberEntries.slice(0, 5).map(e => e.num).sort((a, b) => a - b);
  const stars = starEntries.slice(0, 2).map(e => e.star).sort((a, b) => a - b);
  
  return { numbers, stars };
}

// Prédiction basée sur les patterns
function predictByPattern(draws) {
  // Version simplifiée
  const recentDraws = draws.slice(0, 5);
  const numbers = new Set();
  const stars = new Set();
  
  // Utiliser des numéros qui apparaissent dans les tirages récents
  recentDraws.forEach(draw => {
    draw.numbers.forEach(num => {
      if (Math.random() > 0.7) numbers.add(num);
    });
    draw.stars.forEach(star => {
      if (Math.random() > 0.5) stars.add(star);
    });
  });
  
  // Compléter si nécessaire
  while (numbers.size < 5) {
    const num = Math.floor(Math.random() * 50) + 1;
    numbers.add(num);
  }
  
  while (stars.size < 2) {
    const star = Math.floor(Math.random() * 12) + 1;
    stars.add(star);
  }
  
  return { 
    numbers: Array.from(numbers).slice(0, 5).sort((a, b) => a - b),
    stars: Array.from(stars).slice(0, 2).sort((a, b) => a - b)
  };
}

// Prédiction aléatoire
function predictRandom() {
  const numbers = new Set();
  const stars = new Set();
  
  while (numbers.size < 5) {
    const num = Math.floor(Math.random() * 50) + 1;
    numbers.add(num);
  } 
}