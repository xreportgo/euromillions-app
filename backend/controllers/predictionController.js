const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const dbPath = path.join(__dirname, '../db/euromillions.sqlite');

// Fonction utilitaire pour obtenir une connexion à la base de données
const getDb = () => new sqlite3.Database(dbPath);

/**
 * Prédit les numéros du prochain tirage
 */
const predictNextDraw = (req, res) => {
  const { method = 'frequency' } = req.query;
  
  const db = getDb();
  
  db.all('SELECT * FROM draws ORDER BY date(draw_date) DESC', [], (err, rows) => {
    db.close();
    
    if (err) {
      console.error('Erreur lors de la récupération des tirages:', err.message);
      return res.status(500).json({ error: 'Erreur lors de la prédiction' });
    }
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Aucun tirage trouvé pour la prédiction' });
    }
    
    // Convertir les tirages en format adapté pour l'analyse
    const draws = rows.map(row => ({
      date: row.draw_date,
      numbers: row.numbers.split(',').map(num => parseInt(num, 10)),
      stars: row.stars.split(',').map(star => parseInt(star, 10)),
    }));
    
    let prediction;
    let confidenceScore;
    let explanation;
    
    switch (method) {
      case 'frequency':
        prediction = predictByFrequency(draws);
        confidenceScore = 0.65;
        explanation = "Prédiction basée sur les numéros et étoiles apparaissant le plus fréquemment dans l'historique des tirages.";
        break;
      
      case 'rarity':
        prediction = predictByRarity(draws);
        confidenceScore = 0.45;
        explanation = "Prédiction basée sur les numéros et étoiles apparaissant le plus rarement dans l'historique des tirages.";
        break;
      
      case 'pattern':
        prediction = predictByPattern(draws);
        confidenceScore = 0.55;
        explanation = "Prédiction basée sur l'analyse des patterns et tendances des tirages récents.";
        break;
      
      case 'random':
      default:
        prediction = predictRandom();
        confidenceScore = 0.35;
        explanation = "Prédiction basée sur une sélection aléatoire de numéros et d'étoiles.";
        break;
    }
    
    // Calcul de la date du prochain tirage
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
};

/**
 * Prédit les numéros basés sur la fréquence d'apparition
 */
function predictByFrequency(draws) {
  // Calculer la fréquence d'apparition de chaque numéro
  const numberFrequencies = {};
  const starFrequencies = {};
  
  for (let i = 1; i <= 50; i++) {
    numberFrequencies[i] = 0;
  }
  
  for (let i = 1; i <= 12; i++) {
    starFrequencies[i] = 0;
  }
  
  // Compter les occurrences
  draws.forEach(draw => {
    draw.numbers.forEach(num => {
      numberFrequencies[num]++;
    });
    
    draw.stars.forEach(star => {
      starFrequencies[star]++;
    });
  });
  
  // Convertir en tableaux pour le tri
  const sortedNumbers = Object.entries(numberFrequencies)
    .sort((a, b) => b[1] - a[1])
    .map(([num]) => parseInt(num, 10));
  
  const sortedStars = Object.entries(starFrequencies)
    .sort((a, b) => b[1] - a[1])
    .map(([star]) => parseInt(star, 10));
  
  // Sélectionner les 5 numéros et 2 étoiles les plus fréquents
  const numbers = sortedNumbers.slice(0, 5).sort((a, b) => a - b);
  const stars = sortedStars.slice(0, 2).sort((a, b) => a - b);
  
  return { numbers, stars };
}

/**
 * Prédit les numéros basés sur la rareté d'apparition
 */
function predictByRarity(draws) {
  // Calculer la fréquence d'apparition de chaque numéro
  const numberFrequencies = {};
  const starFrequencies = {};
  
  for (let i = 1; i <= 50; i++) {
    numberFrequencies[i] = 0;
  }
  
  for (let i = 1; i <= 12; i++) {
    starFrequencies[i] = 0;
  }
  
  // Compter les occurrences
  draws.forEach(draw => {
    draw.numbers.forEach(num => {
      numberFrequencies[num]++;
    });
    
    draw.stars.forEach(star => {
      starFrequencies[star]++;
    });
  });
  
  // Convertir en tableaux pour le tri
  const sortedNumbers = Object.entries(numberFrequencies)
    .sort((a, b) => a[1] - b[1])
    .map(([num]) => parseInt(num, 10));
  
  const sortedStars = Object.entries(starFrequencies)
    .sort((a, b) => a[1] - b[1])
    .map(([star]) => parseInt(star, 10));
  
  // Sélectionner les 5 numéros et 2 étoiles les plus rares
  const numbers = sortedNumbers.slice(0, 5).sort((a, b) => a - b);
  const stars = sortedStars.slice(0, 2).sort((a, b) => a - b);
  
  return { numbers, stars };
}

/**
 * Prédit les numéros basés sur des patterns
 */
function predictByPattern(draws) {
  // Utiliser seulement les 10 derniers tirages pour l'analyse des patterns
  const recentDraws = draws.slice(0, 10);
  
  // Analyser la distribution pairs/impairs
  let oddCount = 0;
  let evenCount = 0;
  
  recentDraws.forEach(draw => {
    draw.numbers.forEach(num => {
      if (num % 2 === 0) {
        evenCount++;
      } else {
        oddCount++;
      }
    });
  });
  
  // Tendance vers plus de numéros pairs ou impairs
  const moreEven = evenCount > oddCount;
  
  // Analyser les plages de numéros
  const ranges = [0, 0, 0, 0, 0]; // 1-10, 11-20, 21-30, 31-40, 41-50
  
  recentDraws.forEach(draw => {
    draw.numbers.forEach(num => {
      const rangeIndex = Math.floor((num - 1) / 10);
      ranges[rangeIndex]++;
    });
  });
  
  // Déterminer les plages les plus et moins fréquentes
  const maxRange = ranges.indexOf(Math.max(...ranges));
  const minRange = ranges.indexOf(Math.min(...ranges));
  
  // Sélectionner des numéros en fonction des tendances
  const numbers = [];
  const usedRanges = new Set();
  
  // Ajouter un numéro de la plage la moins fréquente (due for a hit)
  while (numbers.length < 1 && usedRanges.size < 5) {
    const baseNum = minRange * 10 + Math.floor(Math.random() * 10) + 1;
    if (!numbers.includes(baseNum) && baseNum >= 1 && baseNum <= 50) {
      numbers.push(baseNum);
      usedRanges.add(minRange);
    }
  }
  
  // Ajouter des numéros des autres plages
  for (let i = 0; i < 5; i++) {
    if (!usedRanges.has(i) && numbers.length < 5) {
      const baseNum = i * 10 + Math.floor(Math.random() * 10) + 1;
      if (!numbers.includes(baseNum)) {
        numbers.push(baseNum);
        usedRanges.add(i);
      }
    }
  }
  
  // Compléter jusqu'à 5 numéros
  while (numbers.length < 5) {
    const num = Math.floor(Math.random() * 50) + 1;
    if (!numbers.includes(num)) {
      // Suivre la tendance pair/impair
      if ((moreEven && num % 2 === 0) || (!moreEven && num % 2 !== 0)) {
        numbers.push(num);
      } else if (Math.random() < 0.3) { // 30% de chance d'ajouter un numéro qui va contre la tendance
        numbers.push(num);
      }
    }
  }
  
  // Sélectionner les étoiles en fonction des tirages récents
  const starFrequencies = {};
  
  for (let i = 1; i <= 12; i++) {
    starFrequencies[i] = 0;
  }
  
  recentDraws.forEach(draw => {
    draw.stars.forEach(star => {
      starFrequencies[star]++;
    });
  });
  
  // Convertir en tableau pour le tri
  const sortedStars = Object.entries(starFrequencies)
    .sort((a, b) => b[1] - a[1])
    .map(([star]) => parseInt(star, 10));
  
  // Prendre 1 étoile fréquente et 1 étoile rare
  const stars = [
    sortedStars[0], // La plus fréquente
    sortedStars[sortedStars.length - 1] // La plus rare
  ];
  
  // Trier les numéros et étoiles
  numbers.sort((a, b) => a - b);
  stars.sort((a, b) => a - b);
  
  return { numbers, stars };
}

/**
 * Prédit les numéros de manière aléatoire
 */
function predictRandom() {
  const numbers = [];
  const stars = [];
  
  // Générer 5 numéros aléatoires entre 1 et 50
  while (numbers.length < 5) {
    const num = Math.floor(Math.random() * 50) + 1;
    if (!numbers.includes(num)) {
      numbers.push(num);
    }
  }
  
  // Générer 2 étoiles aléatoires entre 1 et 12
  while (stars.length < 2) {
    const star = Math.floor(Math.random() * 12) + 1;
    if (!stars.includes(star)) {
      stars.push(star);
    }
  }
  
  // Trier les numéros et étoiles
  numbers.sort((a, b) => a - b);
  stars.sort((a, b) => a - b);
  
  return { numbers, stars };
}

/**
 * Calcule la date du prochain tirage
 */
function getNextDrawDate() {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 = dimanche, 1 = lundi, ..., 6 = samedi
  const hour = now.getHours();
  
  let daysToAdd;
  
  // Si c'est vendredi après 21h, le prochain tirage est mardi
  if (dayOfWeek === 5 && hour >= 21) {
    daysToAdd = 4; // Mardi prochain
  }
  // Si c'est mardi après 21h, le prochain tirage est vendredi
  else if (dayOfWeek === 2 && hour >= 21) {
    daysToAdd = 3; // Vendredi prochain
  }
  // Si c'est entre mercredi et vendredi avant 21h, le prochain tirage est vendredi
  else if ((dayOfWeek >= 3 && dayOfWeek < 5) || (dayOfWeek === 5 && hour < 21)) {
    daysToAdd = 5 - dayOfWeek; // Jours jusqu'à vendredi
  }
  // Sinon, le prochain tirage est mardi
  else {
    daysToAdd = (dayOfWeek <= 1) ? (2 - dayOfWeek) : (9 - dayOfWeek); // Jours jusqu'à mardi
  }
  
  const nextDraw = new Date(now);
  nextDraw.setDate(now.getDate() + daysToAdd);
  
  // Format YYYY-MM-DD
  return nextDraw.toISOString().split('T')[0];
}

module.exports = {
  predictNextDraw
};
