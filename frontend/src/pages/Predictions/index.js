import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Typography, 
  Box, 
  Paper, 
  Grid, 
  CircularProgress, 
  Tabs, 
  Tab, 
  Button,
  Card,
  CardContent,
  CardActions,
  Divider,
  Alert,
  LinearProgress
} from '@mui/material';
import { predictionsApi, gridsApi } from '../../utils/api';
import PredictionDisplay from './components/PredictionDisplay';
import SaveGridDialog from './components/SaveGridDialog';

/**
 * Page de prédictions pour les futurs tirages
 */
const Predictions = () => {
  const { t } = useTranslation();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [prediction, setPrediction] = useState(null);
  const [method, setMethod] = useState('frequency');
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [savingGrid, setSavingGrid] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // Méthodes de prédiction disponibles
  const predictionMethods = [
    { value: 'frequency', label: t('predictions.methods.frequency'), description: t('predictions.descriptions.frequency') },
    { value: 'rarity', label: t('predictions.methods.rarity'), description: t('predictions.descriptions.rarity') },
    { value: 'pattern', label: t('predictions.methods.pattern'), description: t('predictions.descriptions.pattern') },
    { value: 'random', label: t('predictions.methods.random'), description: t('predictions.descriptions.random') }
  ];
  
  useEffect(() => {
    generatePrediction(predictionMethods[tabValue].value);
  }, [tabValue]);
  
  const generatePrediction = async (predictionMethod) => {
    try {
      setLoading(true);
      setMethod(predictionMethod);
      setError(null);
      
      const response = await predictionsApi.generate(predictionMethod);
      setPrediction(response.data);
      
    } catch (err) {
      console.error('Erreur lors de la génération de la prédiction:', err);
      setError(err.message || 'Une erreur est survenue lors de la génération de la prédiction');
    } finally {
      setLoading(false);
    }
  };
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  const handleRegeneratePrediction = () => {
    generatePrediction(method);
  };
  
  const handleSaveGrid = () => {
    setSaveDialogOpen(true);
  };
  
  const handleSaveDialogClose = () => {
    setSaveDialogOpen(false);
  };
  
  const handleSaveSubmit = async (gridName) => {
    if (!prediction) return;
    
    try {
      setSavingGrid(true);
      
      await gridsApi.add({
        numbers: prediction.prediction.numbers,
        stars: prediction.prediction.stars,
        name: gridName || `Prédiction ${new Date().toLocaleDateString()}`
      });
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      
    } catch (err) {
      console.error('Erreur lors de l\'enregistrement de la grille:', err);
      setError(err.message || 'Une erreur est survenue lors de l\'enregistrement de la grille');
    } finally {
      setSavingGrid(false);
      setSaveDialogOpen(false);
    }
  };
  
  return (
    <Box sx={{ flexGrow: 1, py: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        {t('predictions.title')}
      </Typography>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="body1" paragraph>
          {t('predictions.description')}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t('predictions.disclaimer')}
        </Typography>
      </Paper>
      
      {saveSuccess && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {t('predictions.gridSavedSuccess')}
        </Alert>
      )}
      
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          aria-label="prediction methods tabs"
        >
          {predictionMethods.map((method, index) => (
            <Tab key={method.value} label={method.label} id={`tab-${index}`} aria-controls={`tabpanel-${index}`} />
          ))}
        </Tabs>
      </Paper>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              {t('predictions.currentPrediction')}
            </Typography>
            
            {loading ? (
              <Box sx={{ width: '100%', py: 4, textAlign: 'center' }}>
                <CircularProgress />
                <Typography variant="body2" sx={{ mt: 2 }}>
                  {t('predictions.generating')}
                </Typography>
              </Box>
            ) : error ? (
              <Alert severity="error" sx={{ my: 2 }}>
                {error}
              </Alert>
            ) : prediction ? (
              <Box>
                <PredictionDisplay prediction={prediction} />
                
                <Divider sx={{ my: 2 }} />
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                  <Button 
                    variant="outlined" 
                    onClick={handleRegeneratePrediction}
                    disabled={loading}
                  >
                    {t('predictions.regenerate')}
                  </Button>
                  
                  <Button 
                    variant="contained" 
                    color="primary"
                    onClick={handleSaveGrid}
                    disabled={loading}
                  >
                    {t('predictions.saveGrid')}
                  </Button>
                </Box>
              </Box>
            ) : (
              <Alert severity="info">
                {t('predictions.noPrediction')}
              </Alert>
            )}
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {prediction ? predictionMethods[tabValue].label : t('predictions.selectMethod')}
              </Typography>
              
              <Typography variant="body2" color="text.secondary" paragraph>
                {prediction ? predictionMethods[tabValue].description : t('predictions.selectMethodDescription')}
              </Typography>
              
              {prediction && (
                <>
                  <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                    {t('predictions.confidenceScore')}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Box sx={{ width: '100%', mr: 1 }}>
                      <LinearProgress 
                        variant="determinate" 
                        value={prediction.confidenceScore * 100} 
                        color={prediction.confidenceScore > 0.5 ? "success" : "warning"}
                      />
                    </Box>
                    <Box sx={{ minWidth: 35 }}>
                      <Typography variant="body2" color="text.secondary">
                        {Math.round(prediction.confidenceScore * 100)}%
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                    {prediction.explanation}
                  </Typography>
                </>
              )}
            </CardContent>
            
            <CardActions>
              <Button 
                size="small" 
                onClick={() => setTabValue((tabValue + 1) % predictionMethods.length)}
                disabled={loading}
              >
                {t('predictions.tryAnotherMethod')}
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>
      
      <SaveGridDialog 
        open={saveDialogOpen} 
        onClose={handleSaveDialogClose} 
        onSubmit={handleSaveSubmit}
        loading={savingGrid}
      />
    </Box>
  );
};

export default Predictions;
