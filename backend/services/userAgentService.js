// backend/services/userAgentService.js
const config = require('../config');

/**
 * Service de gestion des User-Agents pour le scraping
 */
class UserAgentService {
  constructor() {
    this.userAgents = config.scraping?.userAgents || [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.107 Safari/537.36'
    ];
    this.lastIndex = -1;
  }
  
  /**
   * Retourne un User-Agent de manière aléatoire
   * @returns {string} Un User-Agent aléatoire
   */
  getRandomUserAgent() {
    const index = Math.floor(Math.random() * this.userAgents.length);
    return this.userAgents[index];
  }
  
  /**
   * Retourne les User-Agents dans un ordre séquentiel
   * @returns {string} Un User-Agent dans l'ordre séquentiel
   */
  getNextUserAgent() {
    this.lastIndex = (this.lastIndex + 1) % this.userAgents.length;
    return this.userAgents[this.lastIndex];
  }
}

module.exports = new UserAgentService();
