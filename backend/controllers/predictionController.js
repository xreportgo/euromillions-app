// backend/controllers/predictionController.js - Correction

const AppError = require('../utils/AppError');
const logger = require('../utils/logger');
const dbService = require('../services/dbService');
const { getNextDrawDate } = require('../utils/drawUtils');

/**
 * Génère une prédiction selon la méthode demandée
 */
exports.predictDraw = async (req, res, next) => {
  try {
    // Récupérer la méthode demandée ou utiliser "frequency" par défaut
    const method = (req.query.method || 'frequency').toLowerCase();
    
    // Vérifier si la méthode est valide
    const validMethods = ['frequency', 'rarity', 'pattern', 'random'];
    if (!validMethods.includes(method)) {
      return next(new AppError(`Méthode de prédiction "${method}" non reconnue. Options valides: frequency, rarity, pattern, random`, 400));
    }
    
    // Récupérer la base de données
    const db = await dbService.getDb();
    
    // Récupérer les tirages pour l'analyse
    const drawsData = await db.all("SELECT * FROM draws ORDER BY date(date) DESC LIMIT 100");
    
    if (!drawsData || drawsData.length === 0) {
      return next(new AppError('Aucun tirage trouvé pour la prédiction', 404));
    }
    
    // Formater les données pour l'analyse
    const draws = drawsData.map(draw => ({
      id: draw.id,
      date: draw.date,
      numbers: draw.numbers.split(',').map(num => parseInt(num.trim(), 10)),
      stars: draw.stars.split(',').map(star => parseInt(star.trim(), 10))
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
      case 'random':
        prediction = predictRandom();
        confidenceScore = 0.30;
        explanation = "Prédiction basée sur une sélection aléatoire de numéros et d'étoiles.";
        break;
    }
    
    // Préparer la date du prochain tirage
    const nextDrawDate = getNextDrawDate();
    
    // Renvoyer le résultat
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
    
  } catch (error) {
    logger.error('Erreur lors de la génération de la prédiction:', error);
    return next(new AppError('Erreur lors de la génération de la prédiction', 500));
  }
};

/**
 * Prédit les numéros basés sur la fréquence d'apparition
 */
function predictByFrequency(draws) {
  try {
    // Calculer la fréquence d'apparition de chaque numéro
    const numberFrequencies = {};
    const starFrequencies = {};
    
    // Initialiser les compteurs
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
    const numberEntries = Object.entries(numberFrequencies).map(([num, count]) => ({ 
      num: parseInt(num), 
      count 
    }));
    
    const starEntries = Object.entries(starFrequencies).map(([star, count]) => ({ 
      star: parseInt(star), 
      count 
    }));
    
    // Trier par fréquence décroissante
    numberEntries.sort((a, b) => b.count - a.count);
    starEntries.sort((a, b) => b.count - a.count);
    
    // Sélectionner les 5 numéros et 2 étoiles les plus fréquents
    const numbers = numberEntries.slice(0, 5).map(entry => entry.num);
    const stars = starEntries.slice(0, 2).map(entry => entry.star);
    
    // Trier les numéros et étoiles par ordre croissant
    numbers.sort((a, b) => a - b);
    stars.sort((a, b) => a - b);
    
    return { numbers, stars };
  } catch (error) {
    logger.error('Erreur dans predictByFrequency:', error);
    // En cas d'erreur, générer une prédiction aléatoire
    return predictRandom();
  }
}

/**
 * Prédit les numéros basés sur la rareté d'apparition
 */
function predictByRarity(draws) {
  try {
    // Calculer la fréquence d'apparition de chaque numéro
    const numberFrequencies = {};
    const starFrequencies = {};
    
    // Initialiser les compteurs
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
    const numberEntries = Object.entries(numberFrequencies).map(([num, count]) => ({ 
      num: parseInt(num), 
      count 
    }));
    
    const starEntries = Object.entries(starFrequencies).map(([star, count]) => ({ 
      star: parseInt(star), 
      count 
    }));
    
    // Trier par fréquence croissante (rareté)
    numberEntries.sort((a, b) => a.count - b.count);
    starEntries.sort((a, b) => a.count - b.count);
    
    // Sélectionner les 5 numéros et 2 étoiles les plus rares
    const numbers = numberEntries.slice(0, 5).map(entry => entry.num);
    const stars = starEntries.slice(0, 2).map(entry => entry.star);
    
    // Trier les numéros et étoiles par ordre croissant
    numbers.sort((a, b) => a - b);
    stars.sort((a, b) => a - b);
    
    return { numbers, stars };
  } catch (error) {
    logger.error('Erreur dans predictByRarity:', error);
    // En cas d'erreur, générer une prédiction aléatoire
    return predictRandom();
  }
}

/**
 * Prédit les numéros basés sur l'analyse des patterns récents
 */
function predictByPattern(draws) {
  try {
    // Utiliser les 20 derniers tirages pour l'analyse
    const recentDraws = draws.slice(0, Math.min(20, draws.length));
    
    // Calculer les moyennes et tendances
    const allNumbers = recentDraws.flatMap(draw => draw.numbers);
    const allStars = recentDraws.flatMap(draw => draw.stars);
    
    // Calculer les fréquences locales
    const numberFreq = {};
    const starFreq = {};
    
    for (let i = 1; i <= 50; i++) numberFreq[i] = 0;
    for (let i = 1; i <= 12; i++) starFreq[i] = 0;
    
    allNumbers.forEach(num => numberFreq[num]++);
    allStars.forEach(star => starFreq[star]++);
    
    // Identifier les tendances
    const recentPatterns = [];
    for (let i = 0; i < recentDraws.length - 1; i++) {
      const currDraw = recentDraws[i];
      const prevDraw = recentDraws[i + 1];
      
      // Analyser les différences entre tirages consécutifs
      const numDiff = currDraw.numbers.filter(n => !prevDraw.numbers.includes(n));
      const starDiff = currDraw.stars.filter(s => !prevDraw.stars.includes(s));
      
      recentPatterns.push({
        numDiff: numDiff.length,
        starDiff: starDiff.length
      });
    }
    
    // Calculer les moyennes des différences
    const avgNumDiff = recentPatterns.reduce((sum, p) => sum + p.numDiff, 0) / recentPatterns.length;
    const avgStarDiff = recentPatterns.reduce((sum, p) => sum + p.starDiff, 0) / recentPatterns.length;
    
    // Sélectionner des numéros basés sur ce pattern
    const lastDraw = recentDraws[0];
    const keepNumCount = Math.round(5 - avgNumDiff);
    const keepStarCount = Math.round(2 - avgStarDiff);
    
    // Conserver certains numéros du dernier tirage selon la tendance
    const keptNumbers = lastDraw.numbers.slice(0, Math.max(0, keepNumCount));
    const keptStars = lastDraw.stars.slice(0, Math.max(0, keepStarCount));
    
    // Compléter avec les numéros les plus fréquents non inclus dans le dernier tirage
    const numberEntries = Object.entries(numberFreq)
      .map(([num, count]) => ({ num: parseInt(num), count }))
      .filter(entry => !lastDraw.numbers.includes(entry.num))
      .sort((a, b) => b.count - a.count);
    
    const starEntries = Object.entries(starFreq)
      .map(([star, count]) => ({ star: parseInt(star), count }))
      .filter(entry => !lastDraw.stars.includes(entry.star))
      .sort((a, b) => b.count - a.count);
    
    // Compléter les numéros manquants
    const newNumbers = numberEntries.slice(0, 5 - keptNumbers.length).map(entry => entry.num);
    const newStars = starEntries.slice(0, 2 - keptStars.length).map(entry => entry.star);
    
    // Combiner et trier
    const numbers = [...keptNumbers, ...newNumbers].sort((a, b) => a - b);
    const stars = [...keptStars, ...newStars].sort((a, b) => a - b);
    
    return { numbers, stars };
  } catch (error) {
    logger.error('Erreur dans predictByPattern:', error);
    // En cas d'erreur, générer une prédiction aléatoire
    return predictRandom();
  }
}

/**
 * Génère une prédiction aléatoire
 */
function predictRandom() {
  try {
    // Générer 5 numéros aléatoires entre 1 et 50
    const numbers = [];
    while (numbers.length < 5) {
      const num = Math.floor(Math.random() * 50) + 1;
      if (!numbers.includes(num)) {
        numbers.push(num);
      }
    }
    
    // Générer 2 étoiles aléatoires entre 1 et 12
    const stars = [];
    while (stars.length < 2) {
      const star = Math.floor(Math.random() * 12) + 1;
      if (!stars.includes(star)) {
        stars.push(star);
      }
    }
    
    // Trier les numéros et étoiles par ordre croissant
    numbers.sort((a, b) => a - b);
    stars.sort((a, b) => a - b);
    
    return { numbers, stars };
  } catch (error) {
    logger.error('Erreur dans predictRandom:', error);
    // En cas d'erreur extrême, retourner un ensemble fixe
    return { 
      numbers: [7, 14, 21, 35, 42], 
      stars: [3, 9] 
    };
  }
}
