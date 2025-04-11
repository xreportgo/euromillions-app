/**
 * EuroMillions App - Configuration
 * Centralise toutes les variables de configuration
 */
require('dotenv').config();
const path = require('path');

module.exports = {
  // Environnement
  env: process.env.NODE_ENV || 'development',
  
  // Configuration du serveur
  port: process.env.PORT || 3000,
  
  // Configuration de la base de données
  database: {
    path: process.env.DB_PATH || './db/euromillions.sqlite',
  },
  
  // Configuration du scraping
  scraping: {
    baseUrl: process.env.SCRAPING_BASE_URL || 'https://www.euro-millions.com',
    historyUrl: process.env.SCRAPING_HISTORY_URL || 'https://www.euro-millions.com/results-history',
    resultsUrl: process.env.SCRAPING_RESULTS_URL || 'https://www.euro-millions.com/results',
    requestDelay: parseInt(process.env.SCRAPING_DELAY, 10) || 2000,
    userAgents: [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.107 Safari/537.36'
    ]
  },
  
  // Configuration des années à scraper
  yearsToScrape: Array.from(
    { length: new Date().getFullYear() - 2004 + 1 },
    (_, i) => 2004 + i
  ),
  
  // Configuration CRON
  cron: {
    updateSchedule: '15 23 * * 2,5',
  },
  
  // Limites pour la protection contre les abus d'API
  rateLimit: {
    windowMs: parseInt(process.env.API_RATE_LIMIT_WINDOW, 10) * 60 * 1000 || 15 * 60 * 1000, // 15 minutes par défaut
    max: parseInt(process.env.API_RATE_LIMIT_MAX, 10) || 100, // limité à 100 requêtes par fenêtre
  }
};
