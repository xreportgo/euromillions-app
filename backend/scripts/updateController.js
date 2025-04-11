/**
 * updateController.js - Contrôleur pour gérer les mises à jour des tirages EuroMillions
 * Ce fichier vérifie si une mise à jour des tirages est nécessaire en fonction 
 * des jours de tirage valides (mardi et vendredi) et de l'heure.
 */

const { format, isAfter, addDays, isBefore, isEqual, parseISO } = require('date-fns');
const { utcToZonedTime } = require('date-fns-tz');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const logger = require('../utils/logger'); // Adapter selon votre structure

// Chemin vers votre fichier de base de données SQLite
const dbPath = path.join(__dirname, '../db/euromillions.db'); // Adapter selon votre structure

/**
 * Vérifie si une date correspond à un jour de tirage (mardi ou vendredi)
 * @param {Date} date - La date à vérifier
 * @returns {boolean} - true si c'est un jour de tirage, false sinon
 */
function isEuroMillionsDrawDay(date) {
  const day = date.getDay();
  // 2 = Mardi, 5 = Vendredi
  return day === 2 || day === 5;
}

/**
 * Convertit une méthode SQLite basée sur les callbacks en Promise
 * @param {Function} method - La méthode SQLite à convertir
 * @returns {Function} - Une fonction qui retourne une Promise
 */
function promisify(method) {
  return function(...args) {
    return new Promise((resolve, reject) => {
      args.push(function(err, result) {
        if (err) reject(err);
        else resolve(result);
      });
      method.apply(this, args);
    });
  };
}

/**
 * Ouvre une connexion à la base de données SQLite
 * @returns {Promise<Object>} - L'objet de connexion à la base de données
 */
async function openDatabase() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE, (err) => {
      if (err) reject(err);
      else {
        // Ajouter des méthodes promisifiées
        db.getAsync = promisify(db.get.bind(db));
        db.allAsync = promisify(db.all.bind(db));
        db.runAsync = promisify(db.run.bind(db));
        resolve(db);
      }
    });
  });
}

/**
 * Récupère le dernier tirage depuis la base de données
 * @returns {Promise<Object|null>} - Le dernier tirage ou null si aucun
 */
async function getLatestDraw() {
  let db;
  try {
    db = await openDatabase();
    
    // Déterminer le nom de la table des tirages
    const tables = await db.allAsync(
      "SELECT name FROM sqlite_master WHERE type='table'"
    );
    
    let tableName = '';
    if (tables.some(t => t.name === 'tirages')) {
      tableName = 'tirages';
    } else if (tables.some(t => t.name === 'draws')) {
      tableName = 'draws';
    } else {
      logger.error("Aucune table de tirages ('tirages' ou 'draws') trouvée");
      return null;
    }
    
    // Récupérer le dernier tirage (en supposant qu'il y a une colonne 'date')
    const latestDraw = await db.getAsync(
      `SELECT * FROM ${tableName} ORDER BY date DESC LIMIT 1`
    );
    
    return latestDraw;
  } catch (error) {
    logger.error(`Erreur lors de la récupération du dernier tirage: ${error.message}`);
    return null;
  } finally {
    if (db) db.close();
  }
}

/**
 * Détermine les jours de tirage entre deux dates
 * @param {Date} startDate - Date de début (incluse)
 * @param {Date} endDate - Date de fin (incluse)
 * @returns {Array} - Tableau des dates de tirage
 */
function getDrawingDaysBetween(startDate, endDate) {
  const drawingDays = [];
  let currentDate = new Date(startDate);
  currentDate.setHours(0, 0, 0, 0);
  
  // Ajouter un jour à la date de début pour ne pas inclure le dernier tirage déjà en base
  currentDate = addDays(currentDate, 1);
  
  const lastDate = new Date(endDate);
  lastDate.setHours(0, 0, 0, 0);
  
  while (isBefore(currentDate, lastDate) || isEqual(currentDate, lastDate)) {
    // Vérifier si le jour courant est un mardi ou un vendredi
    if (isEuroMillionsDrawDay(currentDate)) {
      drawingDays.push(new Date(currentDate));
    }
    currentDate = addDays(currentDate, 1);
  }
  
  return drawingDays;
}

/**
 * Vérifie si une mise à jour des tirages EuroMillions est nécessaire
 * @returns {Promise<boolean>} - true si une mise à jour est nécessaire, false sinon
 */
async function shouldUpdateDraws() {
  try {
    // 1. Récupérer la date du dernier tirage dans la base de données
    const latestDraw = await getLatestDraw();
    const latestDrawDate = latestDraw ? new Date(latestDraw.date) : null;
    
    // 2. Obtenir la date/heure actuelle à Paris
    const parisTimeZone = 'Europe/Paris';
    const nowUtc = new Date();
    const nowParis = utcToZonedTime(nowUtc, parisTimeZone);
    
    logger.info(`Date/heure actuelle (Paris): ${format(nowParis, 'yyyy-MM-dd HH:mm:ss')}`);
    
    // Vérification - Aujourd'hui est-il un jour de tirage?
    const isTodayDrawingDay = isEuroMillionsDrawDay(nowParis);
    logger.info(`Aujourd'hui est ${isTodayDrawingDay ? 'un jour de tirage (mardi ou vendredi)' : 'un jour sans tirage'}`);
    
    // Si aujourd'hui n'est PAS un jour de tirage, on s'assure de ne pas essayer de récupérer le tirage d'aujourd'hui
    if (!isTodayDrawingDay) {
      logger.info("Aujourd'hui n'est pas un jour de tirage EuroMillions - aucun nouveau tirage ne sera ajouté pour aujourd'hui");
    }
    
    if (latestDrawDate) {
      logger.info(`Date du dernier tirage en base: ${format(latestDrawDate, 'yyyy-MM-dd')}`);
    } else {
      logger.info('Aucun tirage en base de données');
      // Si pas de tirage en base, on ne récupère un tirage que si aujourd'hui est un jour de tirage valide
      return isTodayDrawingDay;
    }
    
    // 3. Vérifier s'il y a eu des jours de tirage entre le dernier tirage en base et aujourd'hui
    const drawingDaysBetween = getDrawingDaysBetween(latestDrawDate, nowParis);
    
    if (drawingDaysBetween.length === 0) {
      logger.info("Aucun jour de tirage (mardi ou vendredi) entre le dernier tirage en base et aujourd'hui");
      return false;
    }
    
    logger.info(`Jours de tirage potentiels depuis le dernier en base: ${drawingDaysBetween.map(date => format(date, 'yyyy-MM-dd (EEEE)')).join(', ')}`);
    
    // 4. Si aujourd'hui est un jour de tirage, vérifier l'heure
    if (isTodayDrawingDay) {
      const drawTime = new Date(nowParis);
      drawTime.setHours(22, 30, 0, 0);  // 22:30:00
      
      const isAfterDrawTime = isAfter(nowParis, drawTime);
      if (!isAfterDrawTime) {
        logger.info("Aujourd'hui est un jour de tirage, mais l'heure actuelle est avant 22:30");
        
        // Vérifier s'il y a des tirages précédents à récupérer
        const previousDrawDays = drawingDaysBetween.filter(date => {
          const dateTime = new Date(date).setHours(0, 0, 0, 0);
          return dateTime < new Date(nowParis).setHours(0, 0, 0, 0);
        });
        
        if (previousDrawDays.length > 0) {
          logger.info("Il y a des tirages précédents valides à récupérer");
          return true;
        }
        
        return false;
      }
    }
    
    // 5. Toutes les conditions sont remplies pour lancer le scraping
    logger.info("Il y a des tirages valides à mettre à jour dans la base de données");
    return true;
    
  } catch (error) {
    logger.error(`Erreur lors de la vérification des conditions de mise à jour: ${error.message}`);
    return false;
  }
}

/**
 * Récupère les jours de tirage à mettre à jour
 * @returns {Promise<Array>} Tableau des dates à récupérer, vide si aucune mise à jour n'est nécessaire
 */
async function getDrawDaysToUpdate() {
  try {
    // Récupérer la date du dernier tirage dans la base de données
    const latestDraw = await getLatestDraw();
    const latestDrawDate = latestDraw ? new Date(latestDraw.date) : null;
    
    // Obtenir la date/heure actuelle à Paris
    const parisTimeZone = 'Europe/Paris';
    const nowUtc = new Date();
    const nowParis = utcToZonedTime(nowUtc, parisTimeZone);
    
    // Si pas de tirage en base, et aujourd'hui est un jour de tirage valide après 22:30
    if (!latestDrawDate) {
      const isTodayDrawingDay = isEuroMillionsDrawDay(nowParis);
      if (isTodayDrawingDay) {
        const drawTime = new Date(nowParis);
        drawTime.setHours(22, 30, 0, 0);
        
        if (isAfter(nowParis, drawTime)) {
          return [new Date(nowParis)];
        }
      }
      // Si ce n'est pas un jour de tirage ou avant 22:30, retourner un tableau vide
      return [];
    }
    
    // Identifier les jours de tirage à récupérer
    let drawingDaysToFetch = getDrawingDaysBetween(latestDrawDate, nowParis);
    
    // Vérifier si le tirage d'aujourd'hui doit être récupéré
    const today = new Date(nowParis);
    today.setHours(0, 0, 0, 0);
    
    const fetchToday = drawingDaysToFetch.some(date => 
      isEqual(new Date(date).setHours(0,0,0,0), today.getTime())
    );
    
    if (fetchToday) {
      // Vérifier si aujourd'hui est un jour de tirage valide
      if (!isEuroMillionsDrawDay(today)) {
        // Si ce n'est pas un jour de tirage valide, le retirer de la liste
        drawingDaysToFetch = drawingDaysToFetch.filter(date => 
          !isEqual(new Date(date).setHours(0,0,0,0), today.getTime())
        );
        logger.info("Aujourd'hui n'est pas un jour de tirage valide, ignoré.");
      } else {
        // C'est un jour de tirage, vérifier l'heure
        const drawTime = new Date(nowParis);
        drawTime.setHours(22, 30, 0, 0);  // 22:30:00
        
        if (!isAfter(nowParis, drawTime)) {
          // Si avant 22:30, retirer aujourd'hui de la liste
          drawingDaysToFetch = drawingDaysToFetch.filter(date => 
            !isEqual(new Date(date).setHours(0,0,0,0), today.getTime())
          );
          logger.info("Le tirage d'aujourd'hui sera ignoré car il est avant 22:30");
        }
      }
    }
    
    return drawingDaysToFetch;
  } catch (error) {
    logger.error(`Erreur lors de la récupération des jours de tirage à mettre à jour: ${error.message}`);
    return [];
  }
}

/**
 * Vérifie si un tirage existe déjà pour une date donnée
 * @param {Date} date - La date à vérifier
 * @returns {Promise<boolean>} - true si un tirage existe, false sinon
 */
async function drawExistsForDate(date) {
  let db;
  try {
    db = await openDatabase();
    
    // Déterminer le nom de la table des tirages
    const tables = await db.allAsync(
      "SELECT name FROM sqlite_master WHERE type='table'"
    );
    
    let tableName = '';
    if (tables.some(t => t.name === 'tirages')) {
      tableName = 'tirages';
    } else if (tables.some(t => t.name === 'draws')) {
      tableName = 'draws';
    } else {
      logger.error("Aucune table de tirages ('tirages' ou 'draws') trouvée");
      return false;
    }
    
    // Formater la date pour la recherche
    const dateString = format(date, 'yyyy-MM-dd');
    
    // Vérifier si un tirage existe pour cette date
    const draw = await db.getAsync(
      `SELECT * FROM ${tableName} WHERE date LIKE ?`, 
      [`${dateString}%`]
    );
    
    return !!draw;
  } catch (error) {
    logger.error(`Erreur lors de la vérification de l'existence d'un tirage: ${error.message}`);
    return false;
  } finally {
    if (db) db.close();
  }
}

/**
 * Supprime un tirage pour une date donnée
 * @param {Date} date - La date du tirage à supprimer
 * @returns {Promise<boolean>} - true si supprimé avec succès, false sinon
 */
async function deleteDrawForDate(date) {
  let db;
  try {
    db = await openDatabase();
    
    // Déterminer le nom de la table des tirages
    const tables = await db.allAsync(
      "SELECT name FROM sqlite_master WHERE type='table'"
    );
    
    let tableName = '';
    if (tables.some(t => t.name === 'tirages')) {
      tableName = 'tirages';
    } else if (tables.some(t => t.name === 'draws')) {
      tableName = 'draws';
    } else {
      logger.error("Aucune table de tirages ('tirages' ou 'draws') trouvée");
      return false;
    }
    
    // Formater la date pour la recherche
    const dateString = format(date, 'yyyy-MM-dd');
    
    // Supprimer le tirage
    const result = await db.runAsync(
      `DELETE FROM ${tableName} WHERE date LIKE ?`, 
      [`${dateString}%`]
    );
    
    return result.changes > 0;
  } catch (error) {
    logger.error(`Erreur lors de la suppression du tirage: ${error.message}`);
    return false;
  } finally {
    if (db) db.close();
  }
}

/**
 * Supprime tous les tirages pour les jours non valides (ni mardi ni vendredi)
 * @returns {Promise<number>} - Nombre de tirages supprimés
 */
async function cleanInvalidDrawDays() {
  let db;
  try {
    db = await openDatabase();
    
    // Déterminer le nom de la table des tirages
    const tables = await db.allAsync(
      "SELECT name FROM sqlite_master WHERE type='table'"
    );
    
    let tableName = '';
    if (tables.some(t => t.name === 'tirages')) {
      tableName = 'tirages';
    } else if (tables.some(t => t.name === 'draws')) {
      tableName = 'draws';
    } else {
      logger.error("Aucune table de tirages ('tirages' ou 'draws') trouvée");
      return 0;
    }
    
    // Récupérer tous les tirages
    const draws = await db.allAsync(`SELECT * FROM ${tableName}`);
    
    let deletedCount = 0;
    
    // Vérifier chaque tirage
    for (const draw of draws) {
      const drawDate = new Date(draw.date);
      
      // Si ce n'est pas un jour de tirage valide
      if (!isEuroMillionsDrawDay(drawDate)) {
        logger.warn(`Tirage invalide trouvé pour le ${format(drawDate, 'yyyy-MM-dd')} (${drawDate.getDay() === 0 ? 'dimanche' : drawDate.getDay() === 1 ? 'lundi' : drawDate.getDay() === 3 ? 'mercredi' : drawDate.getDay() === 4 ? 'jeudi' : 'samedi'})`);
        
        // Supprimer ce tirage
        await db.runAsync(
          `DELETE FROM ${tableName} WHERE id = ?`, 
          [draw.id]
        );
        
        deletedCount++;
      }
    }
    
    return deletedCount;
  } catch (error) {
    logger.error(`Erreur lors du nettoyage des tirages invalides: ${error.message}`);
    return 0;
  } finally {
    if (db) db.close();
  }
}

module.exports = {
  isEuroMillionsDrawDay,
  getDrawingDaysBetween,
  shouldUpdateDraws,
  getDrawDaysToUpdate,
  drawExistsForDate,
  deleteDrawForDate,
  cleanInvalidDrawDays
};
