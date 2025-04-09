const axios = require('axios');
const cheerio = require('cheerio');
const { format } = require('date-fns');
const fs = require('fs');
const path = require('path');
const winston = require('winston');

// Configuration du logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => {
      return `[${timestamp}] [${level.toUpperCase()}] [scrapingService] ${message}`;
    })
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: path.join(__dirname, '../logs/scraping.log') })
  ]
});

// Assurez-vous que le répertoire logs existe
const logDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// URL de base pour le site de l'EuroMillions
const BASE_URL = 'https://www.euro-millions.com/fr/resultats';

/**
 * Récupère le dernier tirage EuroMillions depuis le site officiel
 * @returns {Promise<Object>} Le dernier tirage
 */
async function fetchLatestDraw() {
  try {
    logger.info('Récupération du dernier tirage EuroMillions');
    
    // Requête vers la page des derniers résultats
    const response = await axios.get(BASE_URL);
    const $ = cheerio.load(response.data);
    
    // Extraction de la date du dernier tirage
    const dateElement = $('.result-date');
    const dateText = dateElement.text().trim();
    const dateParts = dateText.match(/(\d+)[^\d]+(\d+)[^\d]+(\d+)/);
    
    let date;
    if (dateParts && dateParts.length === 4) {
      // Transformation au format YYYY-MM-DD
      date = `${dateParts[3]}-${dateParts[2].padStart(2, '0')}-${dateParts[1].padStart(2, '0')}`;
    } else {
      // Utiliser la date du jour comme fallback
      date = format(new Date(), 'yyyy-MM-dd');
      logger.warn(`Date non trouvée, utilisation de la date du jour: ${date}`);
    }
    
    // Extraction des numéros gagnants
    const numbers = [];
    $('.main-numbers .ball').each((i, element) => {
      numbers.push(parseInt($(element).text().trim(), 10));
    });
    
    // Extraction des étoiles
    const stars = [];
    $('.lucky-stars .star').each((i, element) => {
      stars.push(parseInt($(element).text().trim(), 10));
    });
    
    // Extraction du montant du jackpot et du nombre de gagnants
    const jackpotText = $('.jackpot').text().trim();
    const jackpotMatch = jackpotText.match(/(\d+[\d\s,\.]*)/);
    const jackpot = jackpotMatch ? jackpotMatch[1].replace(/[\s,.]/g, '') : '0';
    
    const winnersText = $('.winner-info').first().text().trim();
    const winnersMatch = winnersText.match(/(\d+)/);
    const winners = winnersMatch ? parseInt(winnersMatch[1], 10) : 0;
    
    logger.info(`Tirage récupéré avec succès pour la date: ${date}`);
    
    return {
      date,
      numbers,
      stars,
      jackpot: parseInt(jackpot, 10),
      winners
    };
  } catch (error) {
    logger.error(`Erreur lors de la récupération du dernier tirage: ${error.message}`);
    throw new Error(`Erreur de scraping: ${error.message}`);
  }
}

/**
 * Récupère l'historique des tirages sur une période donnée
 * @param {number} limit Nombre de tirages à récupérer
 * @returns {Promise<Array>} Liste des tirages récupérés
 */
async function fetchDrawHistory(limit = 10) {
  try {
    logger.info(`Récupération de l'historique des ${limit} derniers tirages`);
    
    const draws = [];
    const response = await axios.get(`${BASE_URL}/archive`);
    const $ = cheerio.load(response.data);
    
    $('.archive-table tbody tr').each((i, row) => {
      if (i >= limit) return false;
      
      const dateText = $(row).find('td').eq(0).text().trim();
      const dateParts = dateText.match(/(\d+)[^\d]+(\d+)[^\d]+(\d+)/);
      
      if (!dateParts || dateParts.length !== 4) return;
      
      const date = `${dateParts[3]}-${dateParts[2].padStart(2, '0')}-${dateParts[1].padStart(2, '0')}`;
      
      const numbersText = $(row).find('.main-numbers').text().trim();
      const numbers = numbersText.split(/\s+/).map(n => parseInt(n, 10)).filter(n => !isNaN(n));
      
      const starsText = $(row).find('.lucky-stars').text().trim();
      const stars = starsText.split(/\s+/).map(n => parseInt(n, 10)).filter(n => !isNaN(n));
      
      draws.push({
        date,
        numbers,
        stars,
        jackpot: 0, // Ces informations ne sont pas disponibles sur la page d'archive
        winners: 0  // Ces informations ne sont pas disponibles sur la page d'archive
      });
    });
    
    logger.info(`${draws.length} tirages historiques récupérés avec succès`);
    return draws;
  } catch (error) {
    logger.error(`Erreur lors de la récupération de l'historique des tirages: ${error.message}`);
    throw new Error(`Erreur de scraping: ${error.message}`);
  }
}

module.exports = {
  fetchLatestDraw,
  fetchDrawHistory
};
