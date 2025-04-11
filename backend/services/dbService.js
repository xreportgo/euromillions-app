// backend/services/dbService.js
const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');
const fs = require('fs');
const config = require('../config');
const logger = require('../utils/logger');

class DbService {
  constructor() {
    this.db = null;
    this.dbPath = path.resolve(process.cwd(), config.database.path);
    this.dbDir = path.dirname(this.dbPath);
  }
  
  async init() {
    try {
      // Vérifier si le fichier de base de données existe
      if (!fs.existsSync(this.dbPath)) {
        logger.warn(`Base de données non trouvée : ${this.dbPath}`);
        
        // Créer le répertoire si nécessaire
        if (!fs.existsSync(this.dbDir)) {
          fs.mkdirSync(this.dbDir, { recursive: true });
          logger.info(`Répertoire de base de données créé: ${this.dbDir}`);
        }
      } else {
        logger.info(`Base de données existante trouvée: ${this.dbPath}`);
      }
      
      // Ouvrir la connexion
      this.db = await open({
        filename: this.dbPath,
        driver: sqlite3.Database
      });
      
      logger.info(`Connexion établie avec la base de données: ${this.dbPath}`);
      
      // Vérifier que la table draws existe
      const tableExists = await this.db.get(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='draws'"
      );
      
      if (!tableExists) {
        logger.warn("Table 'draws' non trouvée, création...");
        await this.createTables();
      } else {
        // Compter le nombre d'enregistrements
        const count = await this.db.get("SELECT COUNT(*) as count FROM draws");
        logger.info(`Base de données contient ${count.count} tirages`);
      }
      
      return this.db;
    } catch (error) {
      logger.error('Erreur lors de l\'initialisation de la base de données:', error);
      throw error;
    }
  }
  
  async createTables() {
    try {
      // Table des tirages
      await this.db.exec(`
        CREATE TABLE IF NOT EXISTS draws (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          date TEXT NOT NULL UNIQUE,
          numbers TEXT NOT NULL,
          stars TEXT NOT NULL,
          jackpot TEXT,
          winners TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      logger.info('Structure de la base de données créée');
    } catch (error) {
      logger.error('Erreur lors de la création des tables:', error);
      throw error;
    }
  }
  
  async getDb() {
    if (!this.db) {
      await this.init();
    }
    return this.db;
  }
  
  async close() {
    if (this.db) {
      await this.db.close();
      this.db = null;
      logger.info('Connexion à la base de données fermée');
    }
  }
}

module.exports = new DbService();
