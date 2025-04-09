// src/components/grids/GridCard.js
import React from 'react';
import { useTranslation } from 'react-i18next';
import LotteryBall from '../common/LotteryBall';

const GridCard = ({ grid, onSave, onPrint, onCheck, saved }) => {
  const { t } = useTranslation();
  
  // Vérification pour éviter les erreurs
  if (!grid || !Array.isArray(grid.numbers) || !Array.isArray(grid.stars)) {
    console.error('Invalid grid data:', grid);
    return (
      <div className="border rounded-lg shadow-sm p-4 bg-red-50 dark:bg-red-900 text-red-700 dark:text-red-200">
        <p>{t('invalidGridData') || 'Données de grille invalides'}</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg shadow-sm hover:shadow-md transition-all p-4 bg-white dark:bg-gray-800 dark:border-gray-700">
      <div className="font-medium text-lg mb-2">
        {grid.name || t('generatedGrid') || 'Grille générée'}
      </div>
      
      {typeof grid.confidence === 'number' && (
        <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
          {t('confidence') || 'Confiance'}: {Math.round(grid.confidence * 100)}%
        </div>
      )}
      
      <div className="flex justify-center my-4 flex-wrap">
        {grid.numbers.map((number, index) => (
          <LotteryBall 
            key={`number-${number}-${index}`} 
            number={number} 
            type="number"
            className="m-1"
          />
        ))}
        
        <span className="mx-2 self-center">+</span>
        
        {grid.stars.map((star, index) => (
          <LotteryBall 
            key={`star-${star}-${index}`} 
            number={star} 
            type="star"
            className="m-1"
          />
        ))}
      </div>
      
      {grid.method && (
        <div className="text-sm text-gray-600 dark:text-gray-400 mt-2 mb-3">
          {t('generatedUsing') || 'Générée avec'}: {t(grid.method) || grid.method}
        </div>
      )}
      
      <div className="flex justify-between gap-2 mt-4">
        <button
          onClick={() => onSave(grid)}
          disabled={saved}
          className={`px-3 py-1 text-sm rounded ${
            saved 
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors'
          }`}
        >
          {saved ? (t('alreadySaved') || 'Déjà sauvegardée') : (t('save') || 'Sauvegarder')}
        </button>
        
        <button
          onClick={() => onPrint(grid)}
          className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none"
        >
          {t('print') || 'Imprimer'}
        </button>
        
        {onCheck && (
          <button
            onClick={() => onCheck(grid)}
            className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 focus:outline-none"
          >
            {t('check') || 'Vérifier'}
          </button>
        )}
      </div>
    </div>
  );
};

export default GridCard;
