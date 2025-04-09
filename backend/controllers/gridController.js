// controllers/gridController.js
const Grid = require('../models/gridModel');
const gridGenerationService = require('../services/gridGenerationService');

exports.getAllGrids = async (req, res) => {
  try {
    // Optionnel: filtrer par userId si l'authentification est implémentée
    // const userId = req.user.id;
    // const grids = await Grid.find({ userId }).sort({ createdAt: -1 });
    
    const grids = await Grid.find().sort({ createdAt: -1 });
    res.status(200).json(grids);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des grilles', error: error.message });
  }
};

exports.getGridById = async (req, res) => {
  try {
    const grid = await Grid.findById(req.params.id);
    if (!grid) {
      return res.status(404).json({ message: 'Grille non trouvée' });
    }
    res.status(200).json(grid);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération de la grille', error: error.message });
  }
};

exports.generateGrid = async (req, res) => {
  try {
    const { model, count, excludedNumbers, excludedStars } = req.body;
    
    // Utiliser le service de génération pour créer les grilles
    const grids = await gridGenerationService.generateGrids({
      model: model || 'random',
      count: parseInt(count) || 1,
      excludedNumbers: excludedNumbers || [],
      excludedStars: excludedStars || []
    });
    
    // Vérifier que les grilles ont été correctement générées
    if (!grids || !Array.isArray(grids)) {
      return res.status(500).json({ 
        message: 'Erreur lors de la génération des grilles',
        error: 'Format de données inattendu' 
      });
    }
    
    res.status(200).json(grids);
  } catch (error) {
    console.error('Grid generation error:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la génération des grilles', 
      error: error.message 
    });
  }
};


exports.saveGrid = async (req, res) => {
  try {
    const { name, numbers, stars, method, confidence } = req.body;
    
    // Validation des données
    if (!numbers || !stars || numbers.length !== 5 || stars.length !== 2) {
      return res.status(400).json({ message: 'Données de grille invalides' });
    }
    
    // Optionnel: associer à un utilisateur si authentification 
    // const userId = req.user.id;
    // const grid = new Grid({ name, numbers, stars, method, confidence, userId });
    
    const grid = new Grid({ 
      name: name || 'Grille enregistrée',
      numbers, 
      stars, 
      method: method || 'manual', 
      confidence: confidence || 0 
    });
    
    await grid.save();
    res.status(201).json(grid);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de l\'enregistrement de la grille', error: error.message });
  }
};

exports.updateGrid = async (req, res) => {
  try {
    const { name } = req.body;
    const grid = await Grid.findByIdAndUpdate(
      req.params.id, 
      { name },
      { new: true, runValidators: true }
    );
    
    if (!grid) {
      return res.status(404).json({ message: 'Grille non trouvée' });
    }
    
    res.status(200).json(grid);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la mise à jour de la grille', error: error.message });
  }
};

exports.deleteGrid = async (req, res) => {
  try {
    const grid = await Grid.findByIdAndDelete(req.params.id);
    
    if (!grid) {
      return res.status(404).json({ message: 'Grille non trouvée' });
    }
    
    res.status(200).json({ message: 'Grille supprimée avec succès' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la suppression de la grille', error: error.message });
  }
};

exports.exportGrids = async (req, res) => {
  try {
    // Récupérer les grilles (toutes ou filtrées par ID si spécifié)
    let grids;
    if (req.query.ids) {
      const ids = req.query.ids.split(',');
      grids = await Grid.find({ _id: { $in: ids } });
    } else {
      // Optionnel: filtrer par userId si authentification
      // const userId = req.user.id;
      // grids = await Grid.find({ userId });
      grids = await Grid.find();
    }
    
    // Format de sortie (CSV par défaut)
    const format = req.query.format || 'csv';
    
    if (format === 'json') {
      return res.status(200).json(grids);
    } else if (format === 'csv') {
      // Générer le CSV
      const csv = [
        'ID,Nom,Numéros,Étoiles,Méthode,Confiance,Date de création',
        ...grids.map(grid => {
          return `${grid._id},"${grid.name}","${grid.numbers.join('-')}","${grid.stars.join('-')}",${grid.method},${grid.confidence},${grid.createdAt}`
        })
      ].join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=grilles-euromillions.csv');
      return res.status(200).send(csv);
    } else {
      return res.status(400).json({ message: 'Format d\'export non pris en charge' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de l\'export des grilles', error: error.message });
  }
};
