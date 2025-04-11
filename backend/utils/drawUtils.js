// backend/utils/drawUtils.js - Correction

const logger = require('./logger');

/**
 * Formate un objet tirage depuis la base de données vers un format API
 */
exports.formatDraw = (dbDraw) => {
  if (!dbDraw) return null;
  
  try {
    return {
      id: dbDraw.id,
      date: dbDraw.date,
      numbers: dbDraw.numbers.split(',').map(num => parseInt(num.trim(), 10)),
      stars: dbDraw.stars.split(',').map(star => parseInt(star.trim(), 10)),
      jackpot: dbDraw.jackpot || '',
      winners: dbDraw.winners || '0'
    };
  } catch (error) {
    logger.error(`Erreur lors du formatage du tirage ID ${dbDraw.id}:`, error);
    return {
      id: dbDraw.id,
      date: dbDraw.date,
      numbers: [],
      stars: [],
      jackpot: dbDraw.jackpot || '',
      winners: dbDraw.winners || '0'
    };
  }
};

/**
 * Formate un tableau de tirages depuis la base de données vers un format API
 */
exports.formatDraws = (dbDraws) => {
  if (!dbDraws || !Array.isArray(dbDraws)) return [];
  
  return dbDraws.map(draw => this.formatDraw(draw));
};

/**
 * Calcule la date du prochain tirage
 */
exports.getNextDrawDate = () => {
  const today = new Date();
  let nextDrawDate = new Date(today);
  
  // Les tirages ont lieu les mardis et vendredis
  const currentDay = today.getDay(); // 0: dimanche, 1: lundi, etc.
  
  if (currentDay === 0) { // Dimanche -> Mardi
    nextDrawDate.setDate(today.getDate() + 2);
  } else if (currentDay === 1) { // Lundi -> Mardi
    nextDrawDate.setDate(today.getDate() + 1);
  } else if (currentDay === 2) { // Mardi
    // Si c'est avant 21h15, le tirage est aujourd'hui, sinon vendredi
    const currentHour = today.getHours();
    const currentMinutes = today.getMinutes();
    
    if (currentHour > 21 || (currentHour === 21 && currentMinutes >= 15)) {
      nextDrawDate.setDate(today.getDate() + 3); // Vendredi
    }
  } else if (currentDay === 3) { // Mercredi -> Vendredi
    nextDrawDate.setDate(today.getDate() + 2);
  } else if (currentDay === 4) { // Jeudi -> Vendredi
    nextDrawDate.setDate(today.getDate() + 1);
  } else if (currentDay === 5) { // Vendredi
    // Si c'est avant 21h15, le tirage est aujourd'hui, sinon mardi prochain
    const currentHour = today.getHours();
    const currentMinutes = today.getMinutes();
    
    if (currentHour > 21 || (currentHour === 21 && currentMinutes >= 15)) {
      nextDrawDate.setDate(today.getDate() + 4); // Mardi prochain
    }
  } else if (currentDay === 6) { // Samedi -> Mardi
    nextDrawDate.setDate(today.getDate() + 3);
  }
  
  return nextDrawDate.toISOString().split('T')[0];
};
