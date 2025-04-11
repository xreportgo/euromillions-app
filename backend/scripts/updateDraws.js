const scrapingService = require('../services/scrapingService');
const drawModel = require('../models/drawModel');
const fs = require('fs');
const path = require('path');
const winston = require('winston');

// Création du logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => {
      return `[${timestamp}] [${level.toUpperCase()}] [updateDraws] ${message}`;
    })
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: path.join(__dirname, '../logs/update.log') })
  ]
});

// Assurez-vous que le répertoire logs existe
const logDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logDir)) {
  try {
    fs.mkdirSync(logDir, { recursive: true });
  } catch (error) {
    logger.error(`Erreur lors de la création du dossier logs : ${error.message}`);
  }
}

/**
 * Met à jour la base de données avec le dernier tirage EuroMillions
 */
async function updateDraw() {
  logger.info('Démarrage de la mise à jour des tirages...');
  
  try {
    // Récupérer le dernier tirage
    logger.info('Récupération du dernier tirage...');
    const latestDraw = await scrapingService.fetchLatestDraw();
    
    if (!latestDraw || !latestDraw.date) {
      logger.error('Impossible de récupérer le dernier tirage: données invalides');
      return { success: false, message: 'Données de tirage invalides', updated: false };
    }
    
    // Vérifier s'il existe déjà dans la base de données
    const existingDraw = await drawModel.getDrawByDate(latestDraw.date);
    
    if (existingDraw) {
      logger.info(`Le tirage du ${latestDraw.date} existe déjà dans la base de données.`);
      return { success: true, message: 'Aucune mise à jour nécessaire', updated: false };
    }
    
    // Ajouter le nouveau tirage
    await drawModel.addDraw(latestDraw);
    logger.info(`Tirage du ${latestDraw.date} ajouté avec succès à la base de données.`);
    
    // Vérifier s'il y a des tirages manquants (optionnel)
    await updateMissingDraws();
    
    return {
      success: true,
      message: `Tirage du ${latestDraw.date} ajouté avec succès`,
      updated: true,
      draw: latestDraw
    };
  } catch (error) {
    logger.error(`Erreur lors de la mise à jour des tirages: ${error.message}`);
    return { success: false, message: error.message, updated: false };
  }
}

/**
 * Vérifie et ajoute les tirages manquants dans la base de données
 */
async function updateMissingDraws() {
  try {
    logger.info('Vérification des tirages manquants...');
    
    // Récupérer les 20 derniers tirages
    const historyDraws = await scrapingService.fetchDrawHistory(20);
    let addedCount = 0;
    
    if (!Array.isArray(historyDraws) || historyDraws.length === 0) {
      logger.warn('Aucun historique de tirages récupéré');
      return { success: true, addedCount: 0 };
    }
    
    // Pour chaque tirage de l'historique
    for (const draw of historyDraws) {
      if (!draw || !draw.date) {
        logger.warn('Tirage invalide détecté dans l\'historique');
        continue;
      }
      
      // Vérifier s'il existe déjà
      const existingDraw = await drawModel.getDrawByDate(draw.date);
      
      if (!existingDraw) {
        // Ajouter le tirage manquant
        await drawModel.addDraw(draw);
        logger.info(`Tirage manquant du ${draw.date} ajouté à la base de données.`);
        addedCount++;
      }
    }
    
    logger.info(`${addedCount} tirages manquants ont été ajoutés à la base de données.`);
    return { success: true, addedCount };
  } catch (error) {
    logger.error(`Erreur lors de la mise à jour des tirages manquants: ${error.message}`);
    return { success: false, message: error.message };
  }
}

// Si exécuté directement (pas importé comme module)
if (require.main === module) {
  updateDraw()
    .then(result => {
      logger.info(`Mise à jour terminée: ${JSON.stringify(result)}`);
      process.exit(0);
    })
    .catch(error => {
      logger.error(`Erreur non gérée: ${error.message}`);
      process.exit(1);
    });
}

module.exports = {
  updateDraw,
  updateMissingDraws
};
