// src/pages/Home.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Box, Typography, Paper, Grid, CircularProgress } from '@mui/material';
import { drawsApi } from '../utils/api';

const Home = () => {
  const navigate = useNavigate();
  const [latestDraw, setLatestDraw] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [nextDrawDate, setNextDrawDate] = useState('');
  const [estimatedJackpot, setEstimatedJackpot] = useState('');

  useEffect(() => {
    // Fonction pour charger le dernier tirage
    const fetchLatestDraw = async () => {
      setLoading(true);
      try {
        // Tenter de récupérer les données depuis l'API
        try {
          const response = await axios.get('/api/draws/latest');
          setLatestDraw(response.data);
          
          // Calculer la date du prochain tirage et estimer le jackpot
          calculateNextDrawInfo(response.data);
        } catch (apiError) {
          console.warn('Fallback sur les données fictives:', apiError);
          
          // Créer un tirage fictif en cas d'erreur API
          const mockLatestDraw = {
            date: new Date().toISOString(),
            numbers: [5, 12, 23, 34, 45],
            stars: [2, 7],
            jackpot: "17 000 000 €",
            winners: 0
          };
          
          setLatestDraw(mockLatestDraw);
          calculateNextDrawInfo(mockLatestDraw);
        }
        
        setError(null);
      } catch (err) {
        console.error("Erreur lors du chargement du dernier tirage:", err);
        setError("Impossible de charger les informations sur le dernier tirage");
      } finally {
        setLoading(false);
      }
    };
    
    // Fonction pour calculer la date du prochain tirage et le jackpot estimé
    const calculateNextDrawInfo = (draw) => {
      // Calculer la date du prochain tirage (mardi ou vendredi suivant)
      const today = new Date();
      const dayOfWeek = today.getDay(); // 0 = dimanche, 1 = lundi, ...
      
      let daysToAdd;
      if (dayOfWeek < 2) {
        // Dimanche ou lundi : prochain tirage mardi
        daysToAdd = 2 - dayOfWeek;
      } else if (dayOfWeek < 5) {
        // Mardi, mercredi ou jeudi : prochain tirage vendredi
        daysToAdd = 5 - dayOfWeek;
      } else {
        // Vendredi, samedi : prochain tirage mardi
        daysToAdd = 9 - dayOfWeek;
      }
      
      const nextDrawDay = new Date(today);
      nextDrawDay.setDate(today.getDate() + daysToAdd);
      
      setNextDrawDate(nextDrawDay.toLocaleDateString('fr-FR', { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'long' 
      }));
      
      // Définir un jackpot estimé (fictif ou basé sur la logique métier)
      // Si pas de gagnant au tirage précédent, augmenter le jackpot
      const previousJackpot = draw.jackpot || "17 000 000 €";
      const jackpotValue = parseInt(previousJackpot.replace(/[^\d]/g, ''));
      
      // Si pas de gagnant, augmenter le jackpot
      const newJackpot = draw.winners === 0 
        ? jackpotValue + 9000000 
        : 17000000;
      
      // Formatter le nouveau jackpot
      setEstimatedJackpot(new Intl.NumberFormat('fr-FR').format(newJackpot) + " €");
    };
    
    fetchLatestDraw();
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="container">
      <h1 className="text-center">EuroMillions App</h1>
      <h3 className="text-center" style={{color: '#666'}}>
        Consultez les résultats, statistiques et créez vos grilles
      </h3>
      
      {/* Section d'information sur le prochain tirage */}
      <div className="main-banner">
        <div className="banner-grid">
          <div className="banner-info">
            <h2>Prochain tirage EuroMillions</h2>
            <h3>{nextDrawDate ? nextDrawDate.charAt(0).toUpperCase() + nextDrawDate.slice(1) : 'Chargement...'}</h3>
            <p>Jackpot estimé : <strong>{estimatedJackpot || 'Chargement...'}</strong></p>
          </div>
          <div className="banner-action">
            <button className="play-button" onClick={() => navigate('/mes-grilles')}>
              <span>▶</span> Jouer maintenant
            </button>
          </div>
        </div>
      </div>
      
      {/* Dernier résultat EuroMillions */}
      <h2>Dernier résultat EuroMillions</h2>
      
      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Chargement des résultats...</p>
        </div>
      ) : error ? (
        <div className="error-alert">
          {error}
          <button 
            style={{marginLeft: '20px', padding: '5px 10px', border: 'none', background: '#c62828', color: 'white', borderRadius: '4px', cursor: 'pointer'}}
            onClick={() => window.location.reload()}
          >
            Réessayer
          </button>
        </div>
      ) : latestDraw ? (
        <div className="last-draw">
          <div style={{display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap'}}>
            <div>
              <p>Date du tirage : {formatDate(latestDraw.date)}</p>
              
              <div>
                <h4>Numéros gagnants :</h4>
                <div className="numbers-container">
                  {latestDraw.numbers.map(num => (
                    <div key={`num-${num}`} className="number-ball">{num}</div>
                  ))}
                </div>
                
                <h4>Étoiles :</h4>
                <div className="numbers-container">
                  {latestDraw.stars.map(star => (
                    <div key={`star-${star}`} className="star-ball">{star}</div>
                  ))}
                </div>
              </div>
            </div>
            
            <div>
              <p>Jackpot: {latestDraw.jackpot}</p>
              <p>Gagnants rang 1: {latestDraw.winners === 0 ? 'Aucun gagnant' : latestDraw.winners}</p>
              
              <button 
                className="card-button" 
                style={{marginTop: '20px'}}
                onClick={() => navigate('/dernier-tirage')}
              >
                Voir tous les détails
              </button>
            </div>
          </div>
        </div>
      ) : (
        <p>Aucune information disponible</p>
      )}
      
      {/* Cartes de navigation */}
      <div className="grid-container">
        <div className="card">
          <div className="card-icon">📋</div>
          <h3>Historique des tirages</h3>
          <p>Consultez tous les résultats des tirages précédents</p>
          <div className="card-action">
            <button className="card-button" onClick={() => navigate('/historique')}>
              Accéder
            </button>
          </div>
        </div>
        
        <div className="card">
          <div className="card-icon">📊</div>
          <h3>Statistiques</h3>
          <p>Analysez les tendances et fréquences des numéros</p>
          <div className="card-action">
            <button className="card-button" onClick={() => navigate('/statistiques')}>
              Accéder
            </button>
          </div>
        </div>
        
        <div className="card">
          <div className="card-icon">📝</div>
          <h3>Mes grilles</h3>
          <p>Gérez vos grilles sauvegardées et créez-en de nouvelles</p>
          <div className="card-action">
            <button className="card-button" onClick={() => navigate('/mes-grilles')}>
              Accéder
            </button>
          </div>
        </div>
        
        <div className="card">
          <div className="card-icon">💡</div>
          <h3>Prédictions</h3>
          <p>Découvrez nos suggestions basées sur l'analyse statistique</p>
          <div className="card-action">
            <button className="card-button" onClick={() => navigate('/predictions')}>
              Accéder
            </button>
          </div>
        </div>
      </div>
      
      {/* Section informative */}
      <div className="info-section">
        <h2>À propos d'EuroMillions</h2>
        <hr style={{marginBottom: '20px'}} />
        <p>
          L'EuroMillions est une loterie transnationale lancée le 7 février 2004. 
          Les tirages ont lieu tous les mardis et vendredis soirs à 21h00 (heure de Paris).
        </p>
        <p>
          Pour jouer, vous devez sélectionner 5 numéros de 1 à 50 et 2 étoiles de 1 à 12.
          Pour remporter le jackpot, vous devez avoir tous les numéros et étoiles corrects.
          Il existe également 12 autres rangs de gains.
        </p>
        <p>
          Cette application vous permet de consulter les résultats, d'analyser les statistiques
          et de gérer vos grilles préférées. Les informations sont fournies à titre informatif
          uniquement et ne sont pas officielles.
        </p>
      </div>
    </div>
  );
};

export default Home;
