import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Paper, Typography, Grid, Box, CircularProgress, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { drawsApi, predictionsApi } from '../../utils/api';
import LatestDrawDisplay from './components/LatestDrawDisplay';
import QuickPrediction from './components/QuickPrediction';
import StatsHighlights from './components/StatsHighlights';
import NextDrawCountdown from './components/NextDrawCountdown';

/**
 * Page Dashboard - Vue d'ensemble de l'application
 */
const Dashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [latestDraw, setLatestDraw] = useState(null);
  const [prediction, setPrediction] = useState(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Récupérer le dernier tirage
        const latestDrawResponse = await drawsApi.getLatest();
        setLatestDraw(latestDrawResponse.data);
        
        // Récupérer une prédiction rapide
        const predictionResponse = await predictionsApi.generate('frequency');
        setPrediction(predictionResponse.data);
        
        setError(null);
      } catch (err) {
        console.error('Erreur lors du chargement du dashboard:', err);
        setError(err.message || 'Une erreur est survenue lors du chargement des données');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center', mt: 3 }}>
        <Typography variant="h6" color="error" gutterBottom>
          {t('dashboard.errorLoading')}
        </Typography>
        <Typography variant="body1" paragraph>
          {error}
        </Typography>
        <Button variant="contained" onClick={() => window.location.reload()}>
          {t('common.retry')}
        </Button>
      </Paper>
    );
  }
  
  return (
    <Box sx={{ flexGrow: 1, py: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        {t('dashboard.title')}
      </Typography>
      
      <Grid container spacing={3}>
        {/* Dernier tirage */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              {t('dashboard.latestDraw')}
            </Typography>
            {latestDraw ? (
              <LatestDrawDisplay draw={latestDraw} />
            ) : (
              <Typography variant="body2" color="text.secondary">
                {t('dashboard.noDrawsFound')}
              </Typography>
            )}
            <Box sx={{ mt: 2, textAlign: 'right' }}>
              <Button 
                variant="outlined" 
                size="small"
                onClick={() => navigate('/draws')}
              >
                {t('dashboard.viewAllDraws')}
              </Button>
            </Box>
          </Paper>
        </Grid>
        
        {/* Prédiction rapide */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              {t('dashboard.quickPrediction')}
            </Typography>
            {prediction ? (
              <QuickPrediction prediction={prediction} />
            ) : (
              <Typography variant="body2" color="text.secondary">
                {t('dashboard.noPredictionAvailable')}
              </Typography>
            )}
            <Box sx={{ mt: 2, textAlign: 'right' }}>
              <Button 
                variant="outlined" 
                size="small"
                onClick={() => navigate('/predictions')}
              >
                {t('dashboard.morePredictions')}
              </Button>
            </Box>
          </Paper>
        </Grid>
        
        {/* Prochain tirage */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              {t('dashboard.nextDraw')}
            </Typography>
            <NextDrawCountdown />
          </Paper>
        </Grid>
        
        {/* Statistiques */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              {t('dashboard.statsHighlights')}
            </Typography>
            <StatsHighlights latestDraw={latestDraw} />
            <Box sx={{ mt: 2, textAlign: 'right' }}>
              <Button 
                variant="outlined" 
                size="small"
                onClick={() => navigate('/statistics')}
              >
                {t('dashboard.viewAllStats')}
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
