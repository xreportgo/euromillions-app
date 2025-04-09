// src/pages/Dashboard.js
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchLatestDraws } from '../redux/actions/drawActions';

const Dashboard = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { latestDraw, loading, error } = useSelector(state => state.draws);

  useEffect(() => {
    if (!latestDraw) {
      dispatch(fetchLatestDraws());
    }
  }, [dispatch, latestDraw]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">{t('welcomeTitle') || 'Bienvenue sur Euromillions Analyzer'}</h1>
      <p className="mb-6">{t('welcomeMessage') || 'Analysez les tirages, générez des grilles et maximisez vos chances.'}</p>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Dernier tirage */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">{t('latestDraw') || 'Dernier tirage'}</h2>
          
          {loading ? (
            <div className="animate-pulse flex flex-col">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3"></div>
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded mb-3"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
          ) : error ? (
            <div className="text-red-500 text-sm">
              {t('errorLoadingDraw') || 'Erreur lors du chargement du tirage.'}
            </div>
          ) : latestDraw ? (
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                {new Date(latestDraw.date).toLocaleDateString()}
              </p>
              
              <div className="flex justify-center my-4 flex-wrap gap-2">
                {latestDraw.numbers.map(number => (
                  <div key={`number-${number}`} className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-600 text-white font-bold">
                    {number}
                  </div>
                ))}
                <span className="self-center mx-2">+</span>
                {latestDraw.stars.map(star => (
                  <div key={`star-${star}`} className="flex items-center justify-center w-10 h-10 rounded-full bg-yellow-400 text-yellow-900 font-bold">
                    {star}
                  </div>
                ))}
              </div>
              
              <div className="text-center mt-4">
                <Link 
                  to="/draws" 
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {t('viewAllDraws') || 'Voir tous les tirages'}
                </Link>
              </div>
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500 dark:text-gray-400">
              {t('noDrawData') || 'Aucune donnée de tirage disponible.'}
            </div>
          )}
        </div>
        
        {/* Liens rapides */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link 
            to="/generate" 
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <h3 className="font-medium mb-2">{t('generateGrids') || 'Générer des grilles'}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t('generateGridsDesc') || 'Créez de nouvelles grilles Euromillions avec différentes stratégies.'}
            </p>
          </Link>
          
          <Link 
            to="/saved-grids" 
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <h3 className="font-medium mb-2">{t('savedGrids') || 'Grilles sauvegardées'}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t('savedGridsDesc') || 'Consultez et gérez vos grilles enregistrées.'}
            </p>
          </Link>
          
          <Link 
            to="/statistics" 
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <h3 className="font-medium mb-2">{t('statistics') || 'Statistiques'}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t('statisticsDesc') || 'Analysez les tendances et fréquences des tirages passés.'}
            </p>
          </Link>
          
          <Link 
            to="/predictions" 
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <h3 className="font-medium mb-2">{t('predictions') || 'Prédictions'}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t('predictionsDesc') || 'Explorez les prédictions pour les prochains tirages.'}
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
