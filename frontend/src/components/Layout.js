// src/components/Layout.js
import React from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';

const Layout = ({ updateAvailable }) => {
  const location = useLocation();

  // Vérifier si un lien est actif
  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  // Récupérer l'année courante pour le copyright
  const currentYear = new Date().getFullYear();

  return (
    <>
      {/* Barre de navigation */}
      <div className="app-bar">
        <div className="app-bar-logo">
          <span className="euro-icon">€</span>
          <span>EuroMillions</span>
        </div>
        <div className="nav-links">
          <Link to="/" className={isActive('/')}>Accueil</Link>
          <Link to="/dernier-tirage" className={isActive('/dernier-tirage')}>Dernier Tirage</Link>
          <Link to="/historique" className={isActive('/historique')}>Historique</Link>
          <Link to="/statistiques" className={isActive('/statistiques')}>Statistiques</Link>
          <Link to="/predictions" className={isActive('/predictions')}>Prédictions</Link>
          <Link to="/mes-grilles" className={isActive('/mes-grilles')}>Mes Grilles</Link>
        </div>
      </div>
      
      {/* Contenu principal */}
      <main className="main-content">
        <Outlet />
      </main>
      
      {/* Pied de page */}
      <footer className="footer">
        <div className="footer-content">
          <div className="copyright">
            © {currentYear} EuroMillions App - Ce site n'est pas affilié à la FDJ.
          </div>
          <div className="footer-links">
            <Link to="/mentions-legales">Mentions légales</Link>
            <Link to="/confidentialite">Confidentialité</Link>
            <Link to="/contact">Contact</Link>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Layout;
