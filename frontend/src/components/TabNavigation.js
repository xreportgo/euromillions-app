import React from 'react';
import { useTranslation } from 'react-i18next';

const TabNavigation = () => {
  const { t } = useTranslation();
  
  return (
    <ul className="nav nav-tabs" id="mainTab" role="tablist">
      <li className="nav-item" role="presentation">
        <button 
          className="nav-link active" 
          id="draws-tab" 
          data-bs-toggle="tab" 
          data-bs-target="#draws" 
          type="button" 
          role="tab" 
          aria-controls="draws" 
          aria-selected="true"
        >
          {t('Tirages')}
        </button>
      </li>
      <li className="nav-item" role="presentation">
        <button 
          className="nav-link" 
          id="stats-tab" 
          data-bs-toggle="tab" 
          data-bs-target="#stats" 
          type="button" 
          role="tab" 
          aria-controls="stats" 
          aria-selected="false"
        >
          {t('Statistiques')}
        </button>
      </li>
      <li className="nav-item" role="presentation">
        <button 
          className="nav-link" 
          id="generate-tab" 
          data-bs-toggle="tab" 
          data-bs-target="#generate" 
          type="button" 
          role="tab" 
          aria-controls="generate" 
          aria-selected="false"
        >
          {t('Générer une grille')}
        </button>
      </li>
      <li className="nav-item" role="presentation">
        <button 
          className="nav-link" 
          id="mesgrilles-tab" 
          data-bs-toggle="tab" 
          data-bs-target="#mesgrilles" 
          type="button" 
          role="tab" 
          aria-controls="mesgrilles" 
          aria-selected="false"
        >
          Mes Grilles
        </button>
      </li>
      <li className="nav-item" role="presentation">
        <button 
          className="nav-link" 
          id="predict-tab" 
          data-bs-toggle="tab" 
          data-bs-target="#predict" 
          type="button" 
          role="tab" 
          aria-controls="predict" 
          aria-selected="false"
        >
          {t('Prédiction')}
        </button>
      </li>
    </ul>
  );
};

export default TabNavigation;
