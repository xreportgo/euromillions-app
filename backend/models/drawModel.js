/**
 * Modèle pour gérer les tirages EuroMillions dans la base de données
 */

const { format } = require('date-fns');
const db = require('../db'); // Adapter selon votre structure
const logger = require('../utils/logger'); // Adapter selon votre structure

/**
 * Récupère le dernier tirage depuis la base de données
 * @returns {Promise<Object|null>} - Le dernier tirage ou null si aucun
 */
async function getLatestDraw() {
  try {
    return await db.draws.findOne({}, { sort: { date: -1 } });
  } catch (error) {
    logger.error(`Erreur lors de la récupération du dernier tirage: ${error.message}`);
    throw error;
  }
}

/**
 * Récupère un tirage par sa date
 * @param {Date} date - La date du tirage à récupérer
 * @returns {Promise<Object|null>} - Le tirage ou null si non trouvé
 */
async function getDrawByDate(date) {
  try {
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    
    return await db.draws.findOne({
      date: {
        $gte: targetDate,
        $lt: new Date(targetDate.getTime() + 24*60*60*1000)
      }
    });
  } catch (error) {
    logger.error(`Erreur lors de la récupération du tirage pour la date ${format(date, 'yyyy-MM-dd')}: ${error.message}`);
    throw error;
  }
}

/**
 * Ajoute ou met à jour un tirage dans la base de données
 * @param {Object} drawData - Les données du tirage
 * @returns {Promise<Object>} - Résultat de l'opération
 */
async function addOrUpdateDraw(drawData) {
  try {
    // Formater la date pour la recherche
    const drawDate = new Date(drawData.date);
    drawDate.setHours(0, 0, 0, 0);
    
    // Vérifier si ce tirage existe déjà
    const existingDraw = await db.draws.findOne({ 
      date: {
        $gte: drawDate,
        $lt: new Date(drawDate.getTime() + 24*60*60*1000)
      }
    });
    
    if (existingDraw) {
      // Mise à jour du tirage existant
      logger.info(`Mise à jour du tirage existant du ${format(drawDate, 'yyyy-MM-dd')}`);
      
      const updateResult = await db.draws.updateOne(
        { _id: existingDraw._id },
        { $set: {
          numbers: drawData.numbers,
          stars: drawData.stars,
          jackpot: drawData.jackpot || existingDraw.jackpot,
          winners: drawData.winners || existingDraw.winners,
          updated_at: new Date()
        }}
      );
      
      return { updated: true, id: existingDraw._id };
    } else {
      // Ajouter un nouveau tirage
      logger.info(`Ajout d'un nouveau tirage pour le ${format(drawDate, 'yyyy-MM-dd')}`);
      
      const newDraw = {
        date: drawDate,
        numbers: drawData.numbers,
        stars: drawData.stars,
        jackpot: drawData.jackpot || 0,
        winners: drawData.winners || 0,
        created_at: new Date(),
        updated_at: new Date()
      };
      
      const insertResult = await db.draws.insertOne(newDraw);
      return { inserted: true, id: insertResult.insertedId };
    }
    
  } catch (error) {
    logger.error(`Erreur lors de l'ajout/mise à jour du tirage: ${error.message}`);
    throw error;
  }
}

/**
 * Récupère tous les tirages, triés par date (du plus récent au plus ancien)
 * @param {number} limit - Nombre maximum de tirages à récupérer (0 = tous)
 * @returns {Promise<Array>} - Liste des tirages
 */
async function getAllDraws(limit = 0) {
  try {
    const options = { sort: { date: -1 } };
    if (limit > 0) options.limit = limit;
    
    return await db.draws.find({}, options).toArray();
  } catch (error) {
    logger.error(`Erreur lors de la récupération des tirages: ${error.message}`);
    throw error;
  }
}

/**
 * Supprime un tirage par sa date
 * @param {Date} date - La date du tirage à supprimer
 * @returns {Promise<Object>} - Résultat de la suppression
 */
async function deleteDrawByDate(date) {
  try {
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    
    const result = await db.draws.deleteOne({
      date: {
        $gte: targetDate,
        $lt: new Date(targetDate.getTime() + 24*60*60*1000)
      }
    });
    
    return { deleted: result.deletedCount > 0 };
  } catch (error) {
    logger.error(`Erreur lors de la suppression du tirage pour la date ${format(date, 'yyyy-MM-dd')}: ${error.message}`);
    throw error;
  }
}

module.exports = {
  getLatestDraw,
  getDrawByDate,
  addOrUpdateDraw,
  getAllDraws,
  deleteDrawByDate
};
