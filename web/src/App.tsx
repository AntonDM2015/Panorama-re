import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import HomePage from './pages/HomePage';
import CityPage from './pages/CityPage';
import BuildingPage from './pages/BuildingPage';
import PanoramaPage from './pages/PanoramaPage';
import AdminPage from './pages/AdminPage';
import './App.css';

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <div className="app">
          <main className="app-main">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/city/:cityId" element={<CityPage />} />
              <Route path="/building/:buildingId" element={<BuildingPage />} />
              <Route path="/panorama/:locationId" element={<PanoramaPage />} />
              <Route path="/admin" element={<AdminPage />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;
