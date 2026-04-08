import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { getCityById, getBuildingsByCity } from '../services/api';
import { City, Building } from '../types';
import './CityPage.css';

const CityPage: React.FC = () => {
  const { cityId } = useParams<{ cityId: string }>();
  const navigate = useNavigate();
  const [city, setCity] = useState<City | null>(null);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!cityId) {
      console.log('[CityPage] No cityId provided');
      return;
    }

    console.log('[CityPage] Component mounted, cityId:', cityId);

    const fetchData = async () => {
      try {
        setLoading(true);
        console.log('[CityPage] Calling API: GET /api/cities/', cityId);
        const cityData = await getCityById(cityId);
        console.log('[CityPage] City fetched:', cityData.name);
        setCity(cityData);

        console.log('[CityPage] Calling API: GET /api/cities/', cityId, '/buildings');
        const buildingsData = await getBuildingsByCity(cityId);
        console.log('[CityPage] Buildings fetched:', buildingsData.length, 'buildings');
        setBuildings(buildingsData);
        setError(null);
      } catch (err: any) {
        console.error('[CityPage] Error fetching data:', err);
        setError(err.response?.data?.message || 'Не удалось загрузить данные');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [cityId]);

  if (loading) {
    return (
      <div className="city-page-loading">
        <div className="city-page-spinner"></div>
        <p className="city-page-loading-text">Загрузка...</p>
      </div>
    );
  }

  if (error || !city) {
    return (
      <div className="city-page-error">
        <p className="city-page-error-title">Ошибка</p>
        <p className="city-page-error-text">{error || 'Город не найден'}</p>
        <button onClick={() => navigate('/')} className="city-page-back-button">
          На главную
        </button>
      </div>
    );
  }

  return (
    <div className="city-page">
      <header className="city-page-header">
        <button className="city-page-back" onClick={() => navigate('/')}>
          ← Назад
        </button>
        <div className="city-page-info">
          <h1 className="city-page-title">{city.name}</h1>
          <p className="city-page-country">{city.country}</p>
        </div>
      </header>

      <main className="city-page-main">
        <div className="city-page-container">
          <h2 className="city-page-section-title">Корпуса</h2>
          
          {buildings.length === 0 ? (
            <div className="city-page-empty">
              <p className="city-page-empty-text">Корпуса пока не добавлены</p>
            </div>
          ) : (
            <div className="city-page-buildings-grid">
              {buildings.map((building) => (
                <Link
                  key={building.id}
                  to={`/building/${building.id}`}
                  className="city-page-building-card"
                >
                  <div className="city-page-building-card-icon">🏛️</div>
                  <div className="city-page-building-card-content">
                    <h3 className="city-page-building-card-name">{building.name}</h3>
                    {building.address && (
                      <p className="city-page-building-card-address">{building.address}</p>
                    )}
                    {building.description && (
                      <p className="city-page-building-card-description">{building.description}</p>
                    )}
                  </div>
                  <div className="city-page-building-card-arrow">→</div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      <footer className="city-page-footer">
        <p>© 2026 РЭУ им. Г.В. Плеханова</p>
      </footer>
    </div>
  );
};

export default CityPage;
