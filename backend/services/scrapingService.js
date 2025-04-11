/**
 * Service de scraping pour récupérer les données EuroMillions depuis le site officiel
 */

const axios = require('axios');
const cheerio = require('cheerio');
const { format } = require('date-fns');
const { utcToZonedTime } = require('date-fns-tz');
const path = require('path');
const fs = require('fs');
const winston = require('winston');

// Extrait du script de scraping
const userAgentService = require('../services/userAgentService');

// Utilisation dans la requête axios
const response = await axios.get(url, {
  headers: {
    'User-Agent': userAgentService.getNextUserAgent()
  }
});


// Configuration
const BASE_URL = 'https://www.euro-millions.com/fr/resultats';
const ARCHIVE_URL = 'https://www.euro-millions.com/fr/resultats-archive';

// Configuration du logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => {
      return `${timestamp} ${level.toUpperCase()}: [scrapingService] ${message}`;
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

/**
 * Récupère le dernier tirage EuroMillions depuis le site officiel
 * @returns {Promise<Object>} - Les données du dernier tirage
 */
async function fetchLatestDraw() {
  try {
    logger.info('Récupération du dernier tirage EuroMillions');
    
    // Requête vers la page des derniers résultats
    const response = await axios.get(BASE_URL);
    const $ = cheerio.load(response.data);
    
    // Extraction de la date du dernier tirage
    const dateElement = $('.result-date');
    let dateText = dateElement.text().trim();
    let dateParts = dateText.match(/(\d+)\/(\d+)\/(\d+)/);
    
    if (!dateParts || dateParts.length !== 4) {
      logger.warn('Format de date non reconnu:', dateText);
      // Utiliser la date du jour comme fallback
      const today = new Date();
      dateParts = [null, today.getDate(), today.getMonth() + 1, today.getFullYear()];
    }
    
    // Transformation au format YYYY-MM-DD
    const date = `${dateParts[3]}-${dateParts[2].padStart(2, '0')}-${dateParts[1].padStart(2, '0')}`;
    
    // Extraction des numéros gagnants
    const numbers = [];
    $('.main-numbers .ball').each((i, element) => {
      numbers.push(parseInt($(element).text().trim(), 10));
    });
    
    // Extraction des étoiles
    const stars = [];
    $('.lucky-stars .ball').each((i, element) => {
      stars.push(parseInt($(element).text().trim(), 10));
    });
    
    // Extraction du montant du jackpot et du nombre de gagnants
    const jackpotText = $('.jackpot-amount').text().trim();
    const jackpotMatch = jackpotText.match(/(\d+[,.]\d+|\d+)\s*(?:million|M)?/);
    const jackpot = jackpotMatch ? parseFloat(jackpotMatch[1].replace(',', '.')) : 0;
    
    const winnersText = $('.winner-info').first().text().trim();
    const winnersMatch = winnersText.match(/(\d+)/);
    const winners = winnersMatch ? parseInt(winnersMatch[0], 10) : 0;
    
    logger.info(`Tirage récupéré avec succès pour la date: ${date}`);
    
    return {
      date,
      numbers,
      stars,
      jackpot: parseFloat(jackpot.toFixed(2)),
      winners
    };
  } catch (error) {
    logger.error(`Erreur lors de la récupération du dernier tirage: ${error.message}`);
    throw new Error(`Erreur de scraping: ${error.message}`);
  }
}

/**
 * Récupère un tirage spécifique par date
 * @param {Date} targetDate - La date du tirage à récupérer
 * @returns {Promise<Object|null>} - Les données du tirage ou null si non trouvé
 */
async function fetchDrawByDate(targetDate) {
  try {
    const formattedDate = format(targetDate, 'yyyy-MM-dd');
    logger.info(`Tentative de récupération du tirage pour la date: ${formattedDate}`);
    
    // Format de la date pour la recherche sur le site
    const searchDateFormat = format(targetDate, 'dd/MM/yyyy');
    
    // D'abord, essayer de récupérer depuis la page principale si c'est le dernier tirage
    const latestDraw = await fetchLatestDraw();
    if (latestDraw && latestDraw.date === formattedDate) {
      logger.info(`Tirage du ${formattedDate} trouvé dans les derniers résultats`);
      return latestDraw;
    }
    
    // Sinon, chercher dans l'archive
    logger.info(`Recherche du tirage du ${formattedDate} dans les archives`);
    
    // Construction de l'URL pour l'archive avec la date
    // Note: Ajuster le format selon la structure d'URL du site
    const archiveUrl = `${ARCHIVE_URL}/${format(targetDate, 'yyyy')}/${format(targetDate, 'MM')}`;
    
    const response = await axios.get(archiveUrl);
    const $ = cheerio.load(response.data);
    
    let drawData = null;
    
    // Parcourir les résultats d'archive pour trouver la date cible
    $('.archive-table tr').each((idx, element) => {
      if (idx === 0) return; // Ignorer l'en-tête
      
      const dateCell = $(element).find('td').first();
      const dateText = dateCell.text().trim();
      
      if (dateText.includes(searchDateFormat)) {
        // Récupérer les numéros et étoiles
        const numbers = [];
        const stars = [];
        
        $(element).find('.main-ball').each((i, ball) => {
          numbers.push(parseInt($(ball).text().trim(), 10));
        });
        
        $(element).find('.lucky-star').each((i, star) => {
          stars.push(parseInt($(star).text().trim(), 10));
        });
        
        // Récupérer le lien vers la page détaillée pour obtenir plus d'informations
        const detailLink = dateCell.find('a').attr('href');
        
        drawData = {
          date: formattedDate,
          numbers,
          stars,
          // Si le jackpot n'est pas disponible dans le tableau d'archives,
          // une valeur par défaut est utilisée
          jackpot: 0,
          winners: 0
        };
        
        return false; // Sortir de la boucle
      }
    });
    
    if (!drawData) {
      logger.warn(`Aucun tirage trouvé pour la date ${formattedDate}`);
      return null;
    }
    
    // Si un lien détaillé est disponible, on pourrait faire une requête supplémentaire
    // pour récupérer plus d'informations comme le jackpot et les gagnants
    // Cette partie dépend de la structure du site
    
    logger.info(`Tirage récupéré avec succès pour la date: ${formattedDate}`);
    return drawData;
    
  } catch (error) {
    logger.error(`Erreur lors de la récupération du tirage pour la date ${format(targetDate, 'yyyy-MM-dd')}: ${error.message}`);
    return null;
  }
}

/**
 * Récupère l'historique des tirages sur une période donnée
 * @param {number} limit - Nombre de tirages à récupérer
 * @returns {Promise<Array>} - Liste des tirages récupérés
 */
async function fetchDrawHistory(limit = 10) {
  try {
    logger.info(`Récupération de l'historique des ${limit} derniers tirages`);
    
    const response = await axios.get(`${ARCHIVE_URL}`);
    const $ = cheerio.load(response.data);
    
    const draws = [];
    
    // Parcourir les résultats d'archive
    $('.archive-table tr').each((idx, element) => {
      if (idx === 0 || idx > limit) return; // Ignorer l'en-tête et limiter le nombre de résultats
      
      const dateCell = $(element).find('td').first();
      const dateText = dateCell.text().trim();
      const dateParts = dateText.match(/(\d+)\/(\d+)\/(\d+)/);
      
      if (!dateParts || dateParts.length !== 4) {
        logger.warn('Format de date non reconnu:', dateText);
        return;
      }
      
      // Transformation au format YYYY-MM-DD
      const date = `${dateParts[3]}-${dateParts[2].padStart(2, '0')}-${dateParts[1].padStart(2, '0')}`;
      
      // Récupérer les numéros et étoiles
      const numbers = [];
      const stars = [];
      
      $(element).find('.main-ball').each((i, ball) => {
        numbers.push(parseInt($(ball).text().trim(), 10));
      });
      
      $(element).find('.lucky-star').each((i, star) => {
        stars.push(parseInt($(star).text().trim(), 10));
      });
      
      draws.push({
        date,
        numbers,
        stars,
        // Les informations sur le jackpot et les gagnants pourraient nécessiter
        // une requête supplémentaire pour chaque tirage
        jackpot: 0,
        winners: 0
      });
    });
    
    logger.info(`${draws.length} tirages récupérés avec succès`);
    return draws;
    
  } catch (error) {
    logger.error(`Erreur lors de la récupération de l'historique des tirages: ${error.message}`);
    throw error;
  }
}

module.exports = {
  fetchLatestDraw,
  fetchDrawByDate,
  fetchDrawHistory
};
