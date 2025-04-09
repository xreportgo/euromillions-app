// src/services/gridService.js
import apiClient from './apiService';

export const generateGrids = async (params) => {
  try {
    const response = await apiClient.post('/grids/generate', params);
    
    // Vérifier que les données ont le format attendu
    if (!response || !Array.isArray(response)) {
      console.error('Format de réponse inattendu:', response);
      // Retourner un tableau vide en cas d'erreur
      return [];
    }
    
    // Vérifier chaque grille
    const validatedGrids = response.map(grid => {
      // Si la grille n'a pas de numéros ou d'étoiles, ajouter des valeurs par défaut
      if (!grid.numbers) grid.numbers = [];
      if (!grid.stars) grid.stars = [];
      return grid;
    });
    
    return validatedGrids;
  } catch (error) {
    console.error('Erreur lors de la génération des grilles:', error);
    throw error;
  }
};

export const getAllGrids = async () => {
  try {
    return await apiClient.get('/grids');
  } catch (error) {
    console.error('Erreur lors de la récupération des grilles:', error);
    throw error;
  }
};

export const getGridById = async (id) => {
  try {
    return await apiClient.get(`/grids/${id}`);
  } catch (error) {
    console.error(`Erreur lors de la récupération de la grille ${id}:`, error);
    throw error;
  }
};

export const saveGrid = async (grid) => {
  try {
    return await apiClient.post('/grids', grid);
  } catch (error) {
    console.error('Erreur lors de la sauvegarde de la grille:', error);
    throw error;
  }
};

export const updateGrid = async (id, data) => {
  try {
    return await apiClient.put(`/grids/${id}`, data);
  } catch (error) {
    console.error(`Erreur lors de la mise à jour de la grille ${id}:`, error);
    throw error;
  }
};

export const deleteGrid = async (id) => {
  try {
    return await apiClient.delete(`/grids/${id}`);
  } catch (error) {
    console.error(`Erreur lors de la suppression de la grille ${id}:`, error);
    throw error;
  }
};

export const exportGrids = async (format = 'csv', ids = null) => {
  try {
    let url = `/grids/export?format=${format}`;
    if (ids && ids.length > 0) {
      url += `&ids=${ids.join(',')}`;
    }
    return await apiClient.get(url, { responseType: 'blob' });
  } catch (error) {
    console.error('Erreur lors de l\'export des grilles:', error);
    throw error;
  }
};

export const printGrid = (grid) => {
  // Créer une nouvelle fenêtre pour l'impression
  const printWindow = window.open('', '_blank');
  
  // Appliquer un style pour l'impression
  printWindow.document.write(`
    <html>
      <head>
        <title>Grille Euromillions</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          .grid-container { border: 1px solid #ccc; padding: 15px; max-width: 400px; margin: 0 auto; }
          .grid-name { font-size: 18px; font-weight: bold; margin-bottom: 10px; }
          .numbers-container { display: flex; justify-content: center; margin-bottom: 10px; }
          .stars-container { display: flex; justify-content: center; }
          .ball { display: inline-flex; align-items: center; justify-content: center; 
                 width: 40px; height: 40px; border-radius: 50%; margin: 0 5px; 
                 font-weight: bold; color: white; }
          .number { background-color: #004b9f; }
          .star { background-color: #fc0; color: #333; }
          .footer { margin-top: 15px; font-size: 12px; text-align: center; color: #666; }
        </style>
      </head>
      <body>
        <div class="grid-container">
          <div class="grid-name">${grid.name || 'Grille Euromillions'}</div>
          <div class="numbers-container">
            ${grid.numbers.map(num => `<div class="ball number">${num}</div>`).join('')}
          </div>
          <div class="stars-container">
            ${grid.stars.map(star => `<div class="ball star">${star}</div>`).join('')}
          </div>
          <div class="footer">Imprimé le ${new Date().toLocaleDateString()}</div>
        </div>
      </body>
    </html>
  `);
  
  // Fermer le document et lancer l'impression
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
  }, 250);
};
