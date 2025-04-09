/**
 * Middleware de limitation de taux pour éviter les abus d'API
 * Pour une version de production, on utiliserait un système plus robuste avec Redis
 */

// Stockage en mémoire simple pour les requêtes
const requestStore = {};

// Middleware de limitation de taux simple
const rateLimiter = (maxRequests = 100, windowMs = 60 * 1000) => {
  return (req, res, next) => {
    // Utiliser l'IP comme identifiant (ou le user.id si l'utilisateur est connecté)
    const identifier = req.user ? req.user.id : req.ip;
    
    // Initialiser le compteur de requêtes si nécessaire
    if (!requestStore[identifier]) {
      requestStore[identifier] = {
        count: 0,
        resetTime: Date.now() + windowMs
      };
    }
    
    // Réinitialiser le compteur si le délai est passé
    if (Date.now() > requestStore[identifier].resetTime) {
      requestStore[identifier] = {
        count: 0,
        resetTime: Date.now() + windowMs
      };
    }
    
    // Vérifier le nombre de requêtes
    if (requestStore[identifier].count >= maxRequests) {
      return res.status(429).json({
        error: 'Trop de requêtes. Veuillez réessayer plus tard.',
        retryAfter: Math.ceil((requestStore[identifier].resetTime - Date.now()) / 1000)
      });
    }
    
    // Incrémenter le compteur
    requestStore[identifier].count++;
    
    // Ajouter des en-têtes informatifs
    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', maxRequests - requestStore[identifier].count);
    res.setHeader('X-RateLimit-Reset', Math.ceil(requestStore[identifier].resetTime / 1000));
    
    next();
  };
};

// Limiter le nombre de prédictions (plus restrictif car calcul intensif)
const predictionLimiter = rateLimiter(20, 60 * 60 * 1000); // 20 requêtes par heure

// Limiter le nombre de générations de grilles
const gridLimiter = rateLimiter(50, 60 * 60 * 1000); // 50 requêtes par heure

// Limiter les autres requêtes API
const apiLimiter = rateLimiter(100, 60 * 1000); // 100 requêtes par minute

module.exports = {
  rateLimiter,
  predictionLimiter,
  gridLimiter,
  apiLimiter
};
