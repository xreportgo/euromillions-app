import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';

// Layout Components
import Header from './components/common/Header';
import Sidebar from './components/common/Sidebar';
import Footer from './components/common/Footer';
import ThemeToggle from './components/common/ThemeToggle';

// Pages
import Dashboard from './pages/Dashboard';
import DrawHistory from './pages/DrawHistory';
import GenerateGrid from './pages/GenerateGrid';
import SavedGrids from './pages/SavedGrids'; // Nouvelle page ajoutée
import Predictions from './pages/Predictions';
import Statistics from './pages/Statistics';
import Settings from './pages/Settings';

// Actions
import { fetchLatestDraws } from './redux/actions/drawActions';

const App = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const dispatch = useDispatch();
  const { t } = useTranslation();

  useEffect(() => {
    // Charger les derniers tirages au démarrage de l'application
    dispatch(fetchLatestDraws());
  }, [dispatch]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header toggleSidebar={toggleSidebar} />

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/draws" element={<DrawHistory />} />
            <Route path="/generate" element={<GenerateGrid />} />
            <Route path="/saved-grids" element={<SavedGrids />} /> {/* Nouvelle route ajoutée */}
            <Route path="/predictions" element={<Predictions />} />
            <Route path="/statistics" element={<Statistics />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <Footer />
      </div>

      {/* Theme Toggle Button */}
      <ThemeToggle />
    </div>
  );
};

export default App;
