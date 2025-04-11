// src/components/EuromillionsGrid.js
import React from 'react';
import { Box, Typography, Grid, Button } from '@mui/material';
import { useTheme } from '@mui/material/styles';

/**
 * Composant pour afficher et interagir avec une grille EuroMillions
 * @param {Object} props
 * @param {Array<number>} props.numbers - Numéros sélectionnés (1-50)
 * @param {Array<number>} props.stars - Étoiles sélectionnées (1-12)
 * @param {Function} props.onNumberSelect - Fonction appelée lors de la sélection d'un numéro
 * @param {Function} props.onStarSelect - Fonction appelée lors de la sélection d'une étoile
 * @param {boolean} props.readOnly - Si true, la grille est en lecture seule
 * @param {boolean} props.miniDisplay - Si true, affichage compact
 */
const EuromillionsGrid = ({
  numbers = [],
  stars = [],
  onNumberSelect,
  onStarSelect,
  readOnly = false,
  miniDisplay = false
}) => {
  const theme = useTheme();
  
  // Création des boutons de numéros (1-50)
  const renderNumbers = () => {
    return Array.from({ length: 50 }, (_, i) => i + 1).map(num => (
      <Grid item key={`number-${num}`} xs={miniDisplay ? 1 : 2} sm={miniDisplay ? 'auto' : 1}>
        <Button
          variant={numbers.includes(num) ? "contained" : "outlined"}
          color="primary"
          onClick={() => !readOnly && onNumberSelect && onNumberSelect(num)}
          disabled={readOnly}
          sx={{
            minWidth: miniDisplay ? '30px' : '36px',
            height: miniDisplay ? '30px' : '36px',
            padding: miniDisplay ? '0px' : '6px',
            borderRadius: '50%',
            fontSize: miniDisplay ? '0.75rem' : '0.875rem'
          }}
        >
          {num}
        </Button>
      </Grid>
    ));
  };
  
  // Création des boutons d'étoiles (1-12)
  const renderStars = () => {
    return Array.from({ length: 12 }, (_, i) => i + 1).map(star => (
      <Grid item key={`star-${star}`} xs={miniDisplay ? 1 : 3} sm={miniDisplay ? 'auto' : 2}>
        <Button
          variant={stars.includes(star) ? "contained" : "outlined"}
          color="secondary"
          onClick={() => !readOnly && onStarSelect && onStarSelect(star)}
          disabled={readOnly}
          sx={{
            minWidth: miniDisplay ? '30px' : '36px',
            height: miniDisplay ? '30px' : '36px',
            padding: miniDisplay ? '0px' : '6px',
            borderRadius: '50%',
            fontSize: miniDisplay ? '0.75rem' : '0.875rem',
            bgcolor: stars.includes(star) ? 'secondary.main' : 'transparent',
            '&:hover': {
              bgcolor: stars.includes(star) ? 'secondary.dark' : 'rgba(255, 215, 0, 0.1)'
            }
          }}
        >
          {star}
        </Button>
      </Grid>
    ));
  };
  
  // Affichage simplifié pour le mode mini
  if (miniDisplay) {
    return (
      <Box sx={{ textAlign: 'center' }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 1 }}>
          {numbers.map(num => (
            <Box 
              key={`mini-num-${num}`}
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 28,
                height: 28,
                borderRadius: '50%',
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                fontWeight: 'bold',
                fontSize: '0.75rem'
              }}
            >
              {num}
            </Box>
          ))}
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
          {stars.map(star => (
            <Box 
              key={`mini-star-${star}`}
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 28,
                height: 28,
                borderRadius: '50%',
                bgcolor: 'secondary.main',
                color: 'secondary.contrastText',
                fontWeight: 'bold',
                fontSize: '0.75rem'
              }}
            >
              {star}
            </Box>
          ))}
        </Box>
      </Box>
    );
  }
  
  return (
    <Box>
      {!readOnly && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Sélectionnez 5 numéros (1-50) et 2 étoiles (1-12)
          </Typography>
        </Box>
      )}
      
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          Numéros
        </Typography>
        <Grid container spacing={1}>
          {renderNumbers()}
        </Grid>
      </Box>
      
      <Box>
        <Typography variant="subtitle1" gutterBottom>
          Étoiles
        </Typography>
        <Grid container spacing={1}>
          {renderStars()}
        </Grid>
      </Box>
      
      {readOnly && (
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography variant="body1" fontWeight="bold">
            {numbers.join(' - ')} | {stars.join(' - ')}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default EuromillionsGrid;
