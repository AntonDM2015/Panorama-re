import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCities } from '../services/api';
import { City } from '../types';
import './HomePage.css';

const HomePage: React.FC = () => {
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('[HomePage] Component mounted, fetching cities...');
    const fetchCities = async () => {
      try {
        setLoading(true);
        console.log('[HomePage] Calling API: GET /api/cities');
        const data = await getCities();
        console.log('[HomePage] Cities fetched:', data.length, 'cities');
        data.forEach((city, i) => {
          console.log(`[HomePage] City ${i + 1}:`, {
            id: city.id,
            name: city.name,
            country: city.country,
          });
        });
        setCities(data);
        setError(null);
      } catch (err: any) {
        console.error('[HomePage] Error fetching cities:', err);
        console.error('[HomePage] Error response:', err.response?.data);
        setError(err.response?.data?.message || 'Не удалось загрузить города');
      } finally {
        setLoading(false);
      }
    };

    fetchCities();
  }, []);

  if (loading) {
    return (
      <div className="home-loading">
        <div className="home-spinner"></div>
        <p className="home-loading-text">Загрузка...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="home-error">
        <p className="home-error-title">Ошибка</p>
        <p className="home-error-text">{error}</p>
        <button onClick={() => window.location.reload()} className="home-retry-button">
          Повторить
        </button>
      </div>
    );
  }

  return (
    <div className="home-page">
      <header className="home-header">
        <div className="home-header-content">
          <div className="home-logo">
            <span className="home-logo-icon">🎓</span>
            <div className="home-logo-text">
              <h1 className="home-logo-title">РЭУ им. Г.В. Плеханова</h1>
              <p className="home-logo-subtitle">Виртуальный тур по кампусу</p>
            </div>
          </div>
        </div>
      </header>

      <main className="home-main">
        <div className="home-container">
          <h2 className="home-section-title">Выберите город</h2>
          
          {cities.length === 0 ? (
            <div className="home-empty">
              <p className="home-empty-text">Города пока не добавлены</p>
            </div>
          ) : (
            <div className="home-cities-grid">
              {cities.map((city) => (
                <Link
                  key={city.id}
                  to={`/city/${city.id}`}
                  className="home-city-card"
                >
                  <div className="home-city-card-icon">🏙️</div>
                  <div className="home-city-card-content">
                    <h3 className="home-city-card-name">{city.name}</h3>
                    <p className="home-city-card-country">{city.country}</p>
                  </div>
                  <div className="home-city-card-arrow">→</div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      <footer className="home-footer">
        <p>© 2026 РЭУ им. Г.В. Плеханова</p>
        <Link to="/admin" className="home-admin-link">Админ-панель</Link>
      </footer>
    </div>
  );
};

export default HomePage;
