// src/pages/Statistics.js
import React, { useState, useEffect } from 'react';

// Composant simple de graphique à barres
const BarChart = ({ data, dataKey, nameKey, height, colors }) => {
  const maxValue = Math.max(...data.map(item => item[dataKey]));
  
  return (
    <div style={{ height: height, position: 'relative' }}>
      {data.map((item, index) => {
        const value = item[dataKey];
        const barHeight = (value / maxValue) * height * 0.8;
        
        return (
          <div key={index} style={{ 
            display: 'inline-block',
            width: `${90 / data.length}%`,
            margin: '0 0.5%',
            height: '100%',
            position: 'relative',
            textAlign: 'center'
          }}>
            <div style={{
              position: 'absolute',
              bottom: '20%',
              left: 0,
              right: 0,
              height: barHeight,
              backgroundColor: colors[index % colors.length],
              borderRadius: '4px',
              transition: 'height 0.3s'
            }} />
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              textAlign: 'center',
              fontSize: '12px',
              fontWeight: 'bold'
            }}>
              {item[nameKey]}
            </div>
            <div style={{
              position: 'absolute',
              bottom: `calc(20% + ${barHeight}px + 5px)`,
              left: 0,
              right: 0,
              textAlign: 'center',
              fontSize: '12px'
            }}>
              {value}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Composant simple de graphique en camembert
const PieChart = ({ data, dataKey, nameKey, colors }) => {
  const total = data.reduce((sum, item) => sum + item[dataKey], 0);
  let currentAngle = 0;
  
  return (
    <div style={{ position: 'relative', width: '200px', height: '200px', margin: '0 auto' }}>
      <svg width="200" height="200" viewBox="0 0 200 200">
        {data.map((item, index) => {
          const value = item[dataKey];
          const percentage = value / total;
          const startAngle = currentAngle;
          const angleSize = percentage * 360;
          currentAngle += angleSize;
          
          const startRadians = (startAngle - 90) * Math.PI / 180;
          const endRadians = (startAngle + angleSize - 90) * Math.PI / 180;
          
          const x1 = 100 + 100 * Math.cos(startRadians);
          const y1 = 100 + 100 * Math.sin(startRadians);
          const x2 = 100 + 100 * Math.cos(endRadians);
          const y2 = 100 + 100 * Math.sin(endRadians);
          
          const largeArcFlag = angleSize > 180 ? 1 : 0;
          
          const pathData = [
            `M 100 100`,
            `L ${x1} ${y1}`,
            `A 100 100 0 ${largeArcFlag} 1 ${x2} ${y2}`,
            `Z`
          ].join(' ');
          
          // Calculate text position
          const midAngle = startAngle + angleSize / 2;
          const midRadians = (midAngle - 90) * Math.PI / 180;
          const textX = 100 + 70 * Math.cos(midRadians);
          const textY = 100 + 70 * Math.sin(midRadians);
          
          return (
            <g key={index}>
              <path
                d={pathData}
                fill={colors[index % colors.length]}
                stroke="#fff"
                strokeWidth="1"
              />
              {percentage > 0.1 && (
                <text
                  x={textX}
                  y={textY}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="#fff"
                  fontSize="12"
                  fontWeight="bold"
                >
                  {item[nameKey]}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      <div style={{ 
        position: 'absolute', 
        bottom: '-40px', 
        left: '0', 
        right: '0', 
        textAlign: 'center',
        display: 'flex',
        justifyContent: 'center',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        {data.map((item, index) => (
          <div key={index} style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ 
              width: '12px', 
              height: '12px', 
              backgroundColor: colors[index % colors.length],
              marginRight: '5px',
              display: 'inline-block'
            }} />
            <span style={{ fontSize: '12px' }}>
              {item[nameKey]}: {Math.round(item[dataKey] / total * 100)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const Statistics = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [numberFrequency, setNumberFrequency] = useState([]);
  const [starFrequency, setStarFrequency] = useState([]);
  const [drawDayDistribution, setDrawDayDistribution] = useState([]);
  
  // Couleurs pour les graphiques
  const colors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#D88489', '#82ca9d', '#ffc658'];
  
  useEffect(() => {
    // Fonction pour charger les statistiques
    const fetchStatistics = async () => {
      setLoading(true);
      try {
        // Simuler un appel API (à remplacer par votre vrai appel API)
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Générer des données fictives pour les fréquences des numéros
        const numbersData = Array.from({ length: 50 }, (_, i) => ({
          number: i + 1,
          frequency: Math.floor(Math.random() * 100) + 10
        })).sort((a, b) => b.frequency - a.frequency).slice(0, 10);
        
        // Générer des données fictives pour les fréquences des étoiles
        const starsData = Array.from({ length: 12 }, (_, i) => ({
          star: i + 1,
          frequency: Math.floor(Math.random() * 100) + 20
        }));
        
        // Générer des données fictives pour la distribution des jours de tirage
        const daysData = [
          { name: 'Mardi', value: 45 },
          { name: 'Vendredi', value: 55 }
        ];
        
        setNumberFrequency(numbersData);
        setStarFrequency(starsData);
        setDrawDayDistribution(daysData);
        setError(null);
      } catch (err) {
        console.error('Erreur lors du chargement des statistiques:', err);
        setError('Impossible de charger les statistiques');
      } finally {
        setLoading(false);
      }
    };
    
    fetchStatistics();
  }, []);
  
  return (
    <div className="container">
      <h1 className="text-center">Statistiques EuroMillions</h1>
      
      <p className="text-center">
        Explorez les statistiques des tirages EuroMillions pour comprendre les tendances.
      </p>
      
      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Chargement des statistiques...</p>
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
      ) : (
        <div className="grid-container">
          {/* Fréquence des numéros */}
          <div className="card" style={{gridColumn: '1 / span 2'}}>
            <h3>Top 10 des numéros les plus fréquents</h3>
            <div style={{height: '300px', marginTop: '20px'}}>
              <BarChart 
                data={numberFrequency} 
                dataKey="frequency" 
                nameKey="number" 
                height={250}
                colors={colors}
              />
            </div>
          </div>
          
          {/* Fréquence des étoiles */}
          <div className="card" style={{gridColumn: '1 / span 2'}}>
            <h3>Fréquence des étoiles</h3>
            <div style={{height: '300px', marginTop: '20px'}}>
              <BarChart 
                data={starFrequency} 
                dataKey="frequency" 
                nameKey="star" 
                height={250}
                colors={['#ffc107', '#ffda47', '#ffe57f', '#fff8cd']}
              />
            </div>
          </div>
          
          {/* Distribution des jours de tirage */}
          <div className="card">
            <h3>Distribution des jours de tirage</h3>
            <div style={{height: '300px', marginTop: '20px', position: 'relative'}}>
              <PieChart 
                data={drawDayDistribution} 
                dataKey="value" 
                nameKey="name" 
                colors={['#0a1f44', '#0a4473']}
              />
            </div>
          </div>
          
          {/* Informations clés */}
          <div className="card">
            <h3>Informations clés</h3>
            <div style={{marginTop: '20px', lineHeight: '1.8'}}>
              <p><strong>Nombre total de tirages analysés:</strong> 1,248</p>
              <p><strong>Période couverte:</strong> 2004 - 2025</p>
              <p><strong>Jackpot moyen:</strong> 72.3 millions €</p>
              <p><strong>Plus gros jackpot:</strong> 220 millions € (12/10/2021)</p>
              <p><strong>Numéro le moins fréquent:</strong> 42 (apparu 48 fois)</p>
              <p><strong>Étoile la plus fréquente:</strong> 3 (apparu 195 fois)</p>
            </div>
          </div>
        </div>
      )}
      
      <div style={{
        margin: '40px 0',
        padding: '20px',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
      }}>
        <p style={{fontWeight: 'bold'}}>
          <strong>Note:</strong> Ces statistiques sont fournies à titre informatif uniquement.
          Le tirage EuroMillions est un jeu de hasard, et les résultats passés ne prédisent pas
          les résultats futurs.
        </p>
      </div>
    </div>
  );
};

export default Statistics;
