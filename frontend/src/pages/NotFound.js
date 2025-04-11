// frontend/src/pages/NotFound.js
import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="not-found-page">
      <h2>404 - Page non trouvée</h2>
      
      <div className="content-card">
        <p>La page que vous recherchez n'existe pas ou a été déplacée.</p>
        
        <div className="action-buttons">
          <Link to="/" className="button primary">
            Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
