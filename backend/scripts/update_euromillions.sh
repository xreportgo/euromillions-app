// backend/scripts/update_euromillions.js
const axios = require('axios');
const cheerio = require('cheerio');
const path = require('path');
const dbService = require('../services/dbService');
const logger = require('../utils/logger');
const config = require('../config');
const userAgentService = require('../services/userAgentService');

/**
 * Met à jour les résultats EuroMillions depuis le site source
 */
async function updateEuromillionsResults() {
  try {
    logger.info('Démarrage de la mise à jour des résultats EuroMillions');
    
    // Connexion à la base de données
    const db = await dbService.getDb();
    
    // Récupération de la page web avec un délai aléatoire
    const delay = Math.floor(Math.random() * 1000) + config.scraping.requestDelay;
    await new Promise(resolve => setTimeout(resolve, delay));
    
    const response = await axios.get(config.scraping.resultsUrl, {
      headers: {
        'User-Agent': userAgentService.getRandomUserAgent(),
        'Accept': 'text/html,application/xhtml+xml,application/xml',
        'Accept-Language': 'fr,fr-FR;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6',
        'Referer': config.scraping.baseUrl,
        'Cache-Control': 'no-cache'
      }
    });
    
    // Analyse du HTML
    const $ = cheerio.load(response.data);
    
    // Extraction des données (à adapter selon la structure du site)
    const drawDateElement = $('.date');
    const numbersElements = $('.balls .ball');
    const starsElements = $('.lucky-stars .star');
    
    if (!drawDateElement.length || !numbersElements.length || !starsElements.length) {
      throw new Error('Impossible de trouver les éléments nécessaires sur la page');
    }
    
    const drawDate = drawDateElement.text().trim();
    const numbers = numbersElements.map((i, el) => $(el).text().trim()).get();
    const stars = starsElements.map((i, el) => $(el).text().trim()).get();
    
    // Récupération du jackpot et des gagnants (si disponibles)
    const jackpotElement = $('.jackpot');
    const winnersElement = $('.winners');
    
    const jackpot = jackpotElement.length ? jackpotElement.text().trim() : '';
    const winners = winnersElement.length ? winnersElement.text().trim() : '0';
    
    // Formatage des données
    const formattedDate = formatDrawDate(drawDate);
    const formattedNumbers = numbers.join(',');
    const formattedStars = stars.join(',');
    
    logger.info(`Données récupérées pour le tirage du ${formattedDate}`);
    
    // Vérification si ce tirage existe déjà
    const existingDraw = await db.get("SELECT id FROM draws WHERE date = ?", [formattedDate]);
    
    if (existingDraw) {
      logger.info(`Le tirage du ${formattedDate} existe déjà dans la base de données.`);
      return true;
    }
    
    // Insertion des données dans la base
    const result = await db.run(
      "INSERT INTO draws (date, numbers, stars, jackpot, winners) VALUES (?, ?, ?, ?, ?)",
      [formattedDate, formattedNumbers, formattedStars, jackpot, winners]
    );
    
    logger.info(`Nouveau tirage ajouté: ${formattedDate} (ID: ${result.lastID})`);
    
    return true;
  } catch (error) {
    logger.error('Erreur lors de la mise à jour des résultats:', error);
    return false;
  } finally {
    // On ne ferme pas la connexion ici car cela pourrait affecter d'autres parties de l'application
  }
}

/**
 * Formate la date du tirage au format ISO
 * @param {string} dateString - Date au format du site (ex: 'Mardi 11 Avril 2023')
 * @returns {string} - Date au format ISO (ex: '2023-04-11')
 */
function formatDrawDate(dateString) {
  // Extraction du jour, mois et année
  const dateRegex = /(\d{1,2})[^\d]+(\w+)[^\d]+(\d{4})/i;
  const match = dateString.match(dateRegex);
  
  if (!match) {
    // Si le format est inattendu, retourner la date du jour
    return new Date().toISOString().split('T')[0];
  }
  
  const day = match[1].padStart(2, '0');
  let month;
  
  // Conversion du mois en nombre
  const monthName = match[2].toLowerCase();
  const monthNames = [
    'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
    'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'
  ];
  
  // Gestion multilingue (fr/en)
  const englishMonthNames = [
    'january', 'february', 'march', 'april', 'may', 'june',
    'july', 'august', 'september', 'october', 'november', 'december'
  ];
  
  let monthIndex = monthNames.findIndex(m => monthName.startsWith(m.substring(0, 3)));
  if (monthIndex === -1) {
    monthIndex = englishMonthNames.findIndex(m => monthName.startsWith(m.substring(0, 3)));
  }
  
  month = (monthIndex + 1).toString().padStart(2, '0');
  const year = match[3];
  
  return `${year}-${month}-${day}`;
}

// Exécuter le script si appelé directement
if (require.main === module) {
  updateEuromillionsResults()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      logger.error('Erreur fatale:', error);
      process.exit(1);
    });
} else {
  // Exporter la fonction pour l'utiliser ailleurs
  module.exports = updateEuromillionsResults;
}
