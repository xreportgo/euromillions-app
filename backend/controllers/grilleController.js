/**
 * Contrôleur pour gérer les grilles utilisateur
 */
const grilleModel = require('../models/grilleModel');
const logger = require('../utils/logger'); // Adapter selon votre structure

/**
 * Récupère toutes les grilles de l'utilisateur
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
async function getGrilles(req, res) {
  try {
    const grilles = await grilleModel.getAllGrilles();
    res.json({ success: true, grilles });
  } catch (error) {
    logger.error(`Erreur lors de la récupération des grilles: ${error.message}`);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la récupération des grilles',
      error: error.message
    });
  }
}

/**
 * Ajoute une nouvelle grille
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
async function addGrille(req, res) {
  try {
    const grille = req.body;
    
    // Vérifier que les données nécessaires sont présentes
    if (!grille.numbers || !grille.stars || !grille.date) {
      return res.status(400).json({ 
        success: false, 
        message: 'Données de grille incomplètes'
      });
    }
    
    // Ajouter la grille
    const newGrille = await grilleModel.addGrille(grille);
    
    res.json({ success: true, grille: newGrille });
  } catch (error) {
    logger.error(`Erreur lors de l'ajout d'une grille: ${error.message}`);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de l\'ajout de la grille',
      error: error.message
    });
  }
}

/**
 * Supprime une grille par son ID
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
async function deleteGrille(req, res) {
  try {
    const grilleId = parseInt(req.params.id);
    
    if (isNaN(grilleId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'ID de grille invalide'
      });
    }
    
    const deleted = await grilleModel.deleteGrille(grilleId);
    
    if (deleted) {
      res.json({ success: true, message: 'Grille supprimée avec succès' });
    } else {
      res.status(404).json({ 
        success: false, 
        message: 'Grille non trouvée'
      });
    }
  } catch (error) {
    logger.error(`Erreur lors de la suppression de la grille: ${error.message}`);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la suppression de la grille',
      error: error.message
    });
  }
}

module.exports = {
  getGrilles,
  addGrille,
  deleteGrille
};
