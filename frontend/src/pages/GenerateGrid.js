import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

const GenerateGrid = () => {
  const { t } = useTranslation();
  const [generatedGrids, setGeneratedGrids] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [count, setCount] = useState(1);
  const [model, setModel] = useState('random');

  // Fonction simplifiée pour générer des grilles
  const generateSimpleGrids = () => {
    setLoading(true);
    setError(null);
    
    try {
      // Créer un tableau de grilles
      const newGrids = [];
      
      // Générer le nombre de grilles demandé
      for (let i = 0; i < count; i++) {
        // Générer 5 numéros aléatoires entre 1 et 50
        const numbers = [];
        while (numbers.length < 5) {
          const num = Math.floor(Math.random() * 50) + 1;
          if (!numbers.includes(num)) {
            numbers.push(num);
          }
        }
        numbers.sort((a, b) => a - b);
        
        // Générer 2 étoiles aléatoires entre 1 et 12
        const stars = [];
        while (stars.length < 2) {
          const star = Math.floor(Math.random() * 12) + 1;
          if (!stars.includes(star)) {
            stars.push(star);
          }
        }
        stars.sort((a, b) => a - b);
        
        // Créer la grille
        newGrids.push({
          id: `grid-${Date.now()}-${i}`,
          numbers: numbers,
          stars: stars,
          method: model
        });
      }
      
      // Mettre à jour l'état
      setGeneratedGrids(newGrids);
    } catch (e) {
      console.error('Error generating grids:', e);
      setError(e.message || 'Une erreur est survenue lors de la génération des grilles.');
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour imprimer une grille
  const printGrid = (grid) => {
    const printWindow = window.open('', '_blank');
    
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
            <div class="grid-name">Grille Euromillions</div>
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
    
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">{t('generateGrids') || 'Générer des grilles'}</h1>
      
      {/* Panneau de génération simple */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">{t('gridGenerationOptions') || 'Options de génération'}</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('generationModel') || 'Modèle de génération'}
            </label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="random">{t('randomModel') || 'Aléatoire'}</option>
              <option value="frequency">{t('frequencyModel') || 'Fréquence'}</option>
              <option value="hot_numbers">{t('hotNumbersModel') || 'Numéros chauds'}</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('numberOfGrids') || 'Nombre de grilles'}
            </label>
            <input
              type="number"
              min="1"
              max="10"
              value={count}
              onChange={(e) => setCount(parseInt(e.target.value) || 1)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
        </div>
        
        <div className="mt-6">
          <button
            onClick={generateSimpleGrids}
            disabled={loading}
            className="w-full md:w-auto px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {loading ? (t('generating') || 'Génération en cours...') : (t('generateGrids') || 'Générer des grilles')}
          </button>
        </div>
      </div>
      
      {/* Message d'erreur */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <p>{error}</p>
        </div>
      )}
      
      {/* Affichage des grilles */}
      {generatedGrids.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">{t('generatedGrids') || 'Grilles générées'}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {generatedGrids.map((grid) => (
              <div key={grid.id} className="border rounded-lg shadow-sm p-4 bg-white dark:bg-gray-800 dark:border-gray-700">
                <h3 className="font-medium text-lg mb-4">{t('generatedGrid') || 'Grille générée'}</h3>
                
                <div className="flex justify-center my-4">
                  {grid.numbers.map((number) => (
                    <div 
                      key={`number-${number}-${grid.id}`} 
                      className="flex items-center justify-center w-10 h-10 mx-1 rounded-full bg-blue-600 text-white font-bold"
                    >
                      {number}
                    </div>
                  ))}
                  
                  <span className="mx-2 self-center">+</span>
                  
                  {grid.stars.map((star) => (
                    <div 
                      key={`star-${star}-${grid.id}`} 
                      className="flex items-center justify-center w-10 h-10 mx-1 rounded-full bg-yellow-400 text-yellow-900 font-bold"
                    >
                      {star}
                    </div>
                  ))}
                </div>
                
                <div className="flex justify-between mt-4">
                  <button
                    onClick={() => alert('Fonctionnalité non disponible dans cette version simplifiée')}
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    {t('save') || 'Sauvegarder'}
                  </button>
                  
                  <button
                    onClick={() => printGrid(grid)}
                    className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                  >
                    {t('print') || 'Imprimer'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GenerateGrid;
