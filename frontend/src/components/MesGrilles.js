import React, { useState, useEffect, useCallback } from 'react';
import { 
  Container, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  Button, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  CircularProgress
} from '@mui/material';
import { toast } from 'react-toastify';
import { getStoredGrids, deleteGrid } from '../services/gridService';
import EuromillionsGrid from './EuromillionsGrid';

const MesGrilles = () => {
  const [grilles, setGrilles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedGrid, setSelectedGrid] = useState(null);

  // Utilisation de useCallback pour éviter des rendus inutiles
  const fetchGrilles = useCallback(async () => {
    setLoading(true);
    try {
      const storedGrids = await getStoredGrids();
      setGrilles(storedGrids || []);
      setError(null);
    } catch (err) {
      console.error('Erreur lors du chargement des grilles:', err);
      setError('Impossible de charger vos grilles sauvegardées');
      toast.error('Erreur lors du chargement de vos grilles');
    } finally {
      setLoading(false);
    }
  }, []); // Aucune dépendance, la fonction reste stable

  useEffect(() => {
    fetchGrilles();
  }, [fetchGrilles]); // Ajout de fetchGrilles comme dépendance

  const handleOpenDialog = (grid) => {
    setSelectedGrid(grid);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedGrid(null);
  };

  const handleDeleteGrid = async (gridId) => {
    try {
      await deleteGrid(gridId);
      toast.success('Grille supprimée avec succès');
      fetchGrilles(); // Actualiser la liste après suppression
    } catch (err) {
      console.error('Erreur lors de la suppression de la grille:', err);
      toast.error('Erreur lors de la suppression de la grille');
    } finally {
      handleCloseDialog();
    }
  };

  if (loading) {
    return (
      <Container style={{ textAlign: 'center', padding: '50px 0' }}>
        <CircularProgress />
        <Typography variant="h6" style={{ marginTop: 20 }}>
          Chargement de vos grilles...
        </Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container style={{ textAlign: 'center', padding: '50px 0' }}>
        <Typography variant="h6" color="error">
          {error}
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          style={{ marginTop: 20 }}
          onClick={fetchGrilles}
        >
          Réessayer
        </Button>
      </Container>
    );
  }

  if (grilles.length === 0) {
    return (
      <Container style={{ textAlign: 'center', padding: '50px 0' }}>
        <Typography variant="h6">
          Vous n'avez pas encore de grilles sauvegardées.
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          style={{ marginTop: 20 }}
          href="/create-grid"
        >
          Créer une grille
        </Button>
      </Container>
    );
  }

  return (
    <Container>
      <Typography variant="h4" component="h1" gutterBottom>
        Mes Grilles Sauvegardées
      </Typography>
      
      <Grid container spacing={3}>
        {grilles.map((grille) => (
          <Grid item xs={12} sm={6} md={4} key={grille.id}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {grille.name || `Grille #${grille.id.substring(0, 8)}`}
                </Typography>
                
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Créée le: {new Date(grille.createdAt).toLocaleDateString()}
                </Typography>
                
                <EuromillionsGrid 
                  numbers={grille.numbers} 
                  stars={grille.stars} 
                  readOnly
                  miniDisplay
                />
                
                <div style={{ marginTop: 20, display: 'flex', justifyContent: 'space-between' }}>
                  <Button 
                    variant="outlined" 
                    color="primary" 
                    size="small"
                    onClick={() => handleOpenDialog(grille)}
                  >
                    Détails
                  </Button>
                  
                  <Button 
                    variant="outlined" 
                    color="error" 
                    size="small"
                    onClick={() => handleDeleteGrid(grille.id)}
                  >
                    Supprimer
                  </Button>
                </div>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      
      {selectedGrid && (
        <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md">
          <DialogTitle>
            {selectedGrid.name || `Grille #${selectedGrid.id.substring(0, 8)}`}
          </DialogTitle>
          
          <DialogContent>
            <Typography variant="body2" color="textSecondary" paragraph>
              Créée le: {new Date(selectedGrid.createdAt).toLocaleDateString()}
            </Typography>
            
            <Typography variant="body2" paragraph>
              {selectedGrid.description || "Aucune description"}
            </Typography>
            
            <EuromillionsGrid 
              numbers={selectedGrid.numbers} 
              stars={selectedGrid.stars} 
              readOnly
            />
          </DialogContent>
          
          <DialogActions>
            <Button onClick={handleCloseDialog} color="primary">
              Fermer
            </Button>
            <Button onClick={() => handleDeleteGrid(selectedGrid.id)} color="error">
              Supprimer
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Container>
  );
};

export default MesGrilles;
