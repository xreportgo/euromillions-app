// src/pages/Statistics.js
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import { fetchStatistics } from '../redux/actions/statActions';

const Statistics = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { stats, loading, error } = useSelector(state => state.stats || {});

  useEffect(() => {
    dispatch(fetchStatistics());
  }, [dispatch]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">{t('statistics')}</h1>
      
      {loading ? (
        <div className="text-center">
          <p>{t('loading') || 'Chargement...'}</p>
        </div>
      ) : error ? (
        <div className="text-red-500">
          <p>{error}</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">{t('statisticsInfo') || 'Informations statistiques'}</h2>
          <p>{t('comingSoon') || 'Fonctionnalité à venir...'}</p>
        </div>
      )}
    </div>
  );
};

export default Statistics;
