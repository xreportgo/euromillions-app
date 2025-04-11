// src/components/CreateGridForm.js
import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Divider,
  IconButton,
  Tooltip,
  CircularProgress
} from '@mui/material';
import { Close as CloseIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import { toast } from 'react-toastify';
import { saveGrid } from '../services/gridService';
import EuromillionsGrid from './EuromillionsGrid';

const CreateGridForm = ({ onClose, onSubmit }) => {
  const [gridName, setGridName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedNumbers, setSelectedNumbers] = useState([]);
  const [selectedStars, setSelectedStars] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const generateRandomGrid = () => {
    // Générer 5 nombres aléatoires (1-50) sans doublons
    const allNumbers = Array.from({ length: 50 }, (_, i) => i + 1);
    const numbers = [];
    for (let i = 0; i < 5; i++) {
      const randomIndex = Math.floor(Math.random() * allNumbers.length);
      numbers.push(allNumbers[randomIndex]);
      allNumbers.splice(randomIndex, 1);
    }
    
    // Générer 2 étoiles aléatoires (1-12) sans doublons
    const allStars = Array.from({ length: 12 }, (_, i) => i + 1);
    const stars = [];
    for (let i = 0; i < 2; i++) {
      const randomIndex = Math.floor(Math.random() * allStars.length);
      stars.push(allStars[randomIndex]);
      allStars.splice(randomIndex, 1);
    }
    
    // Trier les nombres et étoiles
    setSelectedNumbers(numbers.sort((a, b) => a - b));
    setSelectedStars(stars.sort((a, b) => a - b));
  };

  const handleNumberSelect = (number) => {
    if (selectedNumbers.includes(number)) {
      setSelectedNumbers(selectedNumbers.filter(n => n !== number));
    } else if (selectedNumbers.length < 5) {
      setSelectedNumbers([...selectedNumbers, number].sort((a, b) => a - b));
    } else {
      toast.warning('Vous ne pouvez sélectionner que 5 numéros');
    }
  };

  const handleStarSelect = (star) => {
    if (selectedStars.includes(star)) {
      setSelectedStars(selectedStars.filter(s => s !== star));
    } else if (selectedStars.length < 2) {
      setSelectedStars([...selectedStars, star].sort((a, b) => a - b));
    } else {
      toast.warning('Vous ne pouvez sélectionner que 2 étoiles');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    // Validation
    if (selectedNumbers.length !== 5) {
      setError('Veuillez sélectionner 5 numéros');
      return;
    }
    
    if (selectedStars.length !== 2) {
      setError('Veuillez sélectionner 2 étoiles');
      return;
    }
    
    setSaving(true);
    
    try {
      // Créer l'objet grille avec les données sélectionnées
      const newGrid = {
        name: gridName.trim() || `Grille du ${new Date().toLocaleDateString()}`,
        description: description.trim(),
        numbers: selectedNumbers,
        stars: selectedStars,
        createdAt: new Date().toISOString()
      };
      
      // Ajouter des logs pour le débogage
      console.log('Données de la grille à sauvegarder:', newGrid);
      
      // Sauvegarder la grille
      const savedGrid = await saveGrid(newGrid);
      
      // Vérifier que la grille sauvegardée est valide
      if (!savedGrid) {
        throw new Error('La sauvegarde a échoué, aucun résultat retourné.');
      }
      
      // Ajouter des logs pour le débogage
      console.log('Réponse de saveGrid:', savedGrid);
      
      // Afficher une notification de succès
      toast.success('Grille sauvegardée avec succès !');
      
      // Appeler la fonction onSubmit si elle est fournie
      if (onSubmit) {
        // Passer la grille sauvegardée à onSubmit
        onSubmit();
      }
    } catch (err) {
      // Journaliser l'erreur
      console.error('Erreur lors de la sauvegarde de la grille:', err);
      
      // Définir le message d'erreur
      setError(err.message || 'Erreur lors de la sauvegarde de la grille');
      
      // Afficher une notification d'erreur
      toast.error('Erreur lors de la sauvegarde de la grille');
    } finally {
      // Réinitialiser l'état de sauvegarde
      setSaving(false);
    }
  };

  return (
    <Paper
      elevation={3}
      sx={{ p: 3, mb: 4, position: 'relative', maxWidth: '800px', mx: 'auto' }}
    >
      <IconButton
        aria-label="Fermer"
        onClick={onClose}
        sx={{ position: 'absolute', top: 8, right: 8 }}
      >
        <CloseIcon />
      </IconButton>
      
      <Typography variant="h5" component="h2" gutterBottom>
        Créer une nouvelle grille
      </Typography>
      
      <Divider sx={{ my: 2 }} />
      
      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Nom de la grille (optionnel)"
              variant="outlined"
              fullWidth
              value={gridName}
              onChange={(e) => setGridName(e.target.value)}
              placeholder="Ex: Ma grille porte-bonheur"
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              label="Description (optionnel)"
              variant="outlined"
              fullWidth
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Une description pour votre grille"
            />
          </Grid>
          
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Sélectionnez vos numéros</Typography>
              <Tooltip title="Générer une grille aléatoire">
                <IconButton 
                  color="primary" 
                  onClick={generateRandomGrid}
                  aria-label="Générer une grille aléatoire"
                >
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
            </Box>
            
            <EuromillionsGrid
              numbers={selectedNumbers}
              stars={selectedStars}
              onNumberSelect={handleNumberSelect}
              onStarSelect={handleStarSelect}
            />
            
            {error && (
              <Typography color="error" variant="body2" sx={{ mt: 2 }}>
                {error}
              </Typography>
            )}
          </Grid>
          
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
              <Button
                variant="outlined"
                onClick={onClose}
                disabled={saving}
              >
                Annuler
              </Button>
              
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={saving || selectedNumbers.length !== 5 || selectedStars.length !== 2}
                startIcon={saving && <CircularProgress size={20} color="inherit" />}
              >
                {saving ? 'Sauvegarde...' : 'Sauvegarder la grille'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
};

export default CreateGridForm;
