import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getBuildingById, getLocationsByBuilding, getPanoramasByLocation, getNavigationLinks } from '../services/api';
import { Building, Location } from '../types';
import PanoramaViewer from '../components/PanoramaViewer';
import StreetViewMode from '../components/StreetViewMode';
import { useTheme } from '../contexts/ThemeContext';
import './BuildingPage.css';

const BuildingPage: React.FC = () => {
  const { buildingId } = useParams<{ buildingId: string }>();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
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
    if (!buildingId) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        console.log('[BuildingPage] Fetching building:', buildingId);
        const buildingData = await getBuildingById(buildingId);
        console.log('[BuildingPage] Building loaded:', buildingData.name);
        setBuilding(buildingData);

        console.log('[BuildingPage] Fetching locations for building:', buildingId);
        const locationsData = await getLocationsByBuilding(buildingId);
        console.log('[BuildingPage] Locations loaded:', locationsData.length);
        
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
        
        console.log('[BuildingPage] All locations with panoramas:', locationsWithPanoramas.length);
        setLocations(locationsWithPanoramas);
        setError(null);
      } catch (err: any) {
        console.error('[BuildingPage] Error fetching data:', err);
        console.error('[BuildingPage] Error response:', err.response?.data);
        setError(err.response?.data?.message || 'Не удалось загрузить данные');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [buildingId]);

  const handleLocationClick = useCallback((locationId: string) => {
    setExpandedLocation(prev => prev === locationId ? null : locationId);
    setCurrentPanoramaIndex(0);
  }, []);

  const handlePanoramaLoad = useCallback(() => {}, []);

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
        <div className="spinner"></div>
        <p className="building-page-loading-text">Загрузка...</p>
      </div>
    );
  }

  if (error || !building) {
    return (
      <div className="building-page-error">
        <p className="building-page-error-title">Ошибка</p>
        <p className="building-page-error-text">{error || 'Корпус не найден'}</p>
        <button onClick={() => navigate('/')} className="btn btn-primary">
          На главную
        </button>
      </div>
    );
  }

  return (
    <div className="building-page">
      <header className="building-page-header">
        <div className="building-page-header-content">
          <div className="building-page-header-top">
            <button className="building-page-back" onClick={() => navigate(-1)}>
              <span className="building-page-back-icon">←</span>
              <span>Назад</span>
            </button>
            <button className="theme-toggle" onClick={toggleTheme} aria-label="Переключить тему">
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
          </div>
          <div className="building-page-info">
            <h1 className="building-page-title animate-fade-in-up">{building.name}</h1>
            {building.address && <p className="building-page-address animate-fade-in-up" style={{ animationDelay: '80ms' }}>{building.address}</p>}
            {building.description && <p className="building-page-description animate-fade-in-up" style={{ animationDelay: '160ms' }}>{building.description}</p>}
          </div>
        </div>
      </header>

      <div className="building-page-tabs-container">
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
          <div className="building-page-tab-indicator" />
        </div>
      </div>

      {activeTab === 'rooms' && (
        <div className="building-page-search">
          <input
            type="text"
            placeholder="Поиск кабинета..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="building-page-search-input input"
          />
        </div>
      )}

      <main className="building-page-main">
        <div className="building-page-container">
          {Object.keys(floorGroups).length === 0 ? (
            <div className="building-page-empty animate-fade-in-up">
              <p className="building-page-empty-text">
                {activeTab === 'locations' ? 'Локации' : 'Кабинеты'} пока не добавлены
              </p>
            </div>
          ) : (
            sortedFloorGroups.map(({ floor, locations: floorLocations }, index) => (
              <div key={floor} className="building-page-floor-group animate-fade-in-up" style={{ animationDelay: `${index * 80}ms` }}>
                <h3 className="building-page-floor-title">
                  {floor === -999 ? 'Этаж не указан' : floor === 0 ? 'Цокольный этаж' : floor === -1 ? 'Подвал' : `${floor} этаж`}
                </h3>
                <div className="building-page-accordion-list">
                  {floorLocations.map((location) => (
                    <div key={location.id} className="building-page-accordion-item">
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
        <p className="building-page-footer-text">© 2026 Plekhanov Russian University of Economics</p>
      </footer>

      {/* Fixed Street View Button */}
      <button
        className="building-page-street-view-fixed"
        onClick={() => setShowStreetView(true)}
        disabled={locations.length === 0}
      >
        🧭 Свободное перемещение
      </button>

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
