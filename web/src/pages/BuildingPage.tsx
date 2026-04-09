import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getBuildingById, getLocationsByBuilding, getPanoramasByLocation, getNavigationLinks } from '../services/api';
import { Building, Location } from '../types';
import PanoramaViewer from '../components/PanoramaViewer';
import StreetViewMode from '../components/StreetViewMode';
import './BuildingPage.css';

const BuildingPage: React.FC = () => {
  const { buildingId } = useParams<{ buildingId: string }>();
  const navigate = useNavigate();
  const [building, setBuilding] = useState<Building | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [activeTab, setActiveTab] = useState<'locations' | 'rooms'>('locations');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedLocation, setExpandedLocation] = useState<string | null>(null);
  const [showStreetView, setShowStreetView] = useState(false);
  const [currentPanoramaIndex, setCurrentPanoramaIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!buildingId) {
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const buildingData = await getBuildingById(buildingId);
        setBuilding(buildingData);

        const locationsData = await getLocationsByBuilding(buildingId);
        
        // Load panoramas and navigation links for each location
        const locationsWithPanoramas = await Promise.all(
          locationsData.map(async (loc) => {
            try {
              const [panoramas, navigationLinks] = await Promise.all([
                getPanoramasByLocation(loc.id),
                getNavigationLinks(loc.id)
              ]);
              return { ...loc, panoramas, navigationLinks };
            } catch (err) {
              console.error(`[BuildingPage] Error loading data for ${loc.name}:`, err);
              return loc;
            }
          })
        );
        
        setLocations(locationsWithPanoramas);
        setError(null);
      } catch (err: any) {
        console.error('[BuildingPage] Error fetching data:', err);
        setError(err.response?.data?.message || 'Не удалось загрузить данные');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [buildingId]);

  const handleLocationClick = useCallback((locationId: string) => {
    setExpandedLocation(prev => prev === locationId ? null : locationId);
    setCurrentPanoramaIndex(0); // Reset panorama index when switching locations
  }, []);

  const handlePanoramaLoad = useCallback(() => {
    // Panorama loaded successfully
  }, []);

  const handlePanoramaError = useCallback((err: string) => {
    console.error('[BuildingPage] Panorama error:', err);
  }, []);

  const filteredLocations = locations.filter(loc => {
    if (activeTab === 'locations') {
      return loc.type === 'location';
    } else {
      return loc.type === 'room' && (
        loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (loc.roomNumber && loc.roomNumber.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
  });

  const floorGroups = filteredLocations.reduce((acc, loc) => {
    const floor = loc.floor !== null && loc.floor !== undefined ? loc.floor : -999;
    if (!acc[floor]) acc[floor] = [];
    acc[floor].push(loc);
    return acc;
  }, {} as Record<number, Location[]>);

  const sortedFloorGroups = Object.entries(floorGroups)
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([floor, floorLocations]) => ({ floor: Number(floor), locations: floorLocations }));

  if (loading) {
    return (
      <div className="building-page-loading">
        <div className="building-page-spinner"></div>
        <p className="building-page-loading-text">Загрузка...</p>
      </div>
    );
  }

  if (error || !building) {
    return (
      <div className="building-page-error">
        <p className="building-page-error-title">Ошибка</p>
        <p className="building-page-error-text">{error || 'Корпус не найден'}</p>
        <button onClick={() => navigate('/')} className="building-page-back-button">
          На главную
        </button>
      </div>
    );
  }

  return (
    <div className="building-page">
      <header className="building-page-header">
        <div className="building-page-header-top">
          <button className="building-page-back" onClick={() => navigate(-1)}>
            ← Назад
          </button>
          <button
            className="building-page-street-view-btn"
            onClick={() => setShowStreetView(true)}
            disabled={locations.length === 0}
          >
            🧭 Свободное перемещение
          </button>
        </div>
        <div className="building-page-info">
          <h1 className="building-page-title">{building.name}</h1>
          {building.address && <p className="building-page-address">{building.address}</p>}
          {building.description && <p className="building-page-description">{building.description}</p>}
        </div>
      </header>

      <div className="building-page-tabs">
        <button
          className={`building-page-tab ${activeTab === 'locations' ? 'building-page-tab-active' : ''}`}
          onClick={() => setActiveTab('locations')}
        >
          Локации
        </button>
        <button
          className={`building-page-tab ${activeTab === 'rooms' ? 'building-page-tab-active' : ''}`}
          onClick={() => setActiveTab('rooms')}
        >
          Кабинеты
        </button>
      </div>

      {activeTab === 'rooms' && (
        <div className="building-page-search">
          <input
            type="text"
            placeholder="Поиск кабинета..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="building-page-search-input"
          />
        </div>
      )}

      <main className="building-page-main">
        <div className="building-page-container">
          {Object.keys(floorGroups).length === 0 ? (
            <div className="building-page-empty">
              <p className="building-page-empty-text">
                {activeTab === 'locations' ? 'Локации' : 'Кабинеты'} пока не добавлены
              </p>
            </div>
          ) : (
            sortedFloorGroups.map(({ floor, locations: floorLocations }) => (
              <div key={floor} className="building-page-floor-group">
                <h3 className="building-page-floor-title">
                  {floor === -999 ? 'Этаж не указан' : floor === 0 ? 'Цокольный этаж' : floor === -1 ? 'Подвал' : `${floor} этаж`}
                </h3>
                <div className="building-page-accordion-list">
                  {floorLocations.map((location) => (
                    <div key={location.id} className="building-page-accordion-item">
                      {/* Location Header with Preview */}
                      <button
                        className={`building-page-accordion-header ${expandedLocation === location.id ? 'building-page-accordion-header-expanded' : ''}`}
                        onClick={() => handleLocationClick(location.id)}
                      >
                        <div className="building-page-accordion-icon">
                          {location.type === 'room' ? '🚪' : '📍'}
                        </div>
                        <div className="building-page-accordion-content">
                          <h4 className="building-page-accordion-title">{location.name}</h4>
                          {location.description && (
                            <p className="building-page-accordion-description">{location.description}</p>
                          )}
                          {location.roomNumber && (
                            <p className="building-page-accordion-room">Кабинет {location.roomNumber}</p>
                          )}
                        </div>
                        <div className={`building-page-accordion-arrow ${expandedLocation === location.id ? 'building-page-accordion-arrow-expanded' : ''}`}>
                          ▼
                        </div>
                      </button>
                      
                      {/* Panorama Preview (when collapsed) */}
                      {expandedLocation !== location.id && location.panoramas && location.panoramas.length > 0 && (
                        <div className="building-page-location-preview" onClick={(e) => {
                          e.stopPropagation();
                          handleLocationClick(location.id);
                        }}>
                          <img 
                            src={location.panoramas[0].url} 
                            alt={location.name}
                            className="building-page-preview-image"
                          />
                          {location.panoramas.length > 1 && (
                            <div className="building-page-panorama-counter-badge">
                              <span className="building-page-panorama-count">{location.panoramas.length} фото</span>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Expanded Panorama Viewer */}
                      {expandedLocation === location.id && (
                        <div className="building-page-accordion-panorama">
                          {location.panoramas && location.panoramas.length > 0 ? (
                            <>
                              <PanoramaViewer
                                key={location.panoramas[currentPanoramaIndex]?.url || location.panoramas[0].url}
                                imageUrl={location.panoramas[currentPanoramaIndex]?.url || location.panoramas[0].url}
                                onLoad={handlePanoramaLoad}
                                onError={handlePanoramaError}
                              />
                              {location.panoramas.length > 1 && (
                                <div className="building-page-panorama-nav">
                                  <button 
                                    className="building-page-nav-btn"
                                    onClick={() => setCurrentPanoramaIndex(prev => 
                                      prev > 0 ? prev - 1 : location.panoramas!.length - 1
                                    )}
                                  >
                                    ‹
                                  </button>
                                  <span className="building-page-panorama-counter-text">
                                    {currentPanoramaIndex + 1} из {location.panoramas.length}
                                  </span>
                                  <button 
                                    className="building-page-nav-btn"
                                    onClick={() => setCurrentPanoramaIndex(prev => 
                                      prev < location.panoramas!.length - 1 ? prev + 1 : 0
                                    )}
                                  >
                                    ›
                                  </button>
                                </div>
                              )}
                            </>
                          ) : location.panoramaUrl ? (
                            <PanoramaViewer
                              key={location.panoramaUrl}
                              imageUrl={location.panoramaUrl}
                              onLoad={handlePanoramaLoad}
                              onError={handlePanoramaError}
                            />
                          ) : (
                            <div className="building-page-panorama-placeholder">
                              <p>Панорама ещё не добавлена</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      <footer className="building-page-footer">
        <p>© 2026 РЭУ им. Г.В. Плеханова</p>
      </footer>

      {/* Street View Mode Overlay */}
      {showStreetView && (
        <StreetViewMode
          locations={locations}
          startLocationId={locations[0]?.id || ''}
          onClose={() => setShowStreetView(false)}
        />
      )}
    </div>
  );
};

export default BuildingPage;
