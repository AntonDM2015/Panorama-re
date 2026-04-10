import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Location, PanoramaImage } from '../types';
import { getLocationById as fetchLocation } from '../services/api';
import PanoramaViewer from '../components/PanoramaViewer';
import { useTheme } from '../contexts/ThemeContext';
import './PanoramaPage.css';

const PanoramaPage: React.FC = () => {
  const { locationId } = useParams<{ locationId: string }>();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [location, setLocation] = useState<Location | null>(null);
  const [currentPanoramaIndex, setCurrentPanoramaIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!locationId) return;

    const fetchLocationData = async () => {
      try {
        setLoading(true);
        const data = await fetchLocation(locationId);
        setLocation(data);
        setCurrentPanoramaIndex(0);
        setError(null);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Не удалось загрузить локацию');
      } finally {
        setLoading(false);
      }
    };

    fetchLocationData();
  }, [locationId]);

  if (loading) {
    return (
      <div className="panorama-page-loading">
        <div className="spinner"></div>
        <p className="panorama-page-loading-text">Загрузка панорамы...</p>
      </div>
    );
  }

  if (error || !location) {
    return (
      <div className="panorama-page-error">
        <p className="panorama-page-error-title">Ошибка</p>
        <p className="panorama-page-error-text">{error || 'Локация не найдена'}</p>
        <button onClick={() => navigate(-1)} className="btn btn-primary">
          Назад
        </button>
      </div>
    );
  }

  const panoramas: PanoramaImage[] = location.panoramas || [];
  const hasMultiplePanoramas = panoramas.length > 1;
  
  const currentPanorama = hasMultiplePanoramas
    ? panoramas[currentPanoramaIndex]
    : { id: location.id, url: location.panoramaUrl || '', title: location.name };

  const handlePrevious = () => {
    if (currentPanoramaIndex > 0) {
      setCurrentPanoramaIndex(currentPanoramaIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentPanoramaIndex < panoramas.length - 1) {
      setCurrentPanoramaIndex(currentPanoramaIndex + 1);
    }
  };

  return (
    <div className="panorama-page">
      {/* Header overlay */}
      <div className="panorama-page-header-overlay">
        <div className="panorama-page-header-content">
          <div className="panorama-page-header-top">
            <button className="panorama-page-back" onClick={() => navigate(-1)}>
              <span className="panorama-page-back-icon">←</span>
              <span>Назад</span>
            </button>
            <button className="panorama-page-back" onClick={() => navigate('/')} style={{ marginLeft: '12px' }}>
              <span>🏡 На главную</span>
            </button>
            <button className="theme-toggle" onClick={toggleTheme} aria-label="Переключить тему">
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
          </div>
          <div className="panorama-page-info">
            <h1 className="panorama-page-title">{location.name}</h1>
            {location.description && (
              <p className="panorama-page-description">{location.description}</p>
            )}
          </div>
        </div>
      </div>

      {/* Panorama viewer */}
      <div className="panorama-page-viewer">
        <PanoramaViewer 
          imageUrl={currentPanorama.url}
          key={currentPanorama.id}
        />
      </div>
      
      {/* Navigation controls */}
      {hasMultiplePanoramas && (
        <div className="panorama-page-controls">
          <button
            className="panorama-page-nav-button"
            onClick={handlePrevious}
            disabled={currentPanoramaIndex === 0}
          >
            ‹
          </button>

          <div className="panorama-page-counter">
            <span className="panorama-page-counter-text">
              {currentPanoramaIndex + 1} из {panoramas.length}
            </span>
          </div>

          <button
            className="panorama-page-nav-button"
            onClick={handleNext}
            disabled={currentPanoramaIndex === panoramas.length - 1}
          >
            ›
          </button>
        </div>
      )}
    </div>
  );
};

export default PanoramaPage;
