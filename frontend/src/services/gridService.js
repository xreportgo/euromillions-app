// src/services/gridService.js
import axios from 'axios';

// Configuration pour l'API
const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

// Clé de stockage local pour les grilles
const STORED_GRIDS_KEY = 'euromillions_saved_grids';

/**
 * Récupère toutes les grilles sauvegardées
 * @returns {Promise<Array>} Liste des grilles sauvegardées
 */
export const getStoredGrids = async () => {
  try {
    // Essayer d'abord de récupérer depuis l'API
    try {
      const response = await axios.get(`${API_BASE_URL}/grids`);
      console.log('Grilles récupérées depuis l\'API:', response.data);
      return response.data;
    } catch (apiError) {
      console.warn('Impossible de récupérer les grilles depuis l\'API, fallback sur le stockage local:', apiError);
      // En cas d'erreur API, fallback sur le stockage local
      const storedGrids = localStorage.getItem(STORED_GRIDS_KEY);
      return storedGrids ? JSON.parse(storedGrids) : [];
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des grilles:', error);
    // En cas d'erreur générale, renvoyer un tableau vide
    return [];
  }
};

/**
 * Sauvegarde une nouvelle grille
 * @param {Object} grid La grille à sauvegarder
 * @returns {Promise<Object>} La grille sauvegardée avec son ID
 */
export const saveGrid = async (grid) => {
  try {
    // Essayer d'abord de sauvegarder via l'API
    try {
      const response = await axios.post(`${API_BASE_URL}/grids`, grid);
      console.log('Grille sauvegardée via l\'API:', response.data);
      return response.data;
    } catch (apiError) {
      console.warn('Impossible de sauvegarder la grille via l\'API, fallback sur le stockage local:', apiError);
      
      // En cas d'erreur API, fallback sur le stockage local
      const storedGrids = await getStoredGrids();
      
      // Créer une nouvelle grille avec un ID unique
      const newGrid = {
        ...grid,
        id: Date.now().toString(),
        createdAt: new Date().toISOString()
      };
      
      // Ajouter la nouvelle grille à la liste
      const updatedGrids = [...storedGrids, newGrid];
      
      // Sauvegarder la liste mise à jour
      localStorage.setItem(STORED_GRIDS_KEY, JSON.stringify(updatedGrids));
      
      console.log('Grille sauvegardée localement:', newGrid);
      return newGrid;
    }
  } catch (error) {
    console.error('Erreur lors de la sauvegarde de la grille:', error);
    throw new Error('Impossible de sauvegarder la grille');
  }
};

/**
 * Récupère une grille par son ID
 * @param {string} id L'ID de la grille à récupérer
 * @returns {Promise<Object|null>} La grille trouvée ou null
 */
export const getGridById = async (id) => {
  try {
    // Essayer d'abord de récupérer depuis l'API
    try {
      const response = await axios.get(`${API_BASE_URL}/grids/${id}`);
      return response.data;
    } catch (apiError) {
      console.warn(`Impossible de récupérer la grille ${id} depuis l\'API, fallback sur le stockage local:`, apiError);
      
      // En cas d'erreur API, fallback sur le stockage local
      const storedGrids = await getStoredGrids();
      return storedGrids.find(grid => grid.id === id) || null;
    }
  } catch (error) {
    console.error(`Erreur lors de la récupération de la grille ${id}:`, error);
    return null;
  }
};

/**
 * Supprime une grille par son ID
 * @param {string} id L'ID de la grille à supprimer
 * @returns {Promise<boolean>} True si la suppression a réussi
 */
export const deleteGrid = async (id) => {
  try {
    // Essayer d'abord de supprimer via l'API
    try {
      await axios.delete(`${API_BASE_URL}/grids/${id}`);
      return true;
    } catch (apiError) {
      console.warn(`Impossible de supprimer la grille ${id} via l\'API, fallback sur le stockage local:`, apiError);
      
      // En cas d'erreur API, fallback sur le stockage local
      const storedGrids = await getStoredGrids();
      const updatedGrids = storedGrids.filter(grid => grid.id !== id);
      
      if (updatedGrids.length === storedGrids.length) {
        return false; // Grille non trouvée
      }
      
      localStorage.setItem(STORED_GRIDS_KEY, JSON.stringify(updatedGrids));
      return true;
    }
  } catch (error) {
    console.error(`Erreur lors de la suppression de la grille ${id}:`, error);
    throw new Error('Impossible de supprimer la grille');
  }
};

/**
 * Met à jour une grille existante
 * @param {string} id L'ID de la grille à mettre à jour
 * @param {Object} updatedGrid Les nouvelles données de la grille
 * @returns {Promise<Object>} La grille mise à jour
 */
export const updateGrid = async (id, updatedGrid) => {
  try {
    // Essayer d'abord de mettre à jour via l'API
    try {
      const response = await axios.put(`${API_BASE_URL}/grids/${id}`, updatedGrid);
      return response.data;
    } catch (apiError) {
      console.warn(`Impossible de mettre à jour la grille ${id} via l\'API, fallback sur le stockage local:`, apiError);
      
      // En cas d'erreur API, fallback sur le stockage local
      const storedGrids = await getStoredGrids();
      const existingGridIndex = storedGrids.findIndex(grid => grid.id === id);
      
      if (existingGridIndex === -1) {
        throw new Error(`Grille avec l'ID ${id} non trouvée`);
      }
      
      const gridToUpdate = {
        ...storedGrids[existingGridIndex],
        ...updatedGrid,
        updatedAt: new Date().toISOString()
      };
      
      const updatedGrids = [...storedGrids];
      updatedGrids[existingGridIndex] = gridToUpdate;
      
      localStorage.setItem(STORED_GRIDS_KEY, JSON.stringify(updatedGrids));
      
      return gridToUpdate;
    }
  } catch (error) {
    console.error(`Erreur lors de la mise à jour de la grille ${id}:`, error);
    throw new Error('Impossible de mettre à jour la grille');
  }
};

/**
 * Vérifie une grille par rapport au dernier tirage
 * @param {Object} grid La grille à vérifier
 * @param {Object} draw Le tirage à comparer
 * @returns {Object} Résultats de la vérification
 */
export const checkGrid = (grid, draw) => {
  if (!grid || !draw || !grid.numbers || !grid.stars || !draw.numbers || !draw.stars) {
    return {
      matchedNumbers: [],
      matchedStars: [],
      totalMatched: 0,
      prize: 0
    };
  }
  
  const matchedNumbers = grid.numbers.filter(number => 
    draw.numbers.includes(number)
  );
  
  const matchedStars = grid.stars.filter(star =>
    draw.stars.includes(star)
  );
  
  const totalMatched = matchedNumbers.length + matchedStars.length;
  
  // Calcul simplifié des gains (à adapter selon les règles réelles)
  let prize = 0;
  if (matchedNumbers.length === 5 && matchedStars.length === 2) {
    prize = 'Jackpot';
  } else if (matchedNumbers.length === 5 && matchedStars.length === 1) {
    prize = '500 000 €';
  } else if (matchedNumbers.length === 5) {
    prize = '50 000 €';
  } else if (matchedNumbers.length === 4 && matchedStars.length === 2) {
    prize = '5 000 €';
  } else if (matchedNumbers.length === 4 && matchedStars.length === 1) {
    prize = '500 €';
  } else if (matchedNumbers.length === 3 && matchedStars.length === 2) {
    prize = '100 €';
  } else if (matchedNumbers.length === 4) {
    prize = '50 €';
  } else if (matchedNumbers.length === 2 && matchedStars.length === 2) {
    prize = '20 €';
  } else if (matchedNumbers.length === 3 && matchedStars.length === 1) {
    prize = '15 €';
  } else if (matchedNumbers.length === 3) {
    prize = '10 €';
  } else if (matchedNumbers.length === 1 && matchedStars.length === 2) {
    prize = '10 €';
  } else if (matchedNumbers.length === 2 && matchedStars.length === 1) {
    prize = '8 €';
  } else if (matchedNumbers.length === 2) {
    prize = '4 €';
  }
  
  return {
    matchedNumbers,
    matchedStars,
    totalMatched,
    prize
  };
};

export default {
  getStoredGrids,
  saveGrid,
  getGridById,
  deleteGrid,
  updateGrid,
  checkGrid
};
