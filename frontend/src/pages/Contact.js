// frontend/src/pages/Contact.js
import React from 'react';

const Contact = () => {
  return (
    <div className="legal-page">
      <h2>Contact</h2>
      
      <div className="content-card">
        <p>
          Pour toute question ou suggestion concernant cette application, vous pouvez nous contacter à l'adresse suivante :
        </p>
        
        <p className="contact-email">
          <a href="mailto:contact@example.com">contact@example.com</a>
        </p>
        
        <p>
          Nous nous efforçons de répondre à toutes les demandes dans un délai de 48 heures.
        </p>
      </div>
    </div>
  );
};

export default Contact;
