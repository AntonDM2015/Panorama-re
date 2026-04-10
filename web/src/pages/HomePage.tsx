import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ChevronRight, MapPin } from 'lucide-react';
import { getCities, getBuildingsByCity } from '../services/api';
import { City } from '../types';
import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';
import './HomePage.css';

type CityCard = City & { buildingCount: number };

const HomePage: React.FC = () => {
  const [cities, setCities] = useState<CityCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCities = async () => {
      try {
        setLoading(true);
        const data = await getCities();
        const citiesWithCount = await Promise.all(
          data.map(async (city) => {
            try {
              const buildings = await getBuildingsByCity(city.id);
              return { ...city, buildingCount: buildings.length };
            } catch {
              return { ...city, buildingCount: 0 };
            }
          }),
        );
        setCities(citiesWithCount);
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
        <div className="spinner" />
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
      <SiteHeader />

      <main className="home-main">
        <section className="home-section">
          <motion.h2
            className="home-section-title"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            Выберите город
          </motion.h2>

          {cities.length === 0 ? (
            <div className="home-empty">
              <p className="home-empty-text">Города пока не добавлены</p>
            </div>
          ) : (
            <div className="home-cities-grid">
              {cities.map((city, index) => (
                <motion.div
                  key={city.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: index * 0.06 }}
                >
                  <Link to={`/city/${city.id}`} className="home-city-card">
                    <div className="home-city-main">
                      <div className="home-city-icon-wrap">
                        <MapPin size={26} className="home-city-icon" />
                      </div>
                      <div>
                        <h3 className="home-city-name">{city.name}</h3>
                        <p className="home-city-country">{city.country}</p>
                      </div>
                    </div>

                    <div className="home-city-bottom">
                      <p className="home-city-count">Корпусов: {city.buildingCount}</p>
                      <ChevronRight size={18} className="home-city-arrow" />
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </section>
      </main>

      <SiteFooter />
    </div>
  );
};

export default HomePage;
