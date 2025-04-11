// frontend/src/pages/LastDraw.js - Correction

import React, { useState, useEffect } from 'react';
import { drawsApi } from '../utils/api';

const LastDraw = () => {
  const [drawData, setDrawData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchData = async () => {
      console.log('Chargement du dernier tirage...');
      try {
        setLoading(true);
        const response = await drawsApi.getLatest();
        
        // Vérification des données
        if (response.data && response.data.date) {
          const drawDate = new Date(response.data.date);
          const today = new Date();
          
          if (drawDate > today) {
            console.error('Données invalides: date dans le futur:', response.data);
            setError('Données invalides reçues du serveur');
          } else {
            console.log('Données du dernier tirage chargées avec succès');
            setDrawData(response.data);
            setError(null);
          }
        } else {
          console.error('Données incomplètes reçues:', response.data);
          setError('Données incomplètes reçues du serveur');
        }
      } catch (error) {
        console.error('Erreur lors du chargement du dernier tirage:', error);
        setError(`Erreur: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
    
    // Pas de mécanisme de rechargement automatique
  }, []);
  
  if (loading && !drawData) {
    return (
      <div className="loading-container">
        <p>Chargement du dernier tirage...</p>
      </div>
    );
  }
  
  if (error && !drawData) {
    return (
      <div className="error-container">
        <h2>Erreur</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Réessayer</button>
      </div>
    );
  }
  
  return (
    <div className="draw-container">
      <h2>Dernier Tirage EuroMillions</h2>
      
      {drawData && (
        <div className="draw-result">
          <p className="draw-date">
            Tirage du {new Date(drawData.date).toLocaleDateString()}
          </p>
          
          <div className="numbers-container">
            <div className="regular-numbers">
              {drawData.numbers.map((num, index) => (
                <span key={index} className="euromillions-number regular">
                  {num}
                </span>
              ))}
            </div>
            
            <div className="star-numbers">
              {drawData.stars.map((star, index) => (
                <span key={index} className="euromillions-number star">
                  {star}
                </span>
              ))}
            </div>
          </div>
          
          {drawData.jackpot && (
            <p className="jackpot">Jackpot: {drawData.jackpot}</p>
          )}
          
          <p className="winners">
            Gagnants du jackpot: {drawData.winners === '0' ? 'Aucun' : drawData.winners}
          </p>
        </div>
      )}
    </div>
  );
};

export default LastDraw;
