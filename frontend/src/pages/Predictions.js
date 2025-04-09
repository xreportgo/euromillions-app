// src/pages/Predictions.js
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import { fetchPredictions } from '../redux/actions/predictionActions';

const Predictions = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  // Utilisez une valeur par défaut pour éviter des erreurs si le reducer n'est pas encore disponible
  const { predictions = [], loading = false, error = null } = useSelector(state => state.predictions || {});

  useEffect(() => {
    // Commentez cette ligne pour éviter les erreurs si le reducer n'est pas encore disponible
    // dispatch(fetchPredictions());
  }, [dispatch]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">{t('predictions') || 'Prédictions'}</h1>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">{t('nextDrawPredictions') || 'Prédictions pour le prochain tirage'}</h2>
        <p className="mb-4">{t('predictionsComingSoon') || 'Cette fonctionnalité sera bientôt disponible.'}</p>
        
        <div className="p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            {t('predictionsDisclaimer') || 'Les prédictions sont basées sur des analyses statistiques et ne garantissent pas les résultats futurs.'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Predictions;
