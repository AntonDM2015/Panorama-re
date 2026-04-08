import React, { useEffect, useState } from 'react';
import { Location } from '../types';
import PanoramaViewer from './PanoramaViewer';
import './StreetViewMode.css';

interface StreetViewModeProps {
  locations: Location[];
  startLocationId: string;
  onClose: () => void;
}

const StreetViewMode: React.FC<StreetViewModeProps> = ({ locations, startLocationId, onClose }) => {
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    // Find and set initial location
    const location = locations.find(loc => loc.id === startLocationId);
    if (location) {
      setCurrentLocation(location);
    }
  }, [startLocationId, locations]);

  const handleNavigate = (locationId: string) => {
    const location = locations.find(loc => loc.id === locationId);
    if (location && location.id !== currentLocation?.id) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentLocation(location);
        setIsTransitioning(false);
      }, 500);
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  if (!currentLocation) {
    return (
      <div className="street-view-loading">
        <div className="street-view-spinner"></div>
        <p>Загрузка режима навигации...</p>
      </div>
    );
  }

  // Get navigation links (connected locations)
  const connectedLocationIds = currentLocation.navigationLinks?.map(link => link.toLocationId) || [];
  const connectedLocations = locations.filter(loc => connectedLocationIds.includes(loc.id));
  
  // Debug: Log navigation links
  console.log('[StreetView] Current location:', currentLocation.name);
  console.log('[StreetView] Navigation links:', currentLocation.navigationLinks?.length || 0);
  console.log('[StreetView] Connected locations:', connectedLocations.length);

  return (
    <div className="street-view-overlay">
      <div className={`street-view-content ${isTransitioning ? 'street-view-transitioning' : ''}`}>
        {/* Panorama Display */}
        <div className="street-view-panorama-container">
          {currentLocation.panoramas && currentLocation.panoramas.length > 0 ? (
            <PanoramaViewer
              imageUrl={currentLocation.panoramas[0].url}
              navigationLinks={currentLocation.navigationLinks}
              locations={locations}
              onNavigate={handleNavigate}
              onLoad={() => console.log('[StreetView] Panorama loaded:', currentLocation.name)}
              onError={(err) => console.error('[StreetView] Panorama error:', err)}
            />
          ) : currentLocation.panoramaUrl ? (
            <PanoramaViewer
              imageUrl={currentLocation.panoramaUrl}
              navigationLinks={currentLocation.navigationLinks}
              locations={locations}
              onNavigate={handleNavigate}
              onLoad={() => console.log('[StreetView] Panorama loaded:', currentLocation.name)}
              onError={(err) => console.error('[StreetView] Panorama error:', err)}
            />
          ) : (
            <div className="street-view-panorama-placeholder">
              <p>Панорама не добавлена для этой локации</p>
            </div>
          )}
        </div>

        {/* Location Info Bar */}
        <div className="street-view-info-bar">
          <div className="street-view-location-info">
            <h3 className="street-view-location-name">{currentLocation.name}</h3>
            {currentLocation.floor !== null && (
              <p className="street-view-location-floor">
                {currentLocation.floor === 0 ? 'Цокольный этаж' : 
                 currentLocation.floor === -1 ? 'Подвал' : 
                 `${currentLocation.floor} этаж`}
              </p>
            )}
          </div>
        </div>

        {/* Navigation Hotspots */}
        {connectedLocations.length > 0 && (
          <div className="street-view-navigation">
            <p className="street-view-navigation-title">Перейти к:</p>
            <div className="street-view-navigation-buttons">
              {connectedLocations.map(loc => (
                <button
                  key={loc.id}
                  className="street-view-nav-button"
                  onClick={() => handleNavigate(loc.id)}
                >
                  {loc.type === 'room' ? '🚪' : '📍'} {loc.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Close Button */}
        <button className="street-view-close" onClick={onClose}>
          ✕
        </button>
      </div>
    </div>
  );
};

export default StreetViewMode;
