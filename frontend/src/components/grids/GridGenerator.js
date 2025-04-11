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

        // Ajouter la grille au tableau
        newGrids.push({
          id: Date.now() + i,
          numbers: numbers,
          stars: stars,
          method: 'random',
          confidence: Math.floor(Math.random() * 100)
        });
      }

      // Mettre à jour l'état
      setGeneratedGrids(newGrids);
    } catch (err) {
      console.error('Erreur lors de la génération de la grille:', err);
      setError(t('generateError') || 'Erreur lors de la génération de la grille');
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour générer une grille "intelligente" basée sur des statistiques
  const generateSmartGrid = async () => {
    setLoading(true);
    setError(null);

    try {
      // Simuler une requête API pour obtenir des statistiques
      // Dans une application réelle, vous feriez un appel API ici
      const mockApiCall = () => {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              hotNumbers: [3, 5, 17, 27, 33, 44, 50],
              coldNumbers: [1, 7, 13, 19, 25, 38, 46],
              hotStars: [2, 3, 8, 9],
              coldStars: [1, 5, 10, 12]
            });
          }, 500);
        });
      };

      // Obtenir les statistiques
      const stats = await mockApiCall();

      // Créer un tableau de grilles
      const newGrids = [];

      // Générer le nombre de grilles demandé
      for (let i = 0; i < count; i++) {
        let selectedNumbers = [];
        let selectedStars = [];

        // Stratégie basée sur le modèle sélectionné
        if (model === 'hot') {
          // Choisir parmi les numéros chauds (plus fréquents)
          while (selectedNumbers.length < 5) {
            const randomIndex = Math.floor(Math.random() * stats.hotNumbers.length);
            const num = stats.hotNumbers[randomIndex];
            if (!selectedNumbers.includes(num)) {
              selectedNumbers.push(num);
            }
          }

          // Choisir parmi les étoiles chaudes
          while (selectedStars.length < 2) {
            const randomIndex = Math.floor(Math.random() * stats.hotStars.length);
            const star = stats.hotStars[randomIndex];
            if (!selectedStars.includes(star)) {
              selectedStars.push(star);
            }
          }
        } else if (model === 'cold') {
          // Choisir parmi les numéros froids (moins fréquents)
          while (selectedNumbers.length < 5) {
            const randomIndex = Math.floor(Math.random() * stats.coldNumbers.length);
            const num = stats.coldNumbers[randomIndex];
            if (!selectedNumbers.includes(num)) {
              selectedNumbers.push(num);
            }
          }

          // Choisir parmi les étoiles froides
          while (selectedStars.length < 2) {
            const randomIndex = Math.floor(Math.random() * stats.coldStars.length);
            const star = stats.coldStars[randomIndex];
            if (!selectedStars.includes(star)) {
              selectedStars.push(star);
            }
          }
        } else if (model === 'balanced') {
          // Mélange de numéros chauds et froids
          const allNumbers = [...stats.hotNumbers, ...stats.coldNumbers];
          while (selectedNumbers.length < 5) {
            const randomIndex = Math.floor(Math.random() * allNumbers.length);
            const num = allNumbers[randomIndex];
            if (!selectedNumbers.includes(num)) {
              selectedNumbers.push(num);
            }
          }

          // Mélange d'étoiles chaudes et froides
          const allStars = [...stats.hotStars, ...stats.coldStars];
          while (selectedStars.length < 2) {
            const randomIndex = Math.floor(Math.random() * allStars.length);
            const star = allStars[randomIndex];
            if (!selectedStars.includes(star)) {
              selectedStars.push(star);
            }
          }
        }

        // Trier les numéros et les étoiles
        selectedNumbers.sort((a, b) => a - b);
        selectedStars.sort((a, b) => a - b);

        // Ajouter la grille au tableau
        newGrids.push({
          id: Date.now() + i,
          numbers: selectedNumbers,
          stars: selectedStars,
          method: model,
          confidence: Math.floor(Math.random() * 40) + 60 // Entre 60 et 100
        });
      }

      // Mettre à jour l'état
      setGeneratedGrids(newGrids);
    } catch (err) {
      console.error('Erreur lors de la génération de la grille:', err);
      setError(t('generateError') || 'Erreur lors de la génération de la grille');
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour générer des grilles selon le modèle choisi
  const generateGrids = () => {
    if (model === 'random') {
      generateSimpleGrids();
    } else {
      generateSmartGrid();
    }
  };

  // Fonction pour sauvegarder une grille
  const saveGrid = (grid) => {
    // Dans une application réelle, vous sauvegarderiez la grille dans une base de données
    // Pour l'instant, nous allons juste afficher un message
    alert(t('gridSaved') || 'Grille sauvegardée!');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">{t('generateGridTitle') || 'Générer une grille'}</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">{t('generateParameters') || 'Paramètres de génération'}</h2>
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">{t('numberOfGrids') || 'Nombre de grilles:'}</label>
          <input
            type="number"
            min="1"
            max="10"
            value={count}
            onChange={(e) => setCount(parseInt(e.target.value) || 1)}
            className="border rounded px-3 py-2 w-full max-w-xs"
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">{t('generationMethod') || 'Méthode de génération:'}</label>
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="border rounded px-3 py-2 w-full max-w-xs"
          >
            <option value="random">{t('random') || 'Aléatoire'}</option>
            <option value="hot">{t('hot') || 'Numéros fréquents'}</option>
            <option value="cold">{t('cold') || 'Numéros rares'}</option>
            <option value="balanced">{t('balanced') || 'Équilibré'}</option>
          </select>
        </div>
        
        <button
          onClick={generateGrids}
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded"
        >
          {loading 
            ? (t('generating') || 'Génération en cours...') 
            : (t('generateButton') || 'Générer')}
        </button>
        
        {error && (
          <div className="text-red-500 mt-2">
            {error}
          </div>
        )}
      </div>
      
      {generatedGrids && generatedGrids.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">{t('generatedGrids') || 'Grilles générées'}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {generatedGrids.map((grid) => (
              <div key={grid.id} className="border rounded-lg p-4">
                <div className="flex flex-wrap gap-2 mb-2">
                  <div className="font-semibold mr-2">{t('numbers') || 'Numéros:'}:</div>
                  {grid.numbers.map((num) => (
                    <span key={`num-${grid.id}-${num}`} className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center">
                      {num}
                    </span>
                  ))}
                </div>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  <div className="font-semibold mr-2">{t('stars') || 'Étoiles:'}:</div>
                  {grid.stars.map((star) => (
                    <span key={`star-${grid.id}-${star}`} className="bg-yellow-500 text-white rounded-full w-8 h-8 flex items-center justify-center">
                      {star}
                    </span>
                  ))}
                </div>
                
                <div className="mb-2">
                  <span className="font-semibold">{t('method') || 'Méthode:'}:</span> {grid.method}
                </div>
                
                <div className="mb-4">
                  <span className="font-semibold">{t('confidence') || 'Indice de confiance:'}:</span> {grid.confidence}%
                </div>
                
                <button
                  onClick={() => saveGrid(grid)}
                  className="bg-green-500 hover:bg-green-600 text-white font-semibold py-1 px-3 rounded text-sm"
                >
                  {t('saveGrid') || 'Sauvegarder'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GenerateGrid;
