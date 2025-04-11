// backend/controllers/drawController.js - Correction

const AppError = require('../utils/AppError');
const logger = require('../utils/logger');
const dbService = require('../services/dbService');

/**
 * Récupère tous les tirages avec pagination
 */
exports.getAllDraws = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    
    const db = await dbService.getDb();
    
    // Récupérer le nombre total de tirages
    const countResult = await db.get("SELECT COUNT(*) as total FROM draws");
    const total = countResult.total;
    
    // Récupérer les tirages avec pagination
    const draws = await db.all(
      "SELECT * FROM draws ORDER BY date(date) DESC LIMIT ? OFFSET ?", 
      [limit, offset]
    );
    
    // Calculer la pagination
    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;
    
    res.json({
      data: draws.map(draw => ({
        id: draw.id,
        date: draw.date,
        numbers: draw.numbers.split(',').map(num => parseInt(num.trim(), 10)),
        stars: draw.stars.split(',').map(star => parseInt(star.trim(), 10)),
        jackpot: draw.jackpot || '',
        winners: draw.winners || '0'
      })),
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNext,
        hasPrev
      }
    });
  } catch (error) {
    logger.error('Erreur lors de la récupération des tirages:', error);
    return next(new AppError('Erreur lors de la récupération des tirages', 500));
  }
};

/**
 * Récupère le dernier tirage
 */
exports.getLatestDraw = async (req, res, next) => {
  try {
    const db = await dbService.getDb();
    
    const draw = await db.get("SELECT * FROM draws ORDER BY date(date) DESC LIMIT 1");
    
    if (!draw) {
      return next(new AppError('Aucun tirage trouvé', 404));
    }
    
    res.json({
      id: draw.id,
      date: draw.date,
      numbers: draw.numbers.split(',').map(num => parseInt(num.trim(), 10)),
      stars: draw.stars.split(',').map(star => parseInt(star.trim(), 10)),
      jackpot: draw.jackpot || '',
      winners: draw.winners || '0'
    });
  } catch (error) {
    logger.error('Erreur lors de la récupération du dernier tirage:', error);
    return next(new AppError('Erreur lors de la récupération du dernier tirage', 500));
  }
};

/**
 * Récupère un tirage par son ID
 */
exports.getDrawById = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return next(new AppError('ID invalide', 400));
    }
    
    const db = await dbService.getDb();
    const draw = await db.get("SELECT * FROM draws WHERE id = ?", [id]);
    
    if (!draw) {
      return next(new AppError(`Aucun tirage trouvé avec l'ID ${id}`, 404));
    }
    
    res.json({
      id: draw.id,
      date: draw.date,
      numbers: draw.numbers.split(',').map(num => parseInt(num.trim(), 10)),
      stars: draw.stars.split(',').map(star => parseInt(star.trim(), 10)),
      jackpot: draw.jackpot || '',
      winners: draw.winners || '0'
    });
  } catch (error) {
    logger.error(`Erreur lors de la récupération du tirage ${req.params.id}:`, error);
    return next(new AppError('Erreur lors de la récupération du tirage', 500));
  }
};

/**
 * Récupère un tirage par sa date
 */
exports.getDrawByDate = async (req, res, next) => {
  try {
    const date = req.params.date;
    
    // Vérification du format de date (YYYY-MM-DD)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return next(new AppError('Format de date invalide. Utilisez YYYY-MM-DD', 400));
    }
    
    const db = await dbService.getDb();
    const draw = await db.get("SELECT * FROM draws WHERE date = ?", [date]);
    
    if (!draw) {
      return next(new AppError(`Aucun tirage trouvé pour la date ${date}`, 404));
    }
    
    res.json({
      id: draw.id,
      date: draw.date,
      numbers: draw.numbers.split(',').map(num => parseInt(num.trim(), 10)),
      stars: draw.stars.split(',').map(star => parseInt(star.trim(), 10)),
      jackpot: draw.jackpot || '',
      winners: draw.winners || '0'
    });
  } catch (error) {
    logger.error(`Erreur lors de la récupération du tirage pour la date ${req.params.date}:`, error);
    return next(new AppError('Erreur lors de la récupération du tirage', 500));
  }
};
