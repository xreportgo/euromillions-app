// backend/scripts/force_real_data.js
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const cors = require('cors');

// Configuration
const PORT = 5000;
const dbPath = path.join(__dirname, '..', 'db', 'euromillions.sqlite');

// Créer une application express simplifiée
const app = express();
app.use(cors());
app.use(express.json());

// Vérifier si la base de données existe
if (!fs.existsSync(dbPath)) {
  console.error(`ERREUR: Le fichier de base de données n'existe pas à l'emplacement: ${dbPath}`);
  process.exit(1);
}

// Ouvrir la base de données
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Erreur de connexion à la base de données:', err.message);
    process.exit(1);
  }
  console.log('Connecté à la base de données SQLite');
});

// Fonction pour formater un tirage
const formatDraw = (draw) => {
  return {
    id: draw.id,
    date: draw.date,
    numbers: draw.numbers.split(',').map(n => parseInt(n.trim(), 10)),
    stars: draw.stars.split(',').map(s => parseInt(s.trim(), 10)),
    jackpot: draw.jackpot || '',
    winners: draw.winners || '0'
  };
};

// Route pour obtenir le dernier tirage
app.get('/api/draws/latest', (req, res) => {
  db.get('SELECT * FROM draws ORDER BY date DESC LIMIT 1', [], (err, row) => {
    if (err) {
      console.error('Erreur lors de la récupération du dernier tirage:', err);
      return res.status(500).json({ error: 'Erreur de base de données' });
    }
    
    if (!row) {
      return res.status(404).json({ error: 'Aucun tirage trouvé' });
    }
    
    res.json(formatDraw(row));
  });
});

// Route pour obtenir tous les tirages avec pagination
app.get('/api/draws', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;
  
  db.get('SELECT COUNT(*) as total FROM draws', [], (err, countRow) => {
    if (err) {
      console.error('Erreur lors du comptage des tirages:', err);
      return res.status(500).json({ error: 'Erreur de base de données' });
    }
    
    const total = countRow.total;
    
    db.all('SELECT * FROM draws ORDER BY date DESC LIMIT ? OFFSET ?', [limit, offset], (err, rows) => {
      if (err) {
        console.error('Erreur lors de la récupération des tirages:', err);
        return res.status(500).json({ error: 'Erreur de base de données' });
      }
      
      const totalPages = Math.ceil(total / limit);
      
      res.json({
        data: rows.map(formatDraw),
        pagination: {
          total,
          page,
          limit,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      });
    });
  });
});

// Route pour obtenir un tirage par date
app.get('/api/draws/date/:date', (req, res) => {
  const date = req.params.date;
  
  db.get('SELECT * FROM draws WHERE date = ?', [date], (err, row) => {
    if (err) {
      console.error('Erreur lors de la récupération du tirage par date:', err);
      return res.status(500).json({ error: 'Erreur de base de données' });
    }
    
    if (!row) {
      return res.status(404).json({ error: `Aucun tirage trouvé pour la date ${date}` });
    }
    
    res.json(formatDraw(row));
  });
});

// Route pour les prédictions (utilisant les données réelles)
app.get('/api/predictions', (req, res) => {
  const method = req.query.method || 'frequency';
  
  db.all('SELECT * FROM draws ORDER BY date DESC LIMIT 100', [], (err, rows) => {
    if (err) {
      console.error('Erreur lors de la récupération des tirages pour prédiction:', err);
      return res.status(500).json({ error: 'Erreur de base de données' });
    }
    
    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: 'Aucun tirage trouvé pour la prédiction' });
    }
    
    // Formater les tirages
    const draws = rows.map(row => ({
      id: row.id,
      date: row.date,
      numbers: row.numbers.split(',').map(n => parseInt(n.trim(), 10)),
      stars: row.stars.split(',').map(s => parseInt(s.trim(), 10))
    }));
    
    // Générer une prédiction simple basée sur la fréquence
    let prediction;
    if (method === 'frequency') {
      prediction = generateFrequencyPrediction(draws);
    } else {
      // Méthode par défaut
      prediction = generateRandomPrediction();
    }
    
    res.json({
      method,
      prediction: {
        date: getNextDrawDate(),
        numbers: prediction.numbers,
        stars: prediction.stars
      },
      confidenceScore: 0.6,
      explanation: "Prédiction basée sur l'analyse des tirages précédents.",
      disclaimer: "Les prédictions sont basées sur des analyses statistiques et ne garantissent pas de gains."
    });
  });
});

// Générer une prédiction basée sur la fréquence
function generateFrequencyPrediction(draws) {
  // Calculer la fréquence d'apparition de chaque numéro
  const numberFreq = {};
  const starFreq = {};
  
  for (let i = 1; i <= 50; i++) numberFreq[i] = 0;
  for (let i = 1; i <= 12; i++) starFreq[i] = 0;
  
  draws.forEach(draw => {
    draw.numbers.forEach(num => numberFreq[num]++);
    draw.stars.forEach(star => starFreq[star]++);
  });
  
  // Convertir en tableaux triés
  const numberEntries = Object.entries(numberFreq).map(([num, count]) => ({ 
    num: parseInt(num), count 
  })).sort((a, b) => b.count - a.count);
  
  const starEntries = Object.entries(starFreq).map(([star, count]) => ({ 
    star: parseInt(star), count 
  })).sort((a, b) => b.count - a.count);
  
  // Sélectionner les plus fréquents
  const numbers = numberEntries.slice(0, 5).map(e => e.num).sort((a, b) => a - b);
  const stars = starEntries.slice(0, 2).map(e => e.star).sort((a, b) => a - b);
  
  return { numbers, stars };
}

// Générer une prédiction aléatoire
function generateRandomPrediction() {
  const numbers = [];
  while (numbers.length < 5) {
    const num = Math.floor(Math.random() * 50) + 1;
    if (!numbers.includes(num)) numbers.push(num);
  }
  
  const stars = [];
  while (stars.length < 2) {
    const star = Math.floor(Math.random() * 12) + 1;
    if (!stars.includes(star)) stars.push(star);
  }
  
  numbers.sort((a, b) => a - b);
  stars.sort((a, b) => a - b);
  
  return { numbers, stars };
}

// Calculer la date du prochain tirage
function getNextDrawDate() {
  const today = new Date();
  let nextDrawDate = new Date(today);
  
  // Les tirages ont lieu les mardis et vendredis
  const currentDay = today.getDay(); // 0: dimanche, 1: lundi, etc.
  
  if (currentDay === 0) { // Dimanche -> Mardi
    nextDrawDate.setDate(today.getDate() + 2);
  } else if (currentDay === 1) { // Lundi -> Mardi
    nextDrawDate.setDate(today.getDate() + 1);
  } else if (currentDay === 2) { // Mardi
    const currentHour = today.getHours();
    if (currentHour >= 21) {
      nextDrawDate.setDate(today.getDate() + 3); // Vendredi
    }
  } else if (currentDay === 3) { // Mercredi -> Vendredi
    nextDrawDate.setDate(today.getDate() + 2);
  } else if (currentDay === 4) { // Jeudi -> Vendredi
    nextDrawDate.setDate(today.getDate() + 1);
  } else if (currentDay === 5) { // Vendredi
    const currentHour = today.getHours();
    if (currentHour >= 21) {
      nextDrawDate.setDate(today.getDate() + 4); // Mardi prochain
    }
  } else if (currentDay === 6) { // Samedi -> Mardi
    nextDrawDate.setDate(today.getDate() + 3);
  }
  
  return nextDrawDate.toISOString().split('T')[0];
}

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`Serveur de données réelles démarré sur le port ${PORT}`);
  console.log('Utilise la base de données:', dbPath);
  console.log('API disponible à http://localhost:5000/api');
});
