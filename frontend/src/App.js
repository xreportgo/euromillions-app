// frontend/src/App.js - Correction

import React, { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Import des pages
import Home from './pages/Home';
import LastDraw from './pages/LastDraw';
import DrawHistory from './pages/DrawHistory';
import Statistics from './pages/Statistics';
import Predictions from './pages/Predictions';
import SavedGrids from './pages/SavedGrids';
import MentionsLegales from './pages/MentionsLegales';
import Confidentialite from './pages/Confidentialite';
import Contact from './pages/Contact';
import NotFound from './pages/NotFound';

// Import des composants
import Layout from './components/Layout';

// Fonction pour vérifier si de nouveaux tirages sont disponibles
const checkForUpdates = async () => {
  try {
    // Logique simplifiée : vérifier si le dernier tirage est récent
    const lastUpdateStr = localStorage.getItem('lastUpdateCheck');
    const now = new Date();
    
    // Vérifier toutes les 12 heures maximum
    if (lastUpdateStr) {
      const lastUpdate = new Date(lastUpdateStr);
      const hoursDiff = (now - lastUpdate) / (1000 * 60 * 60);
      
      if (hoursDiff < 12) {
        return false;
      }
    }
    
    // Mettre à jour le timestamp de dernière vérification
    localStorage.setItem('lastUpdateCheck', now.toISOString());
    
    // On utilise ce mécanisme uniquement pour informer l'utilisateur
    // Le jour des tirages (mardi et vendredi)
    const currentDay = now.getDay(); // 0 = Dimanche, 1 = Lundi, etc.
    if (currentDay === 2 || currentDay === 5) { // Mardi ou Vendredi
      const currentHour = now.getHours();
      // Après 21h30, on peut suggérer de vérifier les résultats
      if (currentHour >= 21) {
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.error('Erreur lors de la vérification des mises à jour:', error);
    return false;
  }
};

function App() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  
  useEffect(() => {
    const checkUpdates = async () => {
      try {
        const hasUpdate = await checkForUpdates();
        if (hasUpdate) {
          setUpdateAvailable(true);
          toast.info('Un nouveau tirage EuroMillions pourrait être disponible !', {
            position: "top-right",
            autoClose: 10000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
        }
      } catch (error) {
        console.error('Erreur lors de la vérification des mises à jour:', error);
      }
    };
    
    checkUpdates();
  }, []);
  
  return (
    <>
      <ToastContainer 
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      
      <Routes>
        <Route path="/" element={<Layout updateAvailable={updateAvailable} />}>
          <Route index element={<Home />} />
          <Route path="dernier-tirage" element={<LastDraw />} />
          <Route path="historique" element={<DrawHistory />} />
          <Route path="statistiques" element={<Statistics />} />
          <Route path="predictions" element={<Predictions />} />
          <Route path="mes-grilles" element={<SavedGrids />} />
          <Route path="mentions-legales" element={<MentionsLegales />} />
          <Route path="confidentialite" element={<Confidentialite />} />
          <Route path="contact" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
