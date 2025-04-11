// frontend/src/pages/DrawHistory.js - Correction

import React, { useState, useEffect } from 'react';
import { drawsApi } from '../utils/api';

const DrawHistory = () => {
  const [draws, setDraws] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  
  useEffect(() => {
    fetchDraws(pagination.page, pagination.limit);
  }, [pagination.page, pagination.limit]);
  
  const fetchDraws = async (page, limit) => {
    console.log(`Chargement des tirages (page ${page}, limite ${limit})...`);
    try {
      setLoading(true);
      const response = await drawsApi.getAll(page, limit);
      
      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        console.log('Historique des tirages chargé avec succès:', response.data);
        
        // Vérifier si les données semblent valides
        const hasValidDates = response.data.data.every(draw => {
          const drawDate = new Date(draw.date);
          return !isNaN(drawDate) && drawDate <= new Date();
        });
        
        if (!hasValidDates) {
          console.error('Données de tirage invalides détectées dans l\'historique');
          setError('Certaines dates de tirage sont invalides');
        } else {
          setDraws(response.data.data);
          setPagination({
            page: response.data.pagination.page,
            limit: response.data.pagination.limit,
            total: response.data.pagination.total,
            totalPages: response.data.pagination.totalPages
          });
          setError(null);
        }
      } else {
        console.error('Format de réponse invalide pour l\'historique des tirages:', response.data);
        setError('Format de données invalide reçu du serveur');
      }
    } catch (error) {
      console.error('Erreur lors du chargement de l\'historique des tirages:', error);
      setError(`Erreur: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, page: newPage }));
    }
  };
  
  const handleLimitChange = (event) => {
    const newLimit = parseInt(event.target.value);
    setPagination(prev => ({ ...prev, limit: newLimit, page: 1 }));
  };
  
  return (
    <div className="draw-history-container">
      <h2>Historique des Tirages EuroMillions</h2>
      
      {loading && draws.length === 0 && (
        <div className="loading-container">
          <p>Chargement de l'historique des tirages...</p>
        </div>
      )}
      
      {error && draws.length === 0 && (
        <div className="error-container">
          <p>{error}</p>
          <button onClick={() => fetchDraws(pagination.page, pagination.limit)}>Réessayer</button>
        </div>
      )}
      
      {draws.length > 0 && (
        <>
          <div className="pagination-controls">
            <div className="limit-selector">
              <label>Tirages par page:</label>
              <select value={pagination.limit} onChange={handleLimitChange}>
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
              </select>
            </div>
            
            <div className="page-info">
              Page {pagination.page} sur {pagination.totalPages} (Total: {pagination.total} tirages)
            </div>
            
            <div className="page-buttons">
              <button 
                onClick={() => handlePageChange(1)} 
                disabled={pagination.page === 1}
              >
                &laquo; Première
              </button>
              <button 
                onClick={() => handlePageChange(pagination.page - 1)} 
                disabled={pagination.page === 1}
              >
                &lsaquo; Précédente
              </button>
              <button 
                onClick={() => handlePageChange(pagination.page + 1)} 
                disabled={pagination.page === pagination.totalPages}
              >
                Suivante &rsaquo;
              </button>
              <button 
                onClick={() => handlePageChange(pagination.totalPages)} 
                disabled={pagination.page === pagination.totalPages}
              >
                Dernière &raquo;
              </button>
            </div>
          </div>
          
          <div className="draws-table-container">
            <table className="draws-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Numéros</th>
                  <th>Étoiles</th>
                  <th>Jackpot</th>
                  <th>Gagnants</th>
                </tr>
              </thead>
              <tbody>
                {draws.map(draw => (
                  <tr key={draw.id}>
                    <td>{new Date(draw.date).toLocaleDateString()}</td>
                    <td>
                      {draw.numbers.map((num, index) => (
                        <span key={index} className="euromillions-number regular mini">
                          {num}
                        </span>
                      ))}
                    </td>
                    <td>
                      {draw.stars.map((star, index) => (
                        <span key={index} className="euromillions-number star mini">
                          {star}
                        </span>
                      ))}
                    </td>
                    <td>{draw.jackpot || '-'}</td>
                    <td>{draw.winners === '0' ? 'Aucun' : draw.winners}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="pagination-controls bottom">
            <button 
              onClick={() => handlePageChange(pagination.page - 1)} 
              disabled={pagination.page === 1}
            >
              &lsaquo; Précédente
            </button>
            <span>Page {pagination.page} sur {pagination.totalPages}</span>
            <button 
              onClick={() => handlePageChange(pagination.page + 1)} 
              disabled={pagination.page === pagination.totalPages}
            >
              Suivante &rsaquo;
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default DrawHistory;
