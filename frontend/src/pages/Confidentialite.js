// frontend/src/pages/Confidentialite.js
import React from 'react';

const Confidentialite = () => {
  return (
    <div className="legal-page">
      <h2>Politique de confidentialité</h2>
      
      <div className="content-card">
        <p>
          Cette application respecte votre vie privée et s'engage à protéger les données personnelles que vous pourriez nous fournir.
        </p>
        
        <p>
          <strong>Données collectées :</strong> Notre application ne collecte aucune donnée personnelle sans votre consentement explicite.
        </p>
        
        <p>
          <strong>Cookies et stockage local :</strong> Nous utilisons le stockage local de votre navigateur uniquement pour sauvegarder vos préférences d'utilisation et vos grilles enregistrées. Ces données ne quittent pas votre appareil.
        </p>
        
        <p>
          <strong>Sécurité :</strong> Toutes les connexions à notre serveur sont sécurisées par HTTPS pour protéger l'intégrité et la confidentialité des données.
        </p>
        
        <p>
          <strong>Tiers :</strong> Nous ne partageons aucune information avec des tiers.
        </p>
      </div>
    </div>
  );
};

export default Confidentialite;
