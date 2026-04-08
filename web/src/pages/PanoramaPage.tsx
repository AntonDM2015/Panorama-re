import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Location, PanoramaImage } from '../types';
import { getLocationById as fetchLocation } from '../services/api';
import PanoramaViewer from '../components/PanoramaViewer';
import './PanoramaPage.css';

const PanoramaPage: React.FC = () => {
  const { locationId } = useParams<{ locationId: string }>();
  const navigate = useNavigate();
  const [location, setLocation] = useState<Location | null>(null);
  const [currentPanoramaIndex, setCurrentPanoramaIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!locationId) {
      console.log('[PanoramaPage] No locationId provided');
      return;
    }

    console.log('[PanoramaPage] Component mounted, locationId:', locationId);

    const fetchLocationData = async () => {
      try {
        setLoading(true);
        console.log('[PanoramaPage] Calling API: GET /api/locations/', locationId);
        const data = await fetchLocation(locationId);
        console.log('[PanoramaPage] Location fetched:', {
          id: data.id,
          name: data.name,
          panoramaUrl: data.panoramaUrl,
          panoramas: data.panoramas?.length || 0,
        });
        setLocation(data);
        setCurrentPanoramaIndex(0);
        setError(null);
      } catch (err: any) {
        console.error('[PanoramaPage] Error fetching location:', err);
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
        <div className="panorama-page-spinner"></div>
        <p className="panorama-page-loading-text">Загрузка...</p>
      </div>
    );
  }

  if (error || !location) {
    return (
      <div className="panorama-page-error">
        <p className="panorama-page-error-title">Ошибка</p>
        <p className="panorama-page-error-text">{error || 'Локация не найдена'}</p>
        <button onClick={() => navigate(-1)} className="panorama-page-back-button">
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
    console.log('[PanoramaPage] Previous button clicked');
    if (currentPanoramaIndex > 0) {
      const newIndex = currentPanoramaIndex - 1;
      console.log('[PanoramaPage] Navigating to panorama:', newIndex);
      setCurrentPanoramaIndex(newIndex);
    }
  };

  const handleNext = () => {
    console.log('[PanoramaPage] Next button clicked');
    if (currentPanoramaIndex < panoramas.length - 1) {
      const newIndex = currentPanoramaIndex + 1;
      console.log('[PanoramaPage] Navigating to panorama:', newIndex);
      setCurrentPanoramaIndex(newIndex);
    }
  };

  return (
    <div className="panorama-page">
      <div className="panorama-page-header">
        <button className="panorama-page-back" onClick={() => navigate(-1)}>
          ← Назад
        </button>
        <div className="panorama-page-info">
          <h1 className="panorama-page-title">{location.name}</h1>
          <p className="panorama-page-description">{location.description}</p>
        </div>
      </div>

      <div className="panorama-page-viewer">
        <PanoramaViewer 
          imageUrl={currentPanorama.url}
          key={currentPanorama.id}
        />
        
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
              <span className="panorama-page-panorama-title">
                {currentPanorama.title}
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
    </div>
  );
};

export default PanoramaPage;
