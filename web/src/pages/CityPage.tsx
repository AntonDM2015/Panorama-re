import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, Building2, ChevronRight, Clock3, MapPin, Phone, Search } from 'lucide-react';
import { getBuildingsByCity, getCityById } from '../services/api';
import { Building, City } from '../types';
import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';
import './CityPage.css';

interface BuildingVisual {
  image: string;
  schedule: string;
  phone: string;
  tags: string[];
}

const VISUAL_PRESETS: BuildingVisual[] = [
  {
    image: 'https://images.unsplash.com/photo-1604147706283-d7119b5b822c?auto=format&fit=crop&w=1600&q=80',
    schedule: 'Пн-Пт: 8:00 - 20:00, Сб: 9:00 - 15:00',
    phone: '+7 (4832) 74-37-36',
    tags: ['Аудитории', 'Компьютерные классы', 'Библиотека', 'Коворкинг'],
  },
  {
    image: 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=1600&q=80',
    schedule: 'Пн-Пт: 8:00 - 19:00',
    phone: '+7 (4832) 74-25-89',
    tags: ['Лаборатории', 'Лекционные залы', 'Коворкинг', 'Столовая'],
  },
  {
    image: 'https://images.unsplash.com/photo-1496307653780-42ee777d4833?auto=format&fit=crop&w=1600&q=80',
    schedule: 'Пн-Пт: 9:00 - 21:00',
    phone: '+7 (495) 800-12-34',
    tags: ['Конференц-залы', 'Библиотека', 'Медиацентр', 'Кафе'],
  },
];

const getVisualData = (building: Building, index: number): BuildingVisual => {
  const preset = VISUAL_PRESETS[index % VISUAL_PRESETS.length];

  return {
    image: building.previewUrl || preset.image,
    schedule: preset.schedule,
    phone: preset.phone,
    tags: preset.tags,
  };
};

const CityPage: React.FC = () => {
  const { cityId } = useParams<{ cityId: string }>();
  const navigate = useNavigate();
  const [city, setCity] = useState<City | null>(null);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!cityId) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const [cityData, buildingsData] = await Promise.all([
          getCityById(cityId),
          getBuildingsByCity(cityId),
        ]);

        setCity(cityData);
        setBuildings(buildingsData);
        setError(null);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Не удалось загрузить данные города');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [cityId]);

  const filteredBuildings = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return buildings;

    return buildings.filter((building) => {
      const text = [building.name, building.address ?? '', building.description ?? '']
        .join(' ')
        .toLowerCase();
      return text.includes(query);
    });
  }, [buildings, search]);

  if (loading) {
    return (
      <div className="city-page-loading">
        <div className="spinner" />
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
      <SiteHeader title={city.name} subtitle={city.country} />

      <main className="city-main">
        <div className="city-top-actions">
          <button className="city-back-inline" onClick={() => navigate('/')}>
            <ArrowLeft size={18} />
            Назад
          </button>
        </div>

        <motion.div
          className="city-search-wrap"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Search size={20} className="city-search-icon" />
          <input
            className="city-search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск корпусов по названию или адресу..."
          />
        </motion.div>

        <h2 className="city-section-title">
          <Building2 size={30} />
          Корпуса
        </h2>

        {filteredBuildings.length === 0 ? (
          <div className="city-empty">
            <p className="city-empty-text">Корпуса по вашему запросу не найдены</p>
          </div>
        ) : (
          <div className="city-grid">
            {filteredBuildings.map((building, index) => {
              const visual = getVisualData(building, index);
              const shortTags = visual.tags.slice(0, 3);
              const moreCount = visual.tags.length - shortTags.length;

              return (
                <motion.article
                  key={building.id}
                  className="city-card"
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.32, delay: index * 0.06 }}
                >
                  <div className="city-card-image-wrap">
                    <img src={visual.image} alt={building.name} className="city-card-image" />
                    <div className="city-card-image-overlay" />
                    <h3 className="city-card-image-title">{building.name}</h3>
                  </div>

                  <div className="city-card-content">
                    <p className="city-card-row">
                      <MapPin size={18} />
                      {building.address || 'Адрес уточняется'}
                    </p>
                    <p className="city-card-row">
                      <Clock3 size={18} />
                      {visual.schedule}
                    </p>
                    <p className="city-card-row">
                      <Phone size={18} />
                      {visual.phone}
                    </p>

                    <p className="city-card-description">
                      {building.description || 'Описание корпуса пока не добавлено.'}
                    </p>

                    <div className="city-card-tags">
                      {shortTags.map((tag) => (
                        <span key={tag} className="city-tag">
                          {tag}
                        </span>
                      ))}
                      {moreCount > 0 ? <span className="city-tag city-tag-muted">+{moreCount}</span> : null}
                    </div>

                    <Link to={`/building/${building.id}`} className="city-card-button">
                      Подробнее
                      <ChevronRight size={16} />
                    </Link>
                  </div>
                </motion.article>
              );
            })}
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  );
};

export default CityPage;
