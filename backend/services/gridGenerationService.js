// backend/services/gridGenerationService.js
/**
 * Service de génération de grilles Euromillions
 * Permet de générer des grilles selon différents modèles
 */

// Constantes
const NUM_NUMBERS = 5;
const NUM_STARS = 2;
const MAX_NUMBER = 50;
const MAX_STAR = 12;

/**
 * Génère un nombre aléatoire entre min et max inclus
 * @param {number} min 
 * @param {number} max 
 * @returns {number}
 */
const getRandomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * Génère un tableau de n nombres uniques entre min et max
 * @param {number} count - Nombre d'éléments à générer
 * @param {number} max - Valeur maximale
 * @param {Array<number>} excluded - Nombres à exclure
 * @returns {Array<number>}
 */
const generateUniqueNumbers = (count, max, excluded = []) => {
  const numbers = [];
  const excludedSet = new Set(excluded);
  
  while (numbers.length < count) {
    const num = getRandomInt(1, max);
    if (!numbers.includes(num) && !excludedSet.has(num)) {
      numbers.push(num);
    }
  }
  
  return numbers.sort((a, b) => a - b);
};

/**
 * Génère une grille complète avec numéros et étoiles
 * @param {Object} options - Options de génération
 * @param {string} options.model - Modèle de génération ('random', 'frequency', 'hot_numbers')
 * @param {Array<number>} options.excludedNumbers - Numéros à exclure
 * @param {Array<number>} options.excludedStars - Étoiles à exclure
 * @returns {Object} Grille générée
 */
const generateGrid = (options = {}) => {
  const {
    model = 'random',
    excludedNumbers = [],
    excludedStars = []
  } = options;
  
  let numbers = [];
  let stars = [];
  let confidence = 0;
  
  switch (model) {
    case 'frequency':
      // Dans un vrai système, ces numéros seraient basés sur l'analyse de fréquence
      // Pour l'instant, c'est juste une simulation
      numbers = generateUniqueNumbers(NUM_NUMBERS, MAX_NUMBER, excludedNumbers);
      stars = generateUniqueNumbers(NUM_STARS, MAX_STAR, excludedStars);
      confidence = 0.75; // Confiance plus élevée pour ce modèle
      break;
      
    case 'hot_numbers':
      // Dans un vrai système, ces numéros seraient basés sur les tirages récents
      // Pour l'instant, c'est juste une simulation
      numbers = generateUniqueNumbers(NUM_NUMBERS, MAX_NUMBER, excludedNumbers);
      stars = generateUniqueNumbers(NUM_STARS, MAX_STAR, excludedStars);
      confidence = 0.65; // Confiance moyenne pour ce modèle
      break;
      
    case 'random':
    default:
      // Génération complètement aléatoire
      numbers = generateUniqueNumbers(NUM_NUMBERS, MAX_NUMBER, excludedNumbers);
      stars = generateUniqueNumbers(NUM_STARS, MAX_STAR, excludedStars);
      confidence = 0.5; // Confiance basse pour ce modèle aléatoire
      break;
  }
  
  return {
    numbers,
    stars,
    method: model,
    confidence
  };
};

/**
 * Génère plusieurs grilles selon les options spécifiées
 * @param {Object} options - Options de génération
 * @param {string} options.model - Modèle de génération
 * @param {number} options.count - Nombre de grilles à générer
 * @param {Array<number>} options.excludedNumbers - Numéros à exclure
 * @param {Array<number>} options.excludedStars - Étoiles à exclure
 * @returns {Array<Object>} Grilles générées
 */
const generateGrids = (options = {}) => {
  const {
    model = 'random',
    count = 1,
    excludedNumbers = [],
    excludedStars = []
  } = options;
  
  // Limiter le nombre de grilles généré
  const safeCount = Math.min(Math.max(1, count), 10);
  
  const grids = [];
  
  for (let i = 0; i < safeCount; i++) {
    const grid = generateGrid({
      model,
      excludedNumbers,
      excludedStars
    });
    
    // Ajouter un identifiant unique pour chaque grille
    grids.push({
      ...grid,
      id: `grid_${Date.now()}_${i}`
    });
  }
  
  return grids;
};

module.exports = {
  generateGrid,
  generateGrids
};
