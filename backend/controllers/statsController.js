const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const dbPath = path.join(__dirname, '../db/euromillions.sqlite');

// Fonction utilitaire pour obtenir une connexion à la base de données
const getDb = () => new sqlite3.Database(dbPath);

/**
 * Récupère les statistiques de fréquence des numéros et étoiles
 */
const getFrequencyStats = (req, res) => {
  const db = getDb();
  
  db.all('SELECT * FROM draws', [], (err, rows) => {
    db.close();
    
    if (err) {
      console.error('Erreur lors de la récupération des tirages:', err.message);
      return res.status(500).json({ error: 'Erreur lors de la récupération des statistiques' });
    }
    
    // Initialiser les compteurs
    const numberFrequencies = {};
    const starFrequencies = {};
    
    for (let i = 1; i <= 50; i++) {
      numberFrequencies[i] = 0;
    }
    
    for (let i = 1; i <= 12; i++) {
      starFrequencies[i] = 0;
    }
    
    // Compter les occurrences
    rows.forEach(row => {
      const numbers = row.numbers.split(',').map(num => parseInt(num, 10));
      const stars = row.stars.split(',').map(star => parseInt(star, 10));
      
      numbers.forEach(num => {
        numberFrequencies[num]++;
      });
      
      stars.forEach(star => {
        starFrequencies[star]++;
      });
    });
    
    // Convertir en tableaux pour le tri
    const numberStats = Object.entries(numberFrequencies).map(([number, count]) => ({
      number: parseInt(number, 10),
      count,
      percentage: (count / rows.length * 100).toFixed(2)
    }));
    
    const starStats = Object.entries(starFrequencies).map(([star, count]) => ({
      star: parseInt(star, 10),
      count,
      percentage: (count / rows.length * 100).toFixed(2)
    }));
    
    // Trier par fréquence décroissante
    numberStats.sort((a, b) => b.count - a.count);
    starStats.sort((a, b) => b.count - a.count);
    
    res.json({
      totalDraws: rows.length,
      numbers: numberStats,
      stars: starStats
    });
  });
};

/**
 * Récupère les statistiques de jackpot
 */
const getJackpotStats = (req, res) => {
  const db = getDb();
  
  db.all('SELECT * FROM draws ORDER BY date(draw_date) ASC', [], (err, rows) => {
    db.close();
    
    if (err) {
      console.error('Erreur lors de la récupération des tirages:', err.message);
      return res.status(500).json({ error: 'Erreur lors de la récupération des statistiques de jackpot' });
    }
    
    // Calculer les statistiques
    const jackpotValues = rows.map(row => row.jackpot).filter(j => j !== null);
    const totalJackpots = jackpotValues.length;
    
    const wonJackpots = rows.filter(row => row.jackpot_winners > 0).length;
    const jackpotWonPercentage = (wonJackpots / totalJackpots * 100).toFixed(2);
    
    let maxJackpot = 0;
    let maxJackpotDate = null;
    
    rows.forEach(row => {
      if (row.jackpot > maxJackpot) {
        maxJackpot = row.jackpot;
        maxJackpotDate = row.draw_date;
      }
    });
    
    // Calculer la moyenne
    const jackpotSum = jackpotValues.reduce((sum, value) => sum + value, 0);
    const averageJackpot = jackpotSum / totalJackpots;
    
    // Calculer la médiane
    jackpotValues.sort((a, b) => a - b);
    const middleIndex = Math.floor(jackpotValues.length / 2);
    const medianJackpot = jackpotValues.length % 2 === 0
      ? (jackpotValues[middleIndex - 1] + jackpotValues[middleIndex]) / 2
      : jackpotValues[middleIndex];
    
    res.json({
      totalDraws: rows.length,
      totalJackpots,
      jackpotWon: wonJackpots,
      jackpotWonPercentage,
      maxJackpot,
      maxJackpotDate,
      averageJackpot,
      medianJackpot
    });
  });
};

/**
 * Récupère les statistiques de paires de numéros
 */
const getPairStats = (req, res) => {
  const db = getDb();
  
  db.all('SELECT * FROM draws', [], (err, rows) => {
    db.close();
    
    if (err) {
      console.error('Erreur lors de la récupération des tirages:', err.message);
      return res.status(500).json({ error: 'Erreur lors de la récupération des statistiques de paires' });
    }
    
    // Compter les paires de numéros
    const numberPairs = {};
    const starPairs = {};
    
    rows.forEach(row => {
      const numbers = row.numbers.split(',').map(num => parseInt(num, 10));
      const stars = row.stars.split(',').map(star => parseInt(star, 10));
      
      // Compter les paires de numéros
      for (let i = 0; i < numbers.length; i++) {
        for (let j = i + 1; j < numbers.length; j++) {
          const pair = `${numbers[i]}-${numbers[j]}`;
          numberPairs[pair] = (numberPairs[pair] || 0) + 1;
        }
      }
      
      // Compter les paires d'étoiles
      if (stars.length >= 2) {
        const pair = `${stars[0]}-${stars[1]}`;
        starPairs[pair] = (starPairs[pair] || 0) + 1;
      }
    });
    
    // Convertir en tableaux pour le tri
    const numberPairStats = Object.entries(numberPairs).map(([pair, count]) => {
      const [num1, num2] = pair.split('-').map(num => parseInt(num, 10));
      return {
        pair,
        numbers: [num1, num2],
        count,
        percentage: (count / rows.length * 100).toFixed(2)
      };
    });
    
    const starPairStats = Object.entries(starPairs).map(([pair, count]) => {
      const [star1, star2] = pair.split('-').map(star => parseInt(star, 10));
      return {
        pair,
        stars: [star1, star2],
        count,
        percentage: (count / rows.length * 100).toFixed(2)
      };
    });
    
    // Trier par fréquence décroissante
    numberPairStats.sort((a, b) => b.count - a.count);
    starPairStats.sort((a, b) => b.count - a.count);
    
    res.json({
      totalDraws: rows.length,
      numberPairs: numberPairStats.slice(0, 20), // Top 20 paires de numéros
      starPairs: starPairStats // Toutes les paires d'étoiles
    });
  });
};

module.exports = {
  getFrequencyStats,
  getJackpotStats,
  getPairStats
};

