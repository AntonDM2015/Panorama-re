import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Location, PanoramaImage, PanoramaLink } from '../types';
import PanoramaViewer, { CustomHotspot } from './PanoramaViewer';
import { getAllPanoramas, getPanoramaLinks } from '../services/api';
import './StreetViewMode.css';

interface StreetViewModeProps {
  locations: Location[];
  startLocationId: string;
  onClose: () => void;
}

// Map textual directions to degrees
function directionToHeading(direction: string | null): number {
  if (!direction) return 0;
  const d = direction.toLowerCase().trim();
  const numVal = parseFloat(d);
  if (!isNaN(numVal)) return numVal;
  const map: Record<string, number> = {
    north: 0, n: 0,
    northeast: 45, ne: 45,
    east: 90, e: 90,
    southeast: 135, se: 135,
    south: 180, s: 180,
    southwest: 225, sw: 225,
    west: 270, w: 270,
    northwest: 315, nw: 315,
  };
  return map[d] ?? 0;
}

const StreetViewMode: React.FC<StreetViewModeProps> = ({ locations, startLocationId, onClose }) => {
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [currentPanoramaIndex, setCurrentPanoramaIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  const [allPanoramas, setAllPanoramas] = useState<PanoramaImage[]>([]);
  const [currentPanoramaLinks, setCurrentPanoramaLinks] = useState<PanoramaLink[]>([]);

  // Fetch all panoramas once to lookup targets
  useEffect(() => {
    getAllPanoramas().then(setAllPanoramas).catch(console.error);
  }, []);

  // Set initial location
  useEffect(() => {
    const location = locations.find(loc => loc.id === startLocationId);
    if (location) {
      setCurrentLocation(location);
      setCurrentPanoramaIndex(0);
    }
  }, [startLocationId, locations]);

  const panoramas = useMemo(() => {
    if (!currentLocation) return [];
    return currentLocation.panoramas || [];
  }, [currentLocation]);

  const currentPanorama = panoramas.length > 0 ? panoramas[currentPanoramaIndex] : null;

  // Fetch links for current panorama
  useEffect(() => {
    if (currentPanorama) {
      getPanoramaLinks(currentPanorama.id)
        .then(setCurrentPanoramaLinks)
        .catch(console.error);
    } else {
      setCurrentPanoramaLinks([]);
    }
  }, [currentPanorama]);



  const currentPanoramaUrl = panoramas.length > 0 
    ? panoramas[currentPanoramaIndex]?.url 
    : currentLocation?.panoramaUrl || '';

  // Generate synthetic hotspots combining linear walking and external links
  const hotspots = useMemo((): CustomHotspot[] => {
    if (!currentLocation) return [];
    
    const generatedHotspots: CustomHotspot[] = [];

    // 1. Linear Walking within the same location (fallback automatically provided)
    if (panoramas.length > 1) {
      // Check if manual link exists at ~0 or ~180 before overriding
      const hasForwardLink = currentPanoramaLinks.some(l => directionToHeading(l.direction) === 0);
      const hasBackwardLink = currentPanoramaLinks.some(l => directionToHeading(l.direction) === 180);

      if (currentPanoramaIndex < panoramas.length - 1 && !hasForwardLink) {
        generatedHotspots.push({
          id: 'pano:next',
          heading: 0, // Forward
          pitch: -25,
          label: 'Вперёд',
        });
      }
      if (currentPanoramaIndex > 0 && !hasBackwardLink) {
        generatedHotspots.push({
          id: 'pano:prev',
          heading: 180, // Backward
          pitch: -25,
          label: 'Назад',
        });
      }
    }

    // 2. Specific Panorama Navigation Links
    currentPanoramaLinks.forEach(link => {
      const targetPano = allPanoramas.find(p => p.id === link.toPanoramaId);
      const targetLocation = targetPano ? locations.find(l => l.id === targetPano.locationId) : null;
      let targetName = targetPano?.title || 'Переход';
      
      if (targetLocation && targetLocation.id !== currentLocation.id) {
        targetName += ` (${targetLocation.name})`;
      }

      generatedHotspots.push({
        id: `panolink:${link.toPanoramaId}`,
        heading: directionToHeading(link.direction),
        pitch: -25,
        label: targetName,
      });
    });

    return generatedHotspots;
  }, [currentLocation, panoramas, currentPanoramaIndex, currentPanoramaLinks, allPanoramas, locations]);

  // Navigate to another hotspot
  const handleNavigate = useCallback((hotspotId: string) => {
    if (hotspotId === 'pano:next') {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentPanoramaIndex(prev => Math.min(panoramas.length - 1, prev + 1));
        setIsTransitioning(false);
      }, 500);
      return;
    }

    if (hotspotId === 'pano:prev') {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentPanoramaIndex(prev => Math.max(0, prev - 1));
        setIsTransitioning(false);
      }, 500);
      return;
    }

    if (hotspotId.startsWith('panolink:')) {
      const targetPanoramaId = hotspotId.substring(9);
      const targetPano = allPanoramas.find(p => p.id === targetPanoramaId);
      if (!targetPano) return;

      const targetLocation = locations.find(loc => loc.id === targetPano.locationId);
      if (!targetLocation) return;
      
      setIsTransitioning(true);
      setTimeout(() => {
        if (targetLocation.id !== currentLocation?.id) {
          setCurrentLocation(targetLocation);
        }
        
        // Find index of targetpano inside targetLocation.panoramas
        const index = targetLocation.panoramas?.findIndex(p => p.id === targetPano.id) ?? 0;
        setCurrentPanoramaIndex(Math.max(0, index));
        setIsTransitioning(false);
      }, 500);
      return;
    }
  }, [locations, currentLocation, panoramas, allPanoramas]);

  // Escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

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
        <div className="street-view-spinner" />
        <p>Загрузка режима навигации...</p>
      </div>
    );
  }

  return (
    <div className="street-view-overlay">
      <div className={`street-view-content ${isTransitioning ? 'street-view-transitioning' : ''}`}>
        {/* Panorama Display */}
        <div className="street-view-panorama-container">
          {currentPanoramaUrl ? (
            <PanoramaViewer
              key={`${currentLocation.id}-${currentPanoramaIndex}`}
              imageUrl={currentPanoramaUrl}
              hotspots={hotspots}
              onNavigate={handleNavigate}
              onLoad={() => console.log('[StreetView] Panorama loaded:', currentLocation.name, currentPanoramaIndex)}
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
            <h3 className="street-view-location-name">
              {currentLocation.name}
              {panoramas.length > 1 && ` (${currentPanoramaIndex + 1}/${panoramas.length})`}
            </h3>
            {currentLocation.floor !== null && (
              <p className="street-view-location-floor">
                {currentLocation.floor === 0 ? 'Цокольный этаж' :
                 currentLocation.floor === -1 ? 'Подвал' :
                 `${currentLocation.floor} этаж`}
              </p>
            )}
          </div>
        </div>

        <button className="street-view-close" onClick={onClose} aria-label="Закрыть">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default StreetViewMode;
