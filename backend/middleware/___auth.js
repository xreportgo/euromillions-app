/**
 * Middleware d'authentification simplifiée.
 * Pour une version de production, il faudrait implémenter une authentification réelle avec JWT ou similaire.
 * Actuellement, ce middleware est un placeholder qui laisse passer toutes les requêtes.
 */

// Middleware d'authentification simplifiée
const auth = (req, res, next) => {
  // Pour l'instant, pas d'authentification réelle
  // Dans une version de production, on vérifierait ici un token JWT ou similaire
  
  // Ajouter un utilisateur fictif pour le développement
  req.user = {
    id: 1,
    username: 'user_test',
    role: 'user'
  };
  
  next();
};

// Middleware pour vérifier si l'utilisateur est un administrateur
const isAdmin = (req, res, next) => {
  // Vérifier si l'utilisateur existe et a le rôle d'admin
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Accès refusé: Droits d\'administrateur requis' });
  }
  
  next();
};

module.exports = {
  auth,
  isAdmin
};
