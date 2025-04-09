/**
 * EuroMillions App - Configuration
 * Centralise toutes les variables de configuration
 */

require('dotenv').config();

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
    baseUrl: 'https://www.euro-millions.com',
    historyUrl: 'https://www.euro-millions.com/results-history-',
    resultsUrl: 'https://www.euro-millions.com/results',
    // Délai entre les requêtes pour éviter d'être bloqué (en ms)
    requestDelay: process.env.SCRAPING_DELAY || 2000,
    // User agents aléatoires pour éviter la détection
    userAgents: [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.107 Safari/537.36'
    ],
    // Années à scraper (de 2004 à l'année courante)
    yearsToScrape: Array.from(
      { length: new Date().getFullYear() - 2003 }, 
      (_, i) => 2004 + i
    ),
  },
  
  // Configuration des tâches CRON
  cron: {
    // Mise à jour des tirages les mardis et vendredis à 23h15
    updateSchedule: '15 23 * * 2,5',
  },
  
  // Limites pour la protection contre les abus d'API
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limite chaque IP à 100 requêtes par fenêtre
  }
};