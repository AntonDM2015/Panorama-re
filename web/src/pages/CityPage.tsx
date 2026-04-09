import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { getCityById, getBuildingsByCity } from '../services/api';
import { City, Building } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import './CityPage.css';

const CityPage: React.FC = () => {
  const { cityId } = useParams<{ cityId: string }>();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [city, setCity] = useState<City | null>(null);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!cityId) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const cityData = await getCityById(cityId);
        setCity(cityData);

        const buildingsData = await getBuildingsByCity(cityId);
        setBuildings(buildingsData);
        setError(null);
      } catch (err: any) {
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
        <div className="spinner"></div>
        <p className="city-page-loading-text">Загрузка...</p>
      </div>
    );
  }

  if (error || !city) {
    return (
      <div className="city-page-error">
        <p className="city-page-error-title">Ошибка</p>
        <p className="city-page-error-text">{error || 'Город не найден'}</p>
        <button onClick={() => navigate('/')} className="btn btn-primary">
          На главную
        </button>
      </div>
    );
  }

  return (
    <div className="city-page">
      <header className="city-page-header">
        <div className="city-page-header-content">
          <div className="city-page-header-top">
            <button className="city-page-back" onClick={() => navigate('/')}>
              <span className="city-page-back-icon">←</span>
              <span>Назад</span>
            </button>
            <button className="theme-toggle" onClick={toggleTheme} aria-label="Переключить тему">
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
          </div>
          <div className="city-page-info">
            <h1 className="city-page-title animate-fade-in-up">{city.name}</h1>
            <p className="city-page-country animate-fade-in-up" style={{ animationDelay: '80ms' }}>{city.country}</p>
          </div>
        </div>
      </header>

      <main className="city-page-main">
        <div className="city-page-container">
          <section className="city-page-section">
            <h2 className="city-page-section-title animate-fade-in-up">Корпуса</h2>
            
            {buildings.length === 0 ? (
              <div className="city-page-empty animate-fade-in-up">
                <p className="city-page-empty-text">Корпуса пока не добавлены</p>
              </div>
            ) : (
              <div className="city-page-buildings-grid">
                {buildings.map((building, index) => (
                  <Link
                    key={building.id}
                    to={`/building/${building.id}`}
                    className="city-page-building-card animate-fade-in-up"
                    style={{ animationDelay: `${index * 80}ms` }}
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
          </section>
        </div>
      </main>

      <footer className="city-page-footer">
        <p className="city-page-footer-text">© 2026 РЭУ им. Г.В. Плеханова</p>
      </footer>
    </div>
  );
};

export default CityPage;
