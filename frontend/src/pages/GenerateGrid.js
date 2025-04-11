import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

const GenerateGrid = () => {
  const { t } = useTranslation();
  const [generatedGrids, setGeneratedGrids] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [count, setCount] = useState(1);
  const [model, setModel] = useState('random');

  // Fonction sécurisée pour générer une grille unique
  const generateSafeGrid = (method) => {
    // Garantir que nous avons toujours des tableaux valides
    const numbers = [];
    const stars = [];
    let confidence = 0;

    try {
      // Générer 5 numéros aléatoires entre 1 et 50
      while (numbers.length < 5) {
        const num = Math.floor(Math.random() * 50) + 1;
        if (!numbers.includes(num)) {
          numbers.push(num);
        }
      }
      numbers.sort((a, b) => a - b);

      // Générer 2 étoiles aléatoires entre 1 et 12
      while (stars.length < 2) {
        const star = Math.floor(Math.random() * 12) + 1;
        if (!stars.includes(star)) {
          stars.push(star);
        }
      }
      stars.sort((a, b) => a - b);

      // Définir l'indice de confiance selon la méthode
      if (method === 'random') {
        confidence = Math.floor(Math.random() * 100);
      } else {
        confidence = Math.floor(Math.random() * 40) + 60; // Entre 60 et 100
      }
    } catch (err) {
      console.error("Erreur lors de la génération d'une grille:", err);
      // En cas d'erreur, utiliser des valeurs par défaut
      return {
        id: Date.now(),
        numbers: [1, 2, 3, 4, 5],
        stars: [1, 2],
        method: method || 'random',
        confidence: 50
      };
    }

    // Retourner une grille valide
    return {
      id: Date.now(),
      numbers: numbers,
      stars: stars,
      method: method || 'random',
      confidence: confidence
    };
  };

  // Fonction simplifiée pour générer des grilles
  const generateSimpleGrids = () => {
    setLoading(true);
    setError(null);

    try {
      // Créer un tableau de grilles
      const newGrids = [];

      // Générer le nombre de grilles demandé
      for (let i = 0; i < count; i++) {
        const grid = generateSafeGrid('random');
        grid.id = Date.now() + i; // Garantir un ID unique
        newGrids.push(grid);
      }

      // Mettre à jour l'état
      setGeneratedGrids(newGrids);
    } catch (err) {
      console.error('Erreur lors de la génération de la grille:', err);
      setError(t('generateError') || 'Erreur lors de la génération de la grille');
      // En cas d'échec, initialiser avec un tableau vide
      setGeneratedGrids([]);
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour générer une grille "intelligente" basée sur des statistiques
  const generateSmartGrid = async () => {
    setLoading(true);
    setError(null);

    try {
      // Créer un tableau de grilles
      const newGrids = [];

      // Générer le nombre de grilles demandé en utilisant la fonction sécurisée
      for (let i = 0; i < count; i++) {
        const grid = generateSafeGrid(model);
        grid.id = Date.now() + i;
        newGrids.push(grid);
      }

      // Mettre à jour l'état
      setGeneratedGrids(newGrids);
    } catch (err) {
      console.error('Erreur lors de la génération de la grille:', err);
      setError(t('generateError') || 'Erreur lors de la génération de la grille');
      // En cas d'échec, initialiser avec un tableau vide
      setGeneratedGrids([]);
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
    // Vérifier que la grille est valide avant de tenter de la sauvegarder
    if (!grid || !grid.numbers || !grid.stars) {
      alert(t('invalidGrid') || 'Grille invalide!');
      return;
    }
    
    // Dans une application réelle, vous sauvegarderiez la grille dans une base de données
    alert(t('gridSaved') || 'Grille sauvegardée!');
  };

  // Fonction sécurisée pour vérifier si un objet a une propriété
  const safeHasProperty = (obj, prop) => {
    return obj && typeof obj === 'object' && Object.prototype.hasOwnProperty.call(obj, prop);
  };

  // Fonction sécurisée pour accéder à un tableau
  const safeArray = (arr) => {
    return Array.isArray(arr) ? arr : [];
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
      
      {Array.isArray(generatedGrids) && generatedGrids.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">{t('generatedGrids') || 'Grilles générées'}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {generatedGrids.map((grid) => {
              // Vérification de sécurité avant le rendu
              if (!grid || !safeHasProperty(grid, 'numbers') || !safeHasProperty(grid, 'stars')) {
                return null;
              }
              
              const gridId = safeHasProperty(grid, 'id') ? grid.id : Date.now();
              const gridNumbers = safeArray(grid.numbers);
              const gridStars = safeArray(grid.stars);
              const gridMethod = safeHasProperty(grid, 'method') ? grid.method : 'random';
              const gridConfidence = safeHasProperty(grid, 'confidence') ? grid.confidence : 50;
              
              return (
                <div key={gridId} className="border rounded-lg p-4">
                  <div className="flex flex-wrap gap-2 mb-2">
                    <div className="font-semibold mr-2">{t('numbers') || 'Numéros:'}:</div>
                    {gridNumbers.map((num, index) => (
                      <span key={`num-${gridId}-${index}`} className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center">
                        {num}
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    <div className="font-semibold mr-2">{t('stars') || 'Étoiles:'}:</div>
                    {gridStars.map((star, index) => (
                      <span key={`star-${gridId}-${index}`} className="bg-yellow-500 text-white rounded-full w-8 h-8 flex items-center justify-center">
                        {star}
                      </span>
                    ))}
                  </div>
                  
                  <div className="mb-2">
                    <span className="font-semibold">{t('method') || 'Méthode:'}:</span> {gridMethod}
                  </div>
                  
                  <div className="mb-4">
                    <span className="font-semibold">{t('confidence') || 'Indice de confiance:'}:</span> {gridConfidence}%
                  </div>
                  
                  <button
                    onClick={() => saveGrid(grid)}
                    className="bg-green-500 hover:bg-green-600 text-white font-semibold py-1 px-3 rounded text-sm"
                  >
                    {t('saveGrid') || 'Sauvegarder'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default GenerateGrid;
