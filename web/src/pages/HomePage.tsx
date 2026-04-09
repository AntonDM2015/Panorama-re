import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCities } from '../services/api';
import { City } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import './HomePage.css';

const HomePage: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCities = async () => {
      try {
        setLoading(true);
        const data = await getCities();
        setCities(data);
        setError(null);
      } catch (err: any) {
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
        <div className="spinner"></div>
        <p className="home-loading-text">Загрузка...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="home-error">
        <p className="home-error-title">Ошибка</p>
        <p className="home-error-text">{error}</p>
        <button onClick={() => window.location.reload()} className="btn btn-primary">
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
            <div className="home-logo-icon">🎓</div>
            <div className="home-logo-text">
              <h1 className="home-logo-title">РЭУ им. Г.В. Плеханова</h1>
              <p className="home-logo-subtitle">Виртуальный тур по кампусу</p>
            </div>
          </div>
          <button className="theme-toggle" onClick={toggleTheme} aria-label="Переключить тему">
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
        </div>
      </header>

      <main className="home-main">
        <div className="home-container">
          <section className="home-section">
            <h2 className="home-section-title animate-fade-in-up">Выберите город</h2>
            
            {cities.length === 0 ? (
              <div className="home-empty animate-fade-in-up">
                <p className="home-empty-text">Города пока не добавлены</p>
              </div>
            ) : (
              <div className="home-cities-grid">
                {cities.map((city, index) => (
                  <Link
                    key={city.id}
                    to={`/city/${city.id}`}
                    className="home-city-card animate-fade-in-up"
                    style={{ animationDelay: `${index * 80}ms` }}
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
          </section>
        </div>
      </main>

      <footer className="home-footer">
        <p className="home-footer-text">© 2026 РЭУ им. Г.В. Плеханова</p>
        <Link to="/admin" className="home-admin-link">Панель администратора</Link>
      </footer>
    </div>
  );
};

export default HomePage;
