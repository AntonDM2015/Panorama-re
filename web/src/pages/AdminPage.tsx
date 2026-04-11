import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCities, getBuildings, getLocations, createCity, createBuilding, createLocation, deleteCity, deleteBuilding, deleteLocation, isAuthenticated, login, setTokens, logout, updateCity, updateBuilding, updateLocation, getPanoramasByLocation, createPanorama, deletePanorama, getPanoramaLinks, createPanoramaLink, deletePanoramaLink, getAllPanoramas } from '../services/api';
import { City, Building, Location, PanoramaImage, PanoramaLink } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import { Moon, Sun } from 'lucide-react';
import { motion } from 'motion/react';
import './AdminPage.css';

const AdminPage: React.FC = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [authState, setAuthState] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cities, setCities] = useState<City[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [allPanoramas, setAllPanoramas] = useState<PanoramaImage[]>([]);
  const [activeTab, setActiveTab] = useState<'cities' | 'buildings' | 'locations'>('cities');
  const [loading, setLoading] = useState(false);
  const [showCityForm, setShowCityForm] = useState(false);
  const [editingCity, setEditingCity] = useState<City | null>(null);
  const [showBuildingForm, setShowBuildingForm] = useState(false);
  const [editingBuilding, setEditingBuilding] = useState<Building | null>(null);
  const [showLocationForm, setShowLocationForm] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [newCityName, setNewCityName] = useState('');
  const [newCityCountry, setNewCityCountry] = useState('Россия');
  const [newBuildingName, setNewBuildingName] = useState('');
  const [newBuildingCityId, setNewBuildingCityId] = useState('');
  const [newBuildingAddress, setNewBuildingAddress] = useState('');
  const [newBuildingDescription, setNewBuildingDescription] = useState('');
  const [newBuildingPreviewUrl, setNewBuildingPreviewUrl] = useState('');
  const [newBuildingWorkingHours, setNewBuildingWorkingHours] = useState('');
  const [newBuildingPhone, setNewBuildingPhone] = useState('');
  const [newBuildingFacilities, setNewBuildingFacilities] = useState<string[]>([]);
  const [newBuildingMapUrl, setNewBuildingMapUrl] = useState('');
  const [newFacilityInput, setNewFacilityInput] = useState('');
  const [newLocationName, setNewLocationName] = useState('');
  const [newLocationBuildingId, setNewLocationBuildingId] = useState('');
  const [newLocationType, setNewLocationType] = useState<'location' | 'room'>('location');
  const [newLocationPanoramaUrl, setNewLocationPanoramaUrl] = useState('');
  const [newLocationFloor, setNewLocationFloor] = useState<string>('');
  const [showPanoramaModal, setShowPanoramaModal] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [locationPanoramas, setLocationPanoramas] = useState<PanoramaImage[]>([]);
  const [newPanoramaUrl, setNewPanoramaUrl] = useState('');
  const [newPanoramaTitle, setNewPanoramaTitle] = useState('');
  
  // Link management per panorama
  const [expandedPanoramaLinks, setExpandedPanoramaLinks] = useState<string | null>(null);
  const [panoramaLinks, setPanoramaLinks] = useState<Record<string, PanoramaLink[]>>({});
  const [newNavLinkTargetId, setNewNavLinkTargetId] = useState('');
  const [newNavLinkDirection, setNewNavLinkDirection] = useState('');

  const COUNTRIES = ['Россия', 'ОАЭ', 'Армения', 'Узбекистан', 'Беларусь', 'Монголия'];

  useEffect(() => {
    // Check if user is authenticated
    if (!isAuthenticated()) {
      console.log('[Admin] No authentication token found');
      return;
    }
    
    setAuthState(true);
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [citiesData, buildingsData, locationsData] = await Promise.all([
        getCities(),
        getBuildings(),
        getLocations()
      ]);
      setCities(citiesData);
      setBuildings(buildingsData);
      setLocations(locationsData);

      try {
        const panoramasData = await getAllPanoramas();
        setAllPanoramas(panoramasData);
      } catch (panoramasError) {
        console.error('[Admin] Error fetching panoramas:', panoramasError);
        setAllPanoramas([]);
      }
    } catch (err) {
      console.error('[Admin] Error fetching data:', err);
    }
  };

  const handleLogin = async () => {
    try {
      setLoading(true);
      const data = await login(email, password);
      
      console.log('[Admin] Login successful');
      console.log('[Admin] Access token:', data.tokens.accessToken);
      
      // Save both tokens
      setTokens(data.tokens.accessToken, data.tokens.refreshToken);
      console.log('[Admin] Tokens saved to localStorage');
      
      setAuthState(true);
      fetchData();
    } catch (err: any) {
      console.error('[Admin] Login error:', err);
      alert('Ошибка входа. Проверьте email и пароль.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCity = async () => {
    if (!newCityName.trim()) return;
    try {
      console.log('[Admin] Adding city:', newCityName);
      await createCity({ name: newCityName, country: 'Россия' });
      setNewCityName('');
      setShowCityForm(false);
      fetchData();
    } catch (err: any) {
      console.error('[Admin] Error adding city:', err);
      console.error('[Admin] Error response:', err.response?.data);
      alert(`Ошибка при добавлении города: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleAddBuilding = async () => {
    if (!newBuildingName.trim() || !newBuildingCityId) return;
    try {
      console.log('[Admin] Adding building:', newBuildingName, 'cityId:', newBuildingCityId);
      await createBuilding({ 
        cityId: newBuildingCityId, 
        name: newBuildingName,
        address: newBuildingAddress || undefined,
        description: newBuildingDescription || undefined,
        previewUrl: newBuildingPreviewUrl || undefined,
        workingHours: newBuildingWorkingHours || undefined,
        phone: newBuildingPhone || undefined,
        facilities: newBuildingFacilities.length > 0 ? newBuildingFacilities : undefined,
        mapUrl: newBuildingMapUrl || undefined,
      });
      resetBuildingForm();
      fetchData();
    } catch (err: any) {
      console.error('[Admin] Error adding building:', err);
      console.error('[Admin] Error response:', err.response?.data);
      alert(`Ошибка при добавлении корпуса: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleAddLocation = async () => {
    if (!newLocationName.trim() || !newLocationBuildingId) return;
    try {
      console.log('[Admin] Adding location:', newLocationName, 'buildingId:', newLocationBuildingId);
      await createLocation({
        buildingId: newLocationBuildingId,
        name: newLocationName,
        type: newLocationType,
        floor: newLocationFloor ? parseInt(newLocationFloor) : undefined,
        panoramaUrl: newLocationPanoramaUrl || undefined
      });
      setNewLocationName('');
      setNewLocationBuildingId('');
      setNewLocationPanoramaUrl('');
      setNewLocationFloor('');
      setShowLocationForm(false);
      fetchData();
    } catch (err: any) {
      console.error('[Admin] Error adding location:', err);
      console.error('[Admin] Error response:', err.response?.data);
      alert(`Ошибка при добавлении локации: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleDeleteCity = async (id: string) => {
    if (!confirm('Удалить город? Все корпуса и локации также будут удалены.')) return;
    try {
      await deleteCity(id);
      fetchData();
    } catch (err) {
      console.error('[Admin] Error deleting city:', err);
      alert('Ошибка при удалении города');
    }
  };

  const handleDeleteBuilding = async (id: string) => {
    if (!confirm('Удалить корпус? Все локации также будут удалены.')) return;
    try {
      await deleteBuilding(id);
      fetchData();
    } catch (err) {
      console.error('[Admin] Error deleting building:', err);
      alert('Ошибка при удалении корпуса');
    }
  };

  const handleDeleteLocation = async (id: string) => {
    if (!confirm('Удалить локацию?')) return;
    try {
      await deleteLocation(id);
      fetchData();
    } catch (err: any) {
      console.error('[Admin] Error deleting location:', err);
      alert('Ошибка при удалении локации');
    }
  };

  const handleEditCity = (city: City) => {
    setEditingCity(city);
    setNewCityName(city.name);
    setNewCityCountry(city.country);
    setShowCityForm(true);
  };

  const handleEditBuilding = (building: Building) => {
    setEditingBuilding(building);
    setNewBuildingName(building.name);
    setNewBuildingCityId(building.cityId);
    setNewBuildingAddress(building.address || '');
    setNewBuildingDescription(building.description || '');
    setNewBuildingPreviewUrl(building.previewUrl || '');
    setNewBuildingWorkingHours(building.workingHours || '');
    setNewBuildingPhone(building.phone || '');
    setNewBuildingFacilities(building.facilities || []);
    setNewBuildingMapUrl(building.mapUrl || '');
    setShowBuildingForm(true);
  };

  const resetBuildingForm = () => {
    setNewBuildingName('');
    setNewBuildingCityId('');
    setNewBuildingAddress('');
    setNewBuildingDescription('');
    setNewBuildingPreviewUrl('');
    setNewBuildingWorkingHours('');
    setNewBuildingPhone('');
    setNewBuildingFacilities([]);
    setNewBuildingMapUrl('');
    setNewFacilityInput('');
    setShowBuildingForm(false);
  };

  const handleAddFacility = () => {
    if (!newFacilityInput.trim()) return;
    setNewBuildingFacilities([...newBuildingFacilities, newFacilityInput.trim()]);
    setNewFacilityInput('');
  };

  const handleRemoveFacility = (index: number) => {
    setNewBuildingFacilities(newBuildingFacilities.filter((_, i) => i !== index));
  };

  const handleEditLocation = (location: Location) => {
    setEditingLocation(location);
    setNewLocationName(location.name);
    setNewLocationBuildingId(location.buildingId);
    setNewLocationType(location.type);
    setNewLocationPanoramaUrl(location.panoramaUrl || '');
    setNewLocationFloor(location.floor !== null ? location.floor.toString() : '');
    setShowLocationForm(true);
  };

  const handleUpdateCity = async () => {
    if (!editingCity || !newCityName.trim()) return;
    try {
      await updateCity(editingCity.id, { name: newCityName, country: newCityCountry });
      setEditingCity(null);
      setNewCityName('');
      setNewCityCountry('Россия');
      setShowCityForm(false);
      fetchData();
    } catch (err: any) {
      console.error('[Admin] Error updating city:', err);
      alert(`Ошибка при обновлении города: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleUpdateBuilding = async () => {
    if (!editingBuilding || !newBuildingName.trim()) return;
    try {
      await updateBuilding(editingBuilding.id, { 
        name: newBuildingName,
        address: newBuildingAddress || undefined,
        description: newBuildingDescription || undefined,
        previewUrl: newBuildingPreviewUrl || undefined,
        workingHours: newBuildingWorkingHours || undefined,
        phone: newBuildingPhone || undefined,
        facilities: newBuildingFacilities.length > 0 ? newBuildingFacilities : undefined,
        mapUrl: newBuildingMapUrl || undefined,
      });
      resetBuildingForm();
      fetchData();
    } catch (err: any) {
      console.error('[Admin] Error updating building:', err);
      alert(`Ошибка при обновлении корпуса: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleUpdateLocation = async () => {
    if (!editingLocation || !newLocationName.trim()) return;
    try {
      await updateLocation(editingLocation.id, {
        name: newLocationName,
        type: newLocationType,
        floor: newLocationFloor ? parseInt(newLocationFloor) : undefined,
        panoramaUrl: newLocationPanoramaUrl || undefined
      });
      setEditingLocation(null);
      setNewLocationName('');
      setNewLocationBuildingId('');
      setNewLocationPanoramaUrl('');
      setNewLocationFloor('');
      setShowLocationForm(false);
      fetchData();
    } catch (err: any) {
      console.error('[Admin] Error updating location:', err);
      alert(`Ошибка при обновлении локации: ${err.response?.data?.message || err.message}`);
    }
  };

  const cancelEdit = () => {
    setEditingCity(null);
    setEditingBuilding(null);
    setEditingLocation(null);
    setNewCityName('');
    setNewCityCountry('Россия');
    setNewBuildingName('');
    setNewBuildingCityId('');
    setNewBuildingAddress('');
    setNewBuildingDescription('');
    setNewBuildingPreviewUrl('');
    setNewBuildingWorkingHours('');
    setNewBuildingPhone('');
    setNewBuildingFacilities([]);
    setNewBuildingMapUrl('');
    setNewFacilityInput('');
    setNewLocationName('');
    setNewLocationBuildingId('');
    setNewLocationPanoramaUrl('');
    setNewLocationFloor('');
    setShowCityForm(false);
    setShowBuildingForm(false);
    setShowLocationForm(false);
  };

  const handleManagePanoramas = async (location: Location) => {
    setSelectedLocation(location);
    setShowPanoramaModal(true);
    setExpandedPanoramaLinks(null); // Reset expands
    try {
      const panoramas = await getPanoramasByLocation(location.id);
      setLocationPanoramas(panoramas);
    } catch (err) {
      console.error('[Admin] Error loading panoramas:', err);
      setLocationPanoramas([]);
    }
  };

  const handleTogglePanoramaLinks = async (panoramaId: string) => {
    if (expandedPanoramaLinks === panoramaId) {
      setExpandedPanoramaLinks(null);
      return;
    }
    
    setExpandedPanoramaLinks(panoramaId);
    try {
      const links = await getPanoramaLinks(panoramaId);
      setPanoramaLinks(prev => ({ ...prev, [panoramaId]: links }));
    } catch (err) {
      console.error('[Admin] Error loading panorama links:', err);
    }
  };

  const handleAddPanoramaLink = async (panoramaId: string) => {
    if (!newNavLinkTargetId.trim()) return;
    if (newNavLinkTargetId === panoramaId) {
      alert('Нельзя создать ссылку на саму себя!');
      return;
    }
    try {
      console.log('[Admin] Adding panorama link to:', newNavLinkTargetId);
      await createPanoramaLink(panoramaId, {
        toPanoramaId: newNavLinkTargetId,
        direction: newNavLinkDirection || undefined
      });
      setNewNavLinkTargetId('');
      setNewNavLinkDirection('');
      
      // Reload links
      const links = await getPanoramaLinks(panoramaId);
      setPanoramaLinks(prev => ({ ...prev, [panoramaId]: links }));
    } catch (err: any) {
      console.error('[Admin] Error adding panorama link:', err);
      alert(`Ошибка при добавлении ссылки: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleDeletePanoramaLink = async (panoramaId: string, linkId: string) => {
    if (!confirm('Удалить эту навигационную ссылку?')) return;
    try {
      await deletePanoramaLink(linkId);
      
      // Reload links
      const links = await getPanoramaLinks(panoramaId);
      setPanoramaLinks(prev => ({ ...prev, [panoramaId]: links }));
    } catch (err: any) {
      console.error('[Admin] Error deleting panorama link:', err);
      alert('Ошибка при удалении ссылки');
    }
  };

  const handleAddPanorama = async () => {
    if (!selectedLocation || !newPanoramaUrl.trim()) return;
    if (locationPanoramas.length >= 20) {
      alert('Максимум 20 панорам на локацию!');
      return;
    }
    try {
      await createPanorama(selectedLocation.id, {
        url: newPanoramaUrl,
        title: newPanoramaTitle || undefined,
        sortOrder: locationPanoramas.length
      });
      setNewPanoramaUrl('');
      setNewPanoramaTitle('');
      const panoramas = await getPanoramasByLocation(selectedLocation.id);
      setLocationPanoramas(panoramas);
    } catch (err: any) {
      console.error('[Admin] Error adding panorama:', err);
      alert(`Ошибка при добавлении панорамы: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleDeletePanorama = async (panoramaId: string) => {
    if (!confirm('Удалить панораму?')) return;
    try {
      await deletePanorama(panoramaId);
      const panoramas = await getPanoramasByLocation(selectedLocation!.id);
      setLocationPanoramas(panoramas);
    } catch (err: any) {
      console.error('[Admin] Error deleting panorama:', err);
      alert('Ошибка при удалении панорамы');
    }
  };

  const closePanoramaModal = () => {
    setShowPanoramaModal(false);
    setSelectedLocation(null);
    setLocationPanoramas([]);
    setNewPanoramaUrl('');
    setNewPanoramaTitle('');

    setNewNavLinkTargetId('');
    setNewNavLinkDirection('');
  };

  if (!authState) {
    return (
      <div className="admin-login">
        <h1 className="admin-login-title">Вход в панель администратора</h1>
        <div className="admin-login-form">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="admin-login-input"
          />
          <input
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="admin-login-input"
          />
          <button onClick={handleLogin} disabled={loading} className="admin-login-button">
            {loading ? 'Вход...' : 'Войти'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <header className="admin-header">
        <div className="admin-header-content">
          <div className="admin-header-left">
            <button className="admin-back" onClick={() => navigate('/')}>← На сайт</button>
            <h1 className="admin-title">Панель администратора</h1>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button
              className="admin-logout-btn"
              onClick={() => {
                logout();
                setAuthState(false);
                navigate('/');
              }}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: 'var(--header-text)',
                padding: '8px 16px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 600
              }}
            >
              Выйти
            </button>
            <motion.button
              className="admin-theme-toggle"
              onClick={toggleTheme}
              aria-label="Переключить тему"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                key={theme}
                initial={{ rotate: -180, scale: 0.7 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ duration: 0.2 }}
              >
                {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
              </motion.div>
            </motion.button>
          </div>
        </div>
      </header>

      <div className="admin-tabs">
        <button className={`admin-tab ${activeTab === 'cities' ? 'admin-tab-active' : ''}`} onClick={() => setActiveTab('cities')}>Города</button>
        <button className={`admin-tab ${activeTab === 'buildings' ? 'admin-tab-active' : ''}`} onClick={() => setActiveTab('buildings')}>Корпуса</button>
        <button className={`admin-tab ${activeTab === 'locations' ? 'admin-tab-active' : ''}`} onClick={() => setActiveTab('locations')}>Локации</button>
      </div>

      <main className="admin-main">
        {activeTab === 'cities' && (
          <div className="admin-section">
            <div className="admin-section-header">
              <h2>Города ({cities.length})</h2>
              <button className="admin-add-button" onClick={() => setShowCityForm(!showCityForm)}>
                {showCityForm ? 'Отмена' : '+ Добавить город'}
              </button>
            </div>

            {showCityForm && (
              <div className="admin-form">
                <input type="text" placeholder="Название города" value={newCityName} onChange={(e) => setNewCityName(e.target.value)} className="admin-form-input" />
                <select value={newCityCountry} onChange={(e) => setNewCityCountry(e.target.value)} className="admin-form-select">
                  {COUNTRIES.map(country => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
                <button onClick={editingCity ? handleUpdateCity : handleAddCity} className="admin-form-button">
                  {editingCity ? 'Обновить' : 'Создать'}
                </button>
                {editingCity && (
                  <button onClick={cancelEdit} className="admin-cancel-button">Отмена</button>
                )}
              </div>
            )}

            <div className="admin-list">
              {cities.map(city => (
                <div key={city.id} className="admin-list-item">
                  <div className="admin-list-item-content">
                    <h3 className="admin-list-item-title">{city.name}</h3>
                    <p className="admin-list-item-subtitle">{city.country}</p>
                  </div>
                  <div className="admin-list-item-actions">
                    <button className="admin-edit-button" onClick={() => handleEditCity(city)}>Редактировать</button>
                    <button className="admin-delete-button" onClick={() => handleDeleteCity(city.id)}>Удалить</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'buildings' && (
          <div className="admin-section">
            <div className="admin-section-header">
              <h2>Корпуса ({buildings.length})</h2>
              <button className="admin-add-button" onClick={() => {
                if (showBuildingForm) {
                  resetBuildingForm();
                } else {
                  setEditingBuilding(null);
                  resetBuildingForm();
                  setShowBuildingForm(true);
                }
              }}>
                {showBuildingForm ? 'Отмена' : '+ Добавить корпус'}
              </button>
            </div>

            {showBuildingForm && (
              <div className="admin-form admin-building-form">
                {cities.length === 0 ? (
                  <div className="admin-warning-message">
                    Сначала добавьте хотя бы один город на вкладке "Города"
                  </div>
                ) : (
                  <>
                    <div className="admin-form-row">
                      <select value={newBuildingCityId} onChange={(e) => setNewBuildingCityId(e.target.value)} className="admin-form-select">
                        <option value="">Выберите город</option>
                        {cities.map(city => <option key={city.id} value={city.id}>{city.name}</option>)}
                      </select>
                      <input type="text" placeholder="Название корпуса *" value={newBuildingName} onChange={(e) => setNewBuildingName(e.target.value)} className="admin-form-input" />
                    </div>
                  </>
                )}

                <input type="text" placeholder="Адрес" value={newBuildingAddress} onChange={(e) => setNewBuildingAddress(e.target.value)} className="admin-form-input" />
                
                <textarea 
                  placeholder="Описание корпуса" 
                  value={newBuildingDescription} 
                  onChange={(e) => setNewBuildingDescription(e.target.value)} 
                  className="admin-form-textarea"
                  rows={3}
                />
                
                <input type="text" placeholder="URL превью изображения" value={newBuildingPreviewUrl} onChange={(e) => setNewBuildingPreviewUrl(e.target.value)} className="admin-form-input" />
                
                <div className="admin-form-row">
                  <input type="text" placeholder="Режим работы (например: Пн-Пт: 8:00 - 20:00)" value={newBuildingWorkingHours} onChange={(e) => setNewBuildingWorkingHours(e.target.value)} className="admin-form-input" />
                  <input type="text" placeholder="Телефон" value={newBuildingPhone} onChange={(e) => setNewBuildingPhone(e.target.value)} className="admin-form-input" />
                </div>
                
                <div className="admin-facilities-section">
                  <label className="admin-form-label">Удобства:</label>
                  <div className="admin-facilities-input-row">
                    <input 
                      type="text" 
                      placeholder="Добавить удобство..." 
                      value={newFacilityInput} 
                      onChange={(e) => setNewFacilityInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddFacility();
                        }
                      }}
                      className="admin-form-input"
                    />
                    <button type="button" onClick={handleAddFacility} className="admin-add-facility-btn">+</button>
                  </div>
                  {newBuildingFacilities.length > 0 && (
                    <div className="admin-facilities-list">
                      {newBuildingFacilities.map((facility, index) => (
                        <span key={index} className="admin-facility-tag">
                          {facility}
                          <button type="button" onClick={() => handleRemoveFacility(index)} className="admin-facility-remove">×</button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                
                <input type="text" placeholder="Ссылка на карту (Google Maps, Yandex Maps)" value={newBuildingMapUrl} onChange={(e) => setNewBuildingMapUrl(e.target.value)} className="admin-form-input" />
                
                <div className="admin-form-actions">
                  <button onClick={editingBuilding ? handleUpdateBuilding : handleAddBuilding} className="admin-form-button">
                    {editingBuilding ? 'Обновить' : 'Создать'}
                  </button>
                  <button onClick={() => {
                    resetBuildingForm();
                  }} className="admin-cancel-button">
                    Отмена
                  </button>
                </div>
              </div>
            )}

            <div className="admin-list">
              {buildings.map(building => {
                const city = cities.find(c => c.id === building.cityId);
                return (
                  <div key={building.id} className="admin-list-item">
                    <div className="admin-list-item-content">
                      <h3 className="admin-list-item-title">{building.name}</h3>
                      <p className="admin-list-item-subtitle">{city?.name || 'Неизвестный город'}</p>
                    </div>
                    <div className="admin-list-item-actions">
                      <button className="admin-edit-button" onClick={() => handleEditBuilding(building)}>Редактировать</button>
                      <button className="admin-delete-button" onClick={() => handleDeleteBuilding(building.id)}>Удалить</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'locations' && (
          <div className="admin-section">
            <div className="admin-section-header">
              <h2>Локации ({locations.length})</h2>
              <button className="admin-add-button" onClick={() => setShowLocationForm(!showLocationForm)}>
                {showLocationForm ? 'Отмена' : '+ Добавить локацию'}
              </button>
            </div>

            {showLocationForm && (
              <div className="admin-form">
                <select value={newLocationBuildingId} onChange={(e) => setNewLocationBuildingId(e.target.value)} className="admin-form-select" disabled={!!editingLocation}>
                  <option value="">Выберите корпус</option>
                  {buildings.map(building => <option key={building.id} value={building.id}>{building.name}</option>)}
                </select>
                <input type="text" placeholder="Название" value={newLocationName} onChange={(e) => setNewLocationName(e.target.value)} className="admin-form-input" />
                <select value={newLocationType} onChange={(e) => setNewLocationType(e.target.value as 'location' | 'room')} className="admin-form-select">
                  <option value="location">Локация</option>
                  <option value="room">Кабинет</option>
                </select>
                <select value={newLocationFloor} onChange={(e) => setNewLocationFloor(e.target.value)} className="admin-form-select">
                  <option value="">Этаж не указан</option>
                  <option value="-1">Подвал</option>
                  <option value="0">Цокольный этаж</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(floor => (
                    <option key={floor} value={floor.toString()}>{floor} этаж</option>
                  ))}
                </select>
                <input type="text" placeholder="URL панорамы (опционально)" value={newLocationPanoramaUrl} onChange={(e) => setNewLocationPanoramaUrl(e.target.value)} className="admin-form-input" />
                <button onClick={editingLocation ? handleUpdateLocation : handleAddLocation} className="admin-form-button">
                  {editingLocation ? 'Обновить' : 'Создать'}
                </button>
                {editingLocation && (
                  <button onClick={cancelEdit} className="admin-cancel-button">Отмена</button>
                )}
              </div>
            )}

            <div className="admin-list">
              {locations.map(location => {
                const building = buildings.find(b => b.id === location.buildingId);
                return (
                  <div key={location.id} className="admin-list-item">
                    <div className="admin-list-item-content">
                      <h3 className="admin-list-item-title">{location.name}</h3>
                      <p className="admin-list-item-subtitle">
                        {building?.name || 'Неизвестный корпус'} • {location.type === 'room' ? 'Кабинет' : 'Локация'}
                      </p>
                    </div>
                    <div className="admin-list-item-actions">
                      <button className="admin-panoramas-button" onClick={() => handleManagePanoramas(location)}>Панорамы</button>
                      <button className="admin-edit-button" onClick={() => handleEditLocation(location)}>Редактировать</button>
                      <button className="admin-delete-button" onClick={() => handleDeleteLocation(location.id)}>Удалить</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* Panorama Management Modal */}
      {showPanoramaModal && selectedLocation && (
        <div className="admin-modal-overlay" onClick={closePanoramaModal}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2 className="admin-modal-title">Панорамы: {selectedLocation.name}</h2>
              <button className="admin-modal-close" onClick={closePanoramaModal}>×</button>
            </div>

            <div className="admin-modal-content">
              {/* Panoramas Section */}
              <div className="admin-modal-section">
                <h3 className="admin-section-title">Панорамы</h3>
                <div className="admin-panorama-form">
                  <input
                    type="text"
                    placeholder="URL панорамы *"
                    value={newPanoramaUrl}
                    onChange={(e) => setNewPanoramaUrl(e.target.value)}
                    className="admin-form-input"
                  />
                  <input
                    type="text"
                    placeholder="Название (опционально)"
                    value={newPanoramaTitle}
                    onChange={(e) => setNewPanoramaTitle(e.target.value)}
                    className="admin-form-input"
                  />
                  <button onClick={handleAddPanorama} className="admin-form-button" disabled={locationPanoramas.length >= 20}>
                    Добавить ({locationPanoramas.length}/20)
                  </button>
                </div>

                <div className="admin-panorama-list">
                  {locationPanoramas.length === 0 ? (
                    <p className="admin-empty-text">Панорамы не добавлены</p>
                  ) : (
                    locationPanoramas.map((panorama, index) => (
                      <div key={panorama.id} className="admin-panorama-item">
                        <div className="admin-panorama-item-header">
                          <div className="admin-panorama-item-content">
                            <span className="admin-panorama-number">{index + 1}.</span>
                            <div>
                              <p className="admin-panorama-title">{panorama.title || 'Без названия'}</p>
                              <p className="admin-panorama-url">{panorama.url}</p>
                            </div>
                          </div>
                          <div className="admin-panorama-actions">
                            <button className="admin-navlink-button" onClick={() => handleTogglePanoramaLinks(panorama.id)}>
                              {expandedPanoramaLinks === panorama.id ? 'Скрыть переходы' : 'Настроить переходы'}
                            </button>
                            <button className="admin-delete-button" onClick={() => handleDeletePanorama(panorama.id)}>Удалить</button>
                          </div>
                        </div>

                        {/* Panorama Links Dropdown Area */}
                        {expandedPanoramaLinks === panorama.id && (
                          <div className="admin-panorama-links-container">
                            <h4 className="admin-links-title">Ссылки для этой панорамы</h4>
                            
                            <div className="admin-navlink-form">
                              <select
                                value={newNavLinkTargetId}
                                onChange={(e) => setNewNavLinkTargetId(e.target.value)}
                                className="admin-form-select"
                              >
                                <option value="">Выберите панораму (цель)</option>
                                {/* Group panoramas by location using allPanoramas */}
                                {locations.map(loc => {
                                  const locPanoramas = allPanoramas.filter(p => p.locationId === loc.id);
                                  if (locPanoramas.length === 0) return null;
                                  return (
                                    <optgroup key={loc.id} label={loc.name}>
                                      {locPanoramas.map(p => (
                                        <option key={p.id} value={p.id} disabled={p.id === panorama.id}>
                                          {p.title || `Без названия (ID: ${p.id.slice(0, 4)}...)`}
                                        </option>
                                      ))}
                                    </optgroup>
                                  );
                                })}
                              </select>
                              <input
                                type="text"
                                placeholder="Направление (в градусах)"
                                value={newNavLinkDirection}
                                onChange={(e) => setNewNavLinkDirection(e.target.value)}
                                className="admin-form-input"
                              />
                              <button onClick={() => handleAddPanoramaLink(panorama.id)} className="admin-form-button">
                                Привязать
                              </button>
                            </div>

                            <div className="admin-navlink-list">
                              {!panoramaLinks[panorama.id] || panoramaLinks[panorama.id].length === 0 ? (
                                <p className="admin-empty-text">Переходы не настроены</p>
                              ) : (
                                panoramaLinks[panorama.id].map((link) => {
                                  const targetPanorama = allPanoramas.find(p => p.id === link.toPanoramaId);
                                  const targetLocation = targetPanorama ? locations.find(l => l.id === targetPanorama.locationId) : null;
                                  return (
                                    <div key={link.id} className="admin-navlink-item">
                                      <div className="admin-navlink-item-content">
                                        <span className="admin-navlink-arrow">→</span>
                                        <div>
                                          <p className="admin-navlink-target">
                                            {targetPanorama?.title || 'Без названия'} 
                                            <span className="admin-navlink-target-loc"> ({targetLocation?.name || 'Неизвестная локация'})</span>
                                          </p>
                                          {link.direction && (
                                            <p className="admin-navlink-direction">
                                              Направление: {link.direction}°
                                            </p>
                                          )}
                                        </div>
                                      </div>
                                      <button className="admin-delete-button" onClick={() => handleDeletePanoramaLink(panorama.id, link.id)}>Удалить</button>
                                    </div>
                                  );
                                })
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
