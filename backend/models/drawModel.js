const path = require('path');
const fs = require('fs');
const winston = require('winston');
const database = require('../db/database');

// Création du logger pour le modèle de tirage
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => {
      return `[${timestamp}] [${level.toUpperCase()}] [drawModel] ${message}`;
    })
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ 
      filename: path.join(__dirname, '../logs/models.log') 
    })
  ]
});

// Assurez-vous que le répertoire logs existe
const logDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

/**
 * Récupère tous les tirages de la base de données
 * @returns {Promise<Array>} Liste des tirages
 */
async function getAllDraws() {
  try {
    const rows = await database.all(`
      SELECT * FROM draws
      ORDER BY date(draw_date) DESC
    `);
    
    return rows.map(formatDrawFromDb);
  } catch (error) {
    logger.error(`Erreur lors de la récupération des tirages: ${error.message}`);
    throw error;
  }
}

/**
 * Récupère un tirage par sa date
 * @param {string} date - Date du tirage au format YYYY-MM-DD
 * @returns {Promise<Object>} Tirage trouvé ou null
 */
async function getDrawByDate(date) {
  try {
    const row = await database.get(`
      SELECT * FROM draws
      WHERE draw_date = ?
    `, [date]);
    
    return row ? formatDrawFromDb(row) : null;
  } catch (error) {
    logger.error(`Erreur lors de la récupération du tirage du ${date}: ${error.message}`);
    throw error;
  }
}

/**
 * Récupère le dernier tirage
 * @returns {Promise<Object>} Dernier tirage ou null
 */
async function getLastDraw() {
  try {
    const row = await database.get(`
      SELECT * FROM draws
      ORDER BY date(draw_date) DESC
      LIMIT 1
    `);
    
    return row ? formatDrawFromDb(row) : null;
  } catch (error) {
    logger.error(`Erreur lors de la récupération du dernier tirage: ${error.message}`);
    throw error;
  }
}

/**
 * Ajoute un nouveau tirage dans la base de données
 * @param {Object} draw - Informations du tirage
 * @returns {Promise<Object>} Tirage ajouté avec son ID
 */
async function addDraw(draw) {
  try {
    // Vérification si le tirage existe déjà
    const existingDraw = await getDrawByDate(draw.date);
    if (existingDraw) {
      logger.info(`Le tirage du ${draw.date} existe déjà, mise à jour...`);
      return await updateDraw(existingDraw.id, draw);
    }
    
    // Conversion des arrays en strings pour la DB
    const numbersStr = draw.numbers.join(',');
    const starsStr = draw.stars.join(',');
    
    const result = await database.run(`
      INSERT INTO draws (draw_date, numbers, stars, jackpot, jackpot_winners)
      VALUES (?, ?, ?, ?, ?)
    `, [
      draw.date,
      numbersStr,
      starsStr,
      draw.jackpot || null,
      draw.winners || null
    ]);
    
    logger.info(`Tirage du ${draw.date} ajouté avec succès (ID: ${result.lastID})`);
    
    return {
      id: result.lastID,
      ...draw
    };
  } catch (error) {
    logger.error(`Erreur lors de l'ajout du tirage: ${error.message}`);
    throw error;
  }
}

/**
 * Met à jour un tirage existant
 * @param {number} id - ID du tirage à mettre à jour
 * @param {Object} draw - Nouvelles informations du tirage
 * @returns {Promise<Object>} Tirage mis à jour
 */
async function updateDraw(id, draw) {
  try {
    // Conversion des arrays en strings pour la DB
    const numbersStr = draw.numbers.join(',');
    const starsStr = draw.stars.join(',');
    
    await database.run(`
      UPDATE draws
      SET draw_date = ?,
          numbers = ?,
          stars = ?,
          jackpot = ?,
          jackpot_winners = ?
      WHERE id = ?
    `, [
      draw.date,
      numbersStr,
      starsStr,
      draw.jackpot || null,
      draw.winners || null,
      id
    ]);
    
    logger.info(`Tirage du ${draw.date} (ID: ${id}) mis à jour avec succès`);
    
    return {
      id,
      ...draw
    };
  } catch (error) {
    logger.error(`Erreur lors de la mise à jour du tirage (ID: ${id}): ${error.message}`);
    throw error;
  }
}

/**
 * Supprime un tirage de la base de données
 * @param {number} id - ID du tirage à supprimer
 * @returns {Promise<boolean>} True si supprimé avec succès
 */
async function deleteDraw(id) {
  try {
    const result = await database.run(`
      DELETE FROM draws
      WHERE id = ?
    `, [id]);
    
    if (result.changes > 0) {
      logger.info(`Tirage (ID: ${id}) supprimé avec succès`);
      return true;
    } else {
      logger.warn(`Aucun tirage trouvé avec l'ID: ${id}`);
      return false;
    }
  } catch (error) {
    logger.error(`Erreur lors de la suppression du tirage (ID: ${id}): ${error.message}`);
    throw error;
  }
}

/**
 * Récupère les tirages entre deux dates
 * @param {string} startDate - Date de début au format YYYY-MM-DD
 * @param {string} endDate - Date de fin au format YYYY-MM-DD
 * @returns {Promise<Array>} Liste des tirages
 */
async function getDrawsBetweenDates(startDate, endDate) {
  try {
    const rows = await database.all(`
      SELECT * FROM draws
      WHERE date(draw_date) BETWEEN date(?) AND date(?)
      ORDER BY date(draw_date) DESC
    `, [startDate, endDate]);
    
    return rows.map(formatDrawFromDb);
  } catch (error) {
    logger.error(`Erreur lors de la récupération des tirages entre ${startDate} et ${endDate}: ${error.message}`);
    throw error;
  }
}

/**
 * Récupère les tirages d'une année spécifique
 * @param {number} year - Année des tirages
 * @returns {Promise<Array>} Liste des tirages
 */
async function getDrawsByYear(year) {
  try {
    const startDate = `${year}-01-01`;
    const endDate = `${year}-12-31`;
    
    return await getDrawsBetweenDates(startDate, endDate);
  } catch (error) {
    logger.error(`Erreur lors de la récupération des tirages de l'année ${year}: ${error.message}`);
    throw error;
  }
}

/**
 * Formate un tirage venant de la base de données
 * @param {Object} row - Ligne de la base de données
 * @returns {Object} Tirage formaté
 */
function formatDrawFromDb(row) {
  return {
    id: row.id,
    date: row.draw_date,
    numbers: row.numbers.split(',').map(num => parseInt(num, 10)),
    stars: row.stars.split(',').map(star => parseInt(star, 10)),
    jackpot: row.jackpot,
    winners: row.jackpot_winners,
    createdAt: row.created_at
  };
}

module.exports = {
  getAllDraws,
  getDrawByDate,
  getLastDraw,
  addDraw,
  updateDraw,
  deleteDraw,
  getDrawsBetweenDates,
  getDrawsByYear
};
