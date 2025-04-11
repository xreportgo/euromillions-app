// src/pages/SavedGrids.js
import React, { useState, useEffect } from 'react';
import { getStoredGrids, deleteGrid, saveGrid } from '../services/gridService';
import { toast } from 'react-toastify';

const SavedGrids = () => {
  const [grids, setGrids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  
  // États du formulaire
  const [gridName, setGridName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedNumbers, setSelectedNumbers] = useState([]);
  const [selectedStars, setSelectedStars] = useState([]);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState(null);

  // Charger les grilles au chargement de la page
  useEffect(() => {
    fetchGrids();
  }, []);

  // Réinitialiser formSubmitted après un certain temps
  useEffect(() => {
    if (formSubmitted) {
      const timer = setTimeout(() => {
        setFormSubmitted(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [formSubmitted]);

  const fetchGrids = async () => {
    setLoading(true);
    try {
      const storedGrids = await getStoredGrids();
      setGrids(storedGrids || []);
      setError(null);
    } catch (err) {
      console.error('Erreur lors du chargement des grilles:', err);
      setError('Impossible de charger vos grilles sauvegardées');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGrid = () => {
    // Réinitialiser le formulaire
    setGridName('');
    setDescription('');
    setSelectedNumbers([]);
    setSelectedStars([]);
    setFormError(null);
    
    // Afficher le formulaire
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
  };

  const handleDeleteGrid = async (gridId) => {
    try {
      await deleteGrid(gridId);
      toast.success('Grille supprimée avec succès');
      fetchGrids(); // Actualiser la liste
    } catch (err) {
      console.error('Erreur lors de la suppression de la grille:', err);
      toast.error('Erreur lors de la suppression de la grille');
    }
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

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    
    // Validation
    if (selectedNumbers.length !== 5) {
      setFormError('Veuillez sélectionner 5 numéros');
      return;
    }
    
    if (selectedStars.length !== 2) {
      setFormError('Veuillez sélectionner 2 étoiles');
      return;
    }
    
    setSaving(true);
    
    try {
      const newGrid = {
        name: gridName.trim() || `Grille du ${new Date().toLocaleDateString()}`,
        description: description.trim(),
        numbers: selectedNumbers,
        stars: selectedStars,
        createdAt: new Date().toISOString()
      };
      
      console.log('Données de la grille à sauvegarder:', newGrid);
      
      await saveGrid(newGrid);
      toast.success('Grille sauvegardée avec succès !');
      
      // Fermer le formulaire et indiquer qu'il a été soumis
      setShowForm(false);
      setFormSubmitted(true);
      
      // Recharger les grilles
      fetchGrids();
    } catch (err) {
      console.error('Erreur lors de la sauvegarde de la grille:', err);
      setFormError('Erreur lors de la sauvegarde de la grille');
      toast.error('Erreur lors de la sauvegarde de la grille');
    } finally {
      setSaving(false);
    }
  };

  // Générer les boutons de numéros (1-50)
  const renderNumberButtons = () => {
    return Array.from({ length: 50 }, (_, i) => i + 1).map(num => (
      <button
        key={`number-${num}`}
        className={`number-button ${selectedNumbers.includes(num) ? 'selected' : ''}`}
        onClick={() => handleNumberSelect(num)}
        type="button"
      >
        {num}
      </button>
    ));
  };

  // Générer les boutons d'étoiles (1-12)
  const renderStarButtons = () => {
    return Array.from({ length: 12 }, (_, i) => i + 1).map(star => (
      <button
        key={`star-${star}`}
        className={`star-button ${selectedStars.includes(star) ? 'selected' : ''}`}
        onClick={() => handleStarSelect(star)}
        type="button"
      >
        {star}
      </button>
    ));
  };

  return (
    <div className="container">
      <h1 className="text-center">Mes Grilles</h1>
      <p className="text-center">Gérez vos grilles EuroMillions sauvegardées et créez-en de nouvelles.</p>
      
      {/* Message d'erreur */}
      {error && (
        <div className="error-alert">
          {error}
          <button 
            style={{marginLeft: '20px', padding: '5px 10px', border: 'none', background: '#c62828', color: 'white', borderRadius: '4px', cursor: 'pointer'}}
            onClick={fetchGrids}
          >
            Réessayer
          </button>
        </div>
      )}
      
      {/* Message de succès */}
      {formSubmitted && (
        <div className="success-alert">
          Grille sauvegardée avec succès !
        </div>
      )}
      
      {/* Bouton de création de grille */}
      <div className="text-center">
        <button 
          className="create-button"
          onClick={handleCreateGrid}
          disabled={loading}
        >
          Créer une nouvelle grille
        </button>
      </div>
      
      {/* Formulaire de création de grille */}
      {showForm && (
        <div className="grid-form">
          <div className="form-header">
            <div className="form-title">Créer une nouvelle grille</div>
            <button className="close-button" onClick={handleFormClose}>✕</button>
          </div>
          
          <div className="form-divider"></div>
          
          <form onSubmit={handleFormSubmit}>
            <div className="form-row">
              <div className="form-field">
                <label className="form-label">Nom de la grille (optionnel)</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Ex: Ma grille porte-bonheur"
                  value={gridName}
                  onChange={(e) => setGridName(e.target.value)}
                />
              </div>
              
              <div className="form-field">
                <label className="form-label">Description (optionnel)</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Une description pour votre grille"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>
            
            <div className="form-section-title">
              <h3>Sélectionnez vos numéros</h3>
              <button 
                className="refresh-button" 
                title="Générer une grille aléatoire"
                type="button"
                onClick={generateRandomGrid}
              >
                🔄
              </button>
            </div>
            
            <p>Sélectionnez 5 numéros (1-50) et 2 étoiles (1-12)</p>
            
            <h4>Numéros</h4>
            <div className="numbers-grid">
              {renderNumberButtons()}
            </div>
            
            <h4>Étoiles</h4>
            <div className="stars-grid">
              {renderStarButtons()}
            </div>
            
            {formError && (
              <div className="error-text">{formError}</div>
            )}
            
            <div className="form-actions">
              <button 
                className="cancel-button"
                type="button"
                onClick={handleFormClose}
                disabled={saving}
              >
                Annuler
              </button>
              
              <button 
                className="save-button"
                type="submit"
                disabled={saving || selectedNumbers.length !== 5 || selectedStars.length !== 2}
              >
                {saving ? 'Sauvegarde...' : 'Sauvegarder la grille'}
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* Affichage des grilles */}
      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Chargement de vos grilles...</p>
        </div>
      ) : grids.length === 0 ? (
        <div className="empty-state">
          <h3>Vous n'avez pas encore de grilles sauvegardées.</h3>
          <p>Créez votre première grille en cliquant sur le bouton ci-dessus.</p>
        </div>
      ) : (
        <>
          <h2>Mes Grilles Sauvegardées</h2>
          <div className="grids-container">
            {grids.map(grid => (
              <div className="grid-card" key={grid.id}>
                <h3>{grid.name || `Grille #${grid.id.substring(0, 8)}`}</h3>
                <div className="grid-date">
                  Créée le: {new Date(grid.createdAt).toLocaleDateString()}
                </div>
                
                <div className="mini-numbers">
                  {grid.numbers.map(num => (
                    <div className="mini-number" key={`grid-${grid.id}-num-${num}`}>{num}</div>
                  ))}
                </div>
                <div className="mini-numbers">
                  {grid.stars.map(star => (
                    <div className="mini-star" key={`grid-${grid.id}-star-${star}`}>{star}</div>
                  ))}
                </div>
                
                <div className="grid-actions">
                  <button className="grid-button view-button">Détails</button>
                  <button 
                    className="grid-button delete-button"
                    onClick={() => handleDeleteGrid(grid.id)}
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default SavedGrids;
