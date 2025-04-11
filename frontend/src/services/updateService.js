// src/services/updateService.js
import axios from 'axios';

// Configuration pour l'API
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

/**
 * Vérifie si une mise à jour de l'application est disponible
 * @returns {Promise<boolean>} true si une mise à jour est disponible, false sinon
 */
export const checkForUpdates = async () => {
  try {
    // En environnement de production, vérifier avec le serveur
    if (process.env.NODE_ENV === 'production') {
      const response = await axios.get(`${API_BASE_URL}/version`);
      const currentVersion = process.env.REACT_APP_VERSION || '1.0.0';
      return response.data.version !== currentVersion;
    }
    
    // En développement, simuler qu'il n'y a pas de mise à jour
    return false;
  } catch (error) {
    console.error('Erreur lors de la vérification des mises à jour:', error);
    // En cas d'erreur, on considère qu'il n'y a pas de mise à jour
    return false;
  }
};

/**
 * Récupère les notes de version de la dernière mise à jour
 * @returns {Promise<Object>} Les informations de la dernière version
 */
export const getVersionInfo = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/version/info`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des informations de version:', error);
    throw new Error('Impossible de récupérer les informations de version');
  }
};

/**
 * Applique les mises à jour disponibles (rafraîchit la page)
 * @returns {void}
 */
export const applyUpdates = () => {
  // Rafraîchir la page pour charger la nouvelle version
  window.location.reload(true);
};

export default {
  checkForUpdates,
  getVersionInfo,
  applyUpdates
};
