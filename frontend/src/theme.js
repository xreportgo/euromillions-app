// src/theme.js
import { createTheme, responsiveFontSizes } from '@mui/material/styles';

// Définition des couleurs principales
const primaryColor = '#0a1f44'; // Bleu foncé
const secondaryColor = '#ffc107'; // Jaune/Or (couleur des étoiles)

// Créer le thème de base
let theme = createTheme({
  palette: {
    primary: {
      main: primaryColor,
      light: '#3b4b6b',
      dark: '#000020',
      contrastText: '#ffffff',
    },
    secondary: {
      main: secondaryColor,
      light: '#fff350',
      dark: '#c79100',
      contrastText: '#000000',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
    text: {
      primary: '#333333',
      secondary: '#666666',
    },
    // Couleurs supplémentaires pour les numéros et étoiles
    euromillions: {
      numbers: primaryColor,
      stars: secondaryColor,
    },
    // Définir des couleurs pour différentes significations
    success: {
      main: '#4caf50',
      light: '#81c784',
      dark: '#388e3c',
      contrastText: '#ffffff',
    },
    warning: {
      main: '#ff9800',
      light: '#ffb74d',
      dark: '#f57c00',
      contrastText: '#000000',
    },
    error: {
      main: '#f44336',
      light: '#e57373',
      dark: '#d32f2f',
      contrastText: '#ffffff',
    },
    info: {
      main: '#2196f3',
      light: '#64b5f6',
      dark: '#1976d2',
      contrastText: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 600,
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 500,
    },
    h6: {
      fontWeight: 500,
    },
    subtitle1: {
      fontWeight: 500,
    },
    button: {
      fontWeight: 500,
      textTransform: 'none', // Éviter les majuscules sur tous les boutons
    },
  },
  shape: {
    borderRadius: 8, // Arrondi des composants
  },
  components: {
    // Style personnalisé pour les cartes
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          transition: 'transform 0.2s, box-shadow 0.2s',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
          },
        },
      },
    },
    // Style personnalisé pour les boutons
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 20, // Boutons plus arrondis
          padding: '8px 16px',
        },
        containedPrimary: {
          boxShadow: '0 2px 8px rgba(10, 31, 68, 0.3)',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(10, 31, 68, 0.4)',
          },
        },
        containedSecondary: {
          boxShadow: '0 2px 8px rgba(255, 193, 7, 0.3)',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(255, 193, 7, 0.4)',
          },
        },
      },
    },
    // Style personnalisé pour les appbars
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    // Style personnalisé pour les papers
    MuiPaper: {
      styleOverrides: {
        rounded: {
          borderRadius: 12,
        },
        elevation1: {
          boxShadow: '0 1px 5px rgba(0, 0, 0, 0.08)',
        },
        elevation2: {
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.08)',
        },
        elevation3: {
          boxShadow: '0 3px 12px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    // Style personnalisé pour les chips
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
      },
    },
  },
});

// Rendre les tailles de police responsives
theme = responsiveFontSizes(theme);

export default theme;
