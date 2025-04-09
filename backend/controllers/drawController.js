const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const dbPath = path.join(__dirname, '../db/euromillions.sqlite');

// Fonction utilitaire pour obtenir une connexion à la base de données
const getDb = () => new sqlite3.Database(dbPath);

/**
 * Récupère tous les tirages
 */
const getAllDraws = (req, res) => {
  const db = getDb();
  
  db.all('SELECT * FROM draws ORDER BY date(draw_date) DESC', [], (err, rows) => {
    db.close();
    
    if (err) {
      console.error('Erreur lors de la récupération des tirages:', err.message);
      return res.status(500).json({ error: 'Erreur lors de la récupération des tirages' });
    }
    
    // Formater les résultats
    const draws = rows.map(row => ({
      id: row.id,
      date: row.draw_date,
      numbers: row.numbers.split(',').map(num => parseInt(num, 10)),
      stars: row.stars.split(',').map(star => parseInt(star, 10)),
      jackpot: row.jackpot,
      winners: row.jackpot_winners
    }));
    
    res.json({ draws });
  });
};

/**
 * Récupère le dernier tirage
 */
const getLatestDraw = (req, res) => {
  const db = getDb();
  
  db.get('SELECT * FROM draws ORDER BY date(draw_date) DESC LIMIT 1', [], (err, row) => {
    db.close();
    
    if (err) {
      console.error('Erreur lors de la récupération du dernier tirage:', err.message);
      return res.status(500).json({ error: 'Erreur lors de la récupération du dernier tirage' });
    }
    
    if (!row) {
      return res.status(404).json({ error: 'Aucun tirage trouvé' });
    }
    
    // Formater le résultat
    const draw = {
      id: row.id,
      date: row.draw_date,
      numbers: row.numbers.split(',').map(num => parseInt(num, 10)),
      stars: row.stars.split(',').map(star => parseInt(star, 10)),
      jackpot: row.jackpot,
      winners: row.jackpot_winners
    };
    
    res.json(draw);
  });
};

/**
 * Récupère un tirage par sa date
 */
const getDrawByDate = (req, res) => {
  const { date } = req.params;
  const db = getDb();
  
  db.get('SELECT * FROM draws WHERE draw_date = ?', [date], (err, row) => {
    db.close();
    
    if (err) {
      console.error(`Erreur lors de la récupération du tirage du ${date}:`, err.message);
      return res.status(500).json({ error: `Erreur lors de la récupération du tirage du ${date}` });
    }
    
    if (!row) {
      return res.status(404).json({ error: `Aucun tirage trouvé pour la date ${date}` });
    }
    
    // Formater le résultat
    const draw = {
      id: row.id,
      date: row.draw_date,
      numbers: row.numbers.split(',').map(num => parseInt(num, 10)),
      stars: row.stars.split(',').map(star => parseInt(star, 10)),
      jackpot: row.jackpot,
      winners: row.jackpot_winners
    };
    
    res.json(draw);
  });
};

/**
 * Ajoute un nouveau tirage
 */
const addDraw = (req, res) => {
  const { date, numbers, stars, jackpot, winners } = req.body;
  
  // Validation des données
  if (!date || !numbers || !stars) {
    return res.status(400).json({ error: 'Les champs date, numbers et stars sont obligatoires' });
  }
  
  // Conversion des tableaux en chaînes
  const numbersStr = numbers.join(',');
  const starsStr = stars.join(',');
  
  const db = getDb();
  
  const sql = `
    INSERT INTO draws (draw_date, numbers, stars, jackpot, jackpot_winners)
    VALUES (?, ?, ?, ?, ?)
  `;
  
  db.run(sql, [date, numbersStr, starsStr, jackpot || null, winners || null], function(err) {
    db.close();
    
    if (err) {
      console.error(`Erreur lors de l'ajout du tirage:`, err.message);
      return res.status(500).json({ error: "Erreur lors de l'ajout du tirage" });
    }
    
    res.status(201).json({
      id: this.lastID,
      date,
      numbers,
      stars,
      jackpot,
      winners
    });
  });
};

/**
 * Met à jour un tirage existant
 */
const updateDraw = (req, res) => {
  const { id } = req.params;
  const { date, numbers, stars, jackpot, winners } = req.body;
  
  const updates = [];
  const params = [];
  
  if (date) {
    updates.push('draw_date = ?');
    params.push(date);
  }
  
  if (numbers) {
    updates.push('numbers = ?');
    params.push(numbers.join(','));
  }
  
  if (stars) {
    updates.push('stars = ?');
    params.push(stars.join(','));
  }
  
  if (jackpot !== undefined) {
    updates.push('jackpot = ?');
    params.push(jackpot);
  }
  
  if (winners !== undefined) {
    updates.push('jackpot_winners = ?');
    params.push(winners);
  }
  
  if (updates.length === 0) {
    return res.status(400).json({ error: 'Aucune donnée fournie pour la mise à jour' });
  }
  
  const db = getDb();
  
  // Ajouter l'ID à la fin des paramètres
  params.push(id);
  
  const sql = `UPDATE draws SET ${updates.join(', ')} WHERE id = ?`;
  
  db.run(sql, params, function(err) {
    db.close();
    
    if (err) {
      console.error(`Erreur lors de la mise à jour du tirage (ID: ${id}):`, err.message);
      return res.status(500).json({ error: 'Erreur lors de la mise à jour du tirage' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: `Aucun tirage trouvé avec l'ID ${id}` });
    }
    
    res.json({
      id: parseInt(id),
      message: `Tirage (ID: ${id}) mis à jour avec succès`,
      changes: this.changes
    });
  });
};

/**
 * Supprime un tirage
 */
const deleteDraw = (req, res) => {
  const { id } = req.params;
  const db = getDb();
  
  db.run('DELETE FROM draws WHERE id = ?', [id], function(err) {
    db.close();
    
    if (err) {
      console.error(`Erreur lors de la suppression du tirage (ID: ${id}):`, err.message);
      return res.status(500).json({ error: 'Erreur lors de la suppression du tirage' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: `Aucun tirage trouvé avec l'ID ${id}` });
    }
    
    res.json({ message: `Tirage (ID: ${id}) supprimé avec succès` });
  });
};

module.exports = {
  getAllDraws,
  getLatestDraw,
  getDrawByDate,
  addDraw,
  updateDraw,
  deleteDraw
};
