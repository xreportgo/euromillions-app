// frontend/src/pages/Predictions.js - Version corrigée

import React, { useState, useEffect } from 'react';
import { predictionsApi } from '../utils/api';

const Predictions = () => {
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [method, setMethod] = useState('frequency');
  
  const methods = [
    { value: 'frequency', label: 'Fréquence', description: 'Prédiction basée sur les numéros et étoiles apparaissant le plus fréquemment.' },
    { value: 'rarity', label: 'Rareté', description: 'Prédiction basée sur les numéros et étoiles apparaissant le plus rarement.' },
    { value: 'pattern', label: 'Pattern', description: 'Prédiction basée sur l\'analyse des patterns et tendances des tirages récents.' },
    { value: 'random', label: 'Aléatoire', description: 'Prédiction basée sur une sélection aléatoire de numéros et d\'étoiles.' }
  ];
  
  useEffect(() => {
    generatePrediction(method);
  }, [method]);
  
  const generatePrediction = async (selectedMethod) => {
    console.log(`Génération d'une prédiction avec la méthode: ${selectedMethod}`);
    try {
      setLoading(true);
      const response = await predictionsApi.generate(selectedMethod);
      
      if (response.data && response.data.prediction) {
        console.log('Prédiction générée avec succès:', response.data);
        setPrediction(response.data);
        setError(null);
      } else {
        console.error('Réponse de prédiction invalide:', response.data);
        setError('Format de prédiction invalide reçu du serveur');
      }
    } catch (error) {
      console.error('Erreur lors de la génération de prédiction:', error);
      setError(`Erreur: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  const handleMethodChange = (newMethod) => {
    setMethod(newMethod);
  };
  
  return (
    <div className="predictions-container">
      <h2>Prédictions EuroMillions</h2>
      
      <div className="prediction-methods">
        {methods.map(m => (
          <button
            key={m.value}
            className={`method-button ${method === m.value ? 'active' : ''}`}
            onClick={() => handleMethodChange(m.value)}
          >
            {m.label}
          </button>
        ))}
      </div>
      
      {loading && !prediction && (
        <div className="loading-container">
          <p>Génération de la prédiction en cours...</p>
        </div>
      )}
      
      {error && !prediction && (
        <div className="error-container">
          <p>{error}</p>
          <button onClick={() => generatePrediction(method)}>Réessayer</button>
        </div>
      )}
      
      {prediction && (
        <div className="prediction-result">
          <h3>Prédiction pour le {new Date(prediction.prediction.date).toLocaleDateString()}</h3>
          
          <div className="prediction-method-info">
            <p><strong>Méthode:</strong> {methods.find(m => m.value === prediction.method)?.label}</p>
            <p><strong>Description:</strong> {prediction.explanation}</p>
            <p><strong>Indice de confiance:</strong> {Math.round(prediction.confidenceScore * 100)}%</p>
          </div>
          
          <div className="numbers-container">
            <div className="regular-numbers">
              {prediction.prediction.numbers.map((num, index) => (
                <span key={index} className="euromillions-number regular">
                  {num}
                </span>
              ))}
            </div>
            
            <div className="star-numbers">
              {prediction.prediction.stars.map((star, index) => (
                <span key={index} className="euromillions-number star">
                  {star}
                </span>
              ))}
            </div>
          </div>
          
          <div className="disclaimer">
            <p>{prediction.disclaimer}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Predictions;
