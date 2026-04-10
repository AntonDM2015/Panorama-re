import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Building2, CheckCircle2, Clock3, MapPin, Navigation, Phone } from 'lucide-react';
import {
  getBuildingById,
  getCityById,
  getLocationsByBuilding,
  getPanoramasByLocation,
} from '../services/api';
import { Building, Location } from '../types';
import PanoramaViewer from '../components/PanoramaViewer';
import StreetViewMode from '../components/StreetViewMode';
import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';
import './BuildingPage.css';

interface BuildingProfile {
  matches: string[];
  image: string;
  facilities: string[];
  workingHours: string;
  phone: string;
}

const DESIGN_PROFILES: BuildingProfile[] = [
  {
    matches: ['спартаковская 112', 'spartakovskaya 112'],
    image:
      'https://images.unsplash.com/photo-1679653226697-2b0fbf7c17f7?auto=format&fit=crop&w=1600&q=80',
    facilities: ['Аудитории', 'Компьютерные классы', 'Библиотека', 'Столовая', 'Спортзал'],
    workingHours: 'Пн-Пт: 8:00 - 20:00, Сб: 9:00 - 15:00',
    phone: '+7 (4832) 74-37-36',
  },
  {
    matches: ['бежицкая 95', 'bezhitskaya 95'],
    image:
      'https://images.unsplash.com/photo-1604147706283-d7119b5b822c?auto=format&fit=crop&w=1600&q=80',
    facilities: ['Лаборатории', 'Лекционные залы', 'Коворкинг', 'Кафетерий'],
    workingHours: 'Пн-Пт: 8:00 - 19:00',
    phone: '+7 (4832) 74-25-89',
  },
  {
    matches: ['красногвардейская 32', 'krasnogvardeiskaya 32'],
    image:
      'https://images.unsplash.com/photo-1721657197499-5c12825c3a11?auto=format&fit=crop&w=1600&q=80',
    facilities: ['Общежитие', 'Столовая', 'Прачечная', 'Спортивная площадка'],
    workingHours: 'Круглосуточно',
    phone: '+7 (4832) 74-18-42',
  },
  {
    matches: ['стремянный 36', 'stremyanny 36'],
    image:
      'https://images.unsplash.com/photo-1614763607331-7163d2545757?auto=format&fit=crop&w=1600&q=80',
    facilities: ['Аудитории', 'Библиотека', 'Музей', 'Актовый зал', 'Столовая', 'Буфеты'],
    workingHours: 'Пн-Пт: 7:00 - 22:00, Сб: 9:00 - 18:00',
    phone: '+7 (495) 958-20-48',
  },
  {
    matches: ['стремянный 28', 'stremyanny 28'],
    image:
      'https://images.unsplash.com/photo-1730656447409-eacbfc60dd47?auto=format&fit=crop&w=1600&q=80',
    facilities: ['Компьютерные классы', 'Конференц-залы', 'Коворкинг', 'Кафе'],
    workingHours: 'Пн-Пт: 8:00 - 21:00',
    phone: '+7 (495) 958-21-95',
  },
  {
    matches: ['верхняя радищевская', 'verkhnyaya radischevskaya'],
    image:
      'https://images.unsplash.com/photo-1561124928-eda0f74e3847?auto=format&fit=crop&w=1600&q=80',
    facilities: ['Общежитие', 'Столовая', 'Прачечная', 'Тренажерный зал', 'Библиотека'],
    workingHours: 'Круглосуточно',
    phone: '+7 (495) 958-23-67',
  },
  {
    matches: ['зацепский вал 41', 'zatsepsky 41'],
    image:
      'https://images.unsplash.com/photo-1759200135568-566eb9ecaa81?auto=format&fit=crop&w=1600&q=80',
    facilities: ['Бассейн', 'Спортзалы', 'Тренажерный зал', 'Теннисные корты', 'Раздевалки'],
    workingHours: 'Пн-Пт: 7:00 - 22:00, Сб-Вс: 9:00 - 20:00',
    phone: '+7 (495) 958-24-89',
  },
];

const FALLBACK_PROFILES: Omit<BuildingProfile, 'matches'>[] = [
  {
    image:
      'https://images.unsplash.com/photo-1679653226697-2b0fbf7c17f7?auto=format&fit=crop&w=1600&q=80',
    facilities: ['Аудитории', 'Библиотека', 'Коворкинг'],
    workingHours: 'Пн-Пт: 8:00 - 20:00',
    phone: '+7 (800) 000-00-00',
  },
  {
    image:
      'https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=1600&q=80',
    facilities: ['Лаборатории', 'Компьютерные классы', 'Столовая'],
    workingHours: 'Пн-Пт: 8:00 - 19:00',
    phone: '+7 (800) 111-11-11',
  },
  {
    image:
      'https://images.unsplash.com/photo-1496307653780-42ee777d4833?auto=format&fit=crop&w=1600&q=80',
    facilities: ['Конференц-залы', 'Библиотека', 'Медиацентр'],
    workingHours: 'Пн-Пт: 9:00 - 21:00',
    phone: '+7 (800) 222-22-22',
  },
];

const normalizeText = (value: string): string =>
  value
    .toLowerCase()
    .replace(/ё/g, 'е')
    .replace(/[^a-zа-я0-9]+/gi, ' ')
    .trim();

const getBuildingProfile = (building: Building): Omit<BuildingProfile, 'matches'> => {
  const haystack = normalizeText(`${building.name} ${building.address ?? ''}`);
  const matched = DESIGN_PROFILES.find((profile) =>
    profile.matches.some((match) => haystack.includes(normalizeText(match)))
  );

  if (matched) {
    return {
      image: building.previewUrl || matched.image,
      facilities: matched.facilities,
      workingHours: matched.workingHours,
      phone: matched.phone,
    };
  }

  const checksum = building.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const fallback = FALLBACK_PROFILES[checksum % FALLBACK_PROFILES.length];
  return {
    image: building.previewUrl || fallback.image,
    facilities: fallback.facilities,
    workingHours: fallback.workingHours,
    phone: fallback.phone,
  };
};

const floorLabel = (floor: number): string => {
  if (floor === -999) return 'Этаж не указан';
  if (floor === 0) return 'Цокольный этаж';
  if (floor === -1) return 'Подвал';
  return `${floor} этаж`;
};

const BuildingPage: React.FC = () => {
  const { buildingId } = useParams<{ buildingId: string }>();
  const navigate = useNavigate();

  const [building, setBuilding] = useState<Building | null>(null);
  const [cityName, setCityName] = useState<string>('Корпус');
  const [locations, setLocations] = useState<Location[]>([]);
  const [activeTab, setActiveTab] = useState<'locations' | 'rooms'>('locations');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedLocation, setExpandedLocation] = useState<string | null>(null);
  const [showStreetView, setShowStreetView] = useState(false);
  const [currentPanoramaIndex, setCurrentPanoramaIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!buildingId) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const buildingData = await getBuildingById(buildingId);
        setBuilding(buildingData);

        if (buildingData.cityId) {
          try {
            const city = await getCityById(buildingData.cityId);
            setCityName(city.name);
          } catch (cityErr) {
            console.error('[BuildingPage] Failed to load city:', cityErr);
          }
        }

        const locationsData = await getLocationsByBuilding(buildingId);
        const locationsWithPanoramas = await Promise.all(
          locationsData.map(async (location) => {
            try {
              const panoramas = await getPanoramasByLocation(location.id);
              return { ...location, panoramas };
            } catch (panoramaErr) {
              console.error(`[BuildingPage] Failed to load panoramas for ${location.name}:`, panoramaErr);
              return location;
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
    setExpandedLocation((prev) => (prev === locationId ? null : locationId));
    setCurrentPanoramaIndex(0);
  }, []);

  const handlePanoramaLoad = useCallback(() => {}, []);

  const handlePanoramaError = useCallback((err: string) => {
    console.error('[BuildingPage] Panorama error:', err);
  }, []);

  const filteredLocations = useMemo(
    () =>
      locations.filter((location) => {
        if (activeTab === 'locations') return location.type === 'location';
        return (
          location.type === 'room' &&
          (location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (location.roomNumber &&
              location.roomNumber.toLowerCase().includes(searchQuery.toLowerCase())))
        );
      }),
    [locations, activeTab, searchQuery]
  );

  const sortedFloorGroups = useMemo(() => {
    const floorGroups = filteredLocations.reduce<Record<number, Location[]>>((acc, location) => {
      const floor = location.floor !== null && location.floor !== undefined ? location.floor : -999;
      if (!acc[floor]) acc[floor] = [];
      acc[floor].push(location);
      return acc;
    }, {});

    return Object.entries(floorGroups)
      .sort(([a], [b]) => Number(a) - Number(b))
      .map(([floor, floorLocations]) => ({ floor: Number(floor), locations: floorLocations }));
  }, [filteredLocations]);

  const buildingProfile = building ? getBuildingProfile(building) : null;

  const handleOpenMap = useCallback(() => {
    if (!building) return;
    const query = encodeURIComponent(building.address || building.name);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank', 'noopener,noreferrer');
  }, [building]);

  if (loading) {
    return (
      <div className="building-page-state">
        <div className="spinner" />
        <p className="building-page-state-text">Загрузка...</p>
      </div>
    );
  }

  if (error || !building || !buildingProfile) {
    return (
      <div className="building-page-state">
        <h2 className="building-page-state-title">Ошибка</h2>
        <p className="building-page-state-text">{error || 'Корпус не найден'}</p>
        <button onClick={() => navigate('/')} className="building-secondary-button">
          На главную
        </button>
      </div>
    );
  }

  return (
    <div className="building-page">
      <SiteHeader 
        title={building.name} 
        subtitle={cityName} 
        backTo="/"
        backLabel="Главное меню"
      />

      <main className="building-main">
        <div className="building-shell">
          <button
            className="building-back-link"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={18} />
            Назад
          </button>

          <div className="building-layout">
            <section className="building-primary-column">
              <article className="building-hero-card">
                <img src={buildingProfile.image} alt={building.name} className="building-hero-image" />
                <div className="building-hero-overlay" />
                <div className="building-hero-content">
                  <h1>{building.name}</h1>
                  <p>
                    <MapPin size={20} />
                    {building.address || 'Адрес уточняется'}
                  </p>
                </div>
              </article>

              <article className="building-info-card">
                <div className="building-info-title">
                  <Building2 size={24} />
                  <h2>О корпусе</h2>
                </div>
                <p>{building.description || 'Описание корпуса пока не добавлено.'}</p>
              </article>

              <article className="building-info-card">
                <div className="building-info-title">
                  <CheckCircle2 size={24} />
                  <h2>Удобства</h2>
                </div>
                <div className="building-facilities-grid">
                  {buildingProfile.facilities.map((facility) => (
                    <div key={facility} className="building-facility-pill">
                      <CheckCircle2 size={16} />
                      <span>{facility}</span>
                    </div>
                  ))}
                </div>
              </article>

              <article className="building-tour-card">
                <h3>Виртуальный тур</h3>
                <p>Совершите виртуальную экскурсию по корпусу и ознакомьтесь со всеми помещениями.</p>
                <button
                  className="building-tour-button"
                  onClick={() => setShowStreetView(true)}
                  disabled={locations.length === 0}
                >
                  Начать тур
                </button>
              </article>
            </section>

            <aside className="building-sidebar-column">
              <div className="building-contact-card">
                <h3>Контактная информация</h3>

                <div className="building-contact-item">
                  <div className="building-contact-icon building-contact-icon-blue">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <p>Адрес</p>
                    <span>{building.address || 'Адрес уточняется'}</span>
                  </div>
                </div>

                <div className="building-contact-item">
                  <div className="building-contact-icon building-contact-icon-green">
                    <Clock3 size={18} />
                  </div>
                  <div>
                    <p>Режим работы</p>
                    <span>{buildingProfile.workingHours}</span>
                  </div>
                </div>

                <div className="building-contact-item">
                  <div className="building-contact-icon building-contact-icon-purple">
                    <Phone size={18} />
                  </div>
                  <div>
                    <p>Телефон</p>
                    <a href={`tel:${buildingProfile.phone.replace(/\s/g, '')}`}>{buildingProfile.phone}</a>
                  </div>
                </div>

                <button className="building-map-button" onClick={handleOpenMap}>
                  <Navigation size={18} />
                  Открыть на карте
                </button>
              </div>
            </aside>
          </div>

          <section className="building-panorama-section">
            <div className="building-panorama-tabs">
              <button
                className={`building-panorama-tab ${activeTab === 'locations' ? 'is-active' : ''}`}
                onClick={() => setActiveTab('locations')}
              >
                Локации
              </button>
              <button
                className={`building-panorama-tab ${activeTab === 'rooms' ? 'is-active' : ''}`}
                onClick={() => setActiveTab('rooms')}
              >
                Кабинеты
              </button>
            </div>

            {activeTab === 'rooms' ? (
              <div className="building-search-wrap">
                <input
                  type="text"
                  placeholder="Поиск кабинета..."
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  className="building-search-input"
                />
              </div>
            ) : null}

            {sortedFloorGroups.length === 0 ? (
              <div className="building-empty-state">
                {activeTab === 'locations' ? 'Локации пока не добавлены' : 'Кабинеты пока не добавлены'}
              </div>
            ) : (
              sortedFloorGroups.map(({ floor, locations: floorLocations }) => (
                <div key={floor} className="building-floor-block">
                  <h4>{floorLabel(floor)}</h4>
                  <div className="building-accordion-list">
                    {floorLocations.map((location) => (
                      <div key={location.id} className="building-accordion-item">
                        <button
                          className={`building-accordion-head ${
                            expandedLocation === location.id ? 'is-expanded' : ''
                          }`}
                          onClick={() => handleLocationClick(location.id)}
                        >
                          <div className="building-accordion-icon">{location.type === 'room' ? '🚪' : '📍'}</div>
                          <div className="building-accordion-content">
                            <h5>{location.name}</h5>
                            {location.description ? <p>{location.description}</p> : null}
                            {location.roomNumber ? <span>Кабинет {location.roomNumber}</span> : null}
                          </div>
                          <div className="building-accordion-arrow">
                            {expandedLocation === location.id ? '▲' : '▼'}
                          </div>
                        </button>

                        {expandedLocation !== location.id &&
                        location.panoramas &&
                        location.panoramas.length > 0 ? (
                          <div
                            className="building-location-preview"
                            onClick={(event) => {
                              event.stopPropagation();
                              handleLocationClick(location.id);
                            }}
                          >
                            <img
                              src={location.panoramas[0].url}
                              alt={location.name}
                              className="building-location-preview-image"
                            />
                            {location.panoramas.length > 1 ? (
                              <div className="building-panorama-counter-badge">
                                {location.panoramas.length} фото
                              </div>
                            ) : null}
                          </div>
                        ) : null}

                        {expandedLocation === location.id ? (
                          <div className="building-panorama-wrap">
                            {location.panoramas && location.panoramas.length > 0 ? (
                              <>
                                <div className={`panorama-viewer-wrapper ${isTransitioning ? 'panorama-transitioning' : ''}`}>
                                  <PanoramaViewer
                                    key={location.panoramas[currentPanoramaIndex]?.url || location.panoramas[0].url}
                                    imageUrl={
                                      location.panoramas[currentPanoramaIndex]?.url || location.panoramas[0].url
                                    }
                                    onLoad={handlePanoramaLoad}
                                    onError={handlePanoramaError}
                                  />
                                </div>

                                {location.panoramas.length > 1 ? (
                                  <div className="building-panorama-nav">
                                    <button
                                      className="building-nav-btn"
                                      onClick={() => {
                                        setIsTransitioning(true);
                                        setTimeout(() => {
                                          setCurrentPanoramaIndex((prev) =>
                                            prev > 0 ? prev - 1 : location.panoramas!.length - 1
                                          );
                                          setIsTransitioning(false);
                                        }, 300);
                                      }}
                                    >
                                      ‹
                                    </button>
                                    <span className="building-panorama-counter-text">
                                      {currentPanoramaIndex + 1} из {location.panoramas.length}
                                    </span>
                                    <button
                                      className="building-nav-btn"
                                      onClick={() => {
                                        setIsTransitioning(true);
                                        setTimeout(() => {
                                          setCurrentPanoramaIndex((prev) =>
                                            prev < location.panoramas!.length - 1 ? prev + 1 : 0
                                          );
                                          setIsTransitioning(false);
                                        }, 300);
                                      }}
                                    >
                                      ›
                                    </button>
                                  </div>
                                ) : null}
                              </>
                            ) : location.panoramaUrl ? (
                              <PanoramaViewer
                                key={location.panoramaUrl}
                                imageUrl={location.panoramaUrl}
                                onLoad={handlePanoramaLoad}
                                onError={handlePanoramaError}
                              />
                            ) : (
                              <div className="building-panorama-placeholder">
                                Панорама еще не добавлена
                              </div>
                            )}
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </section>
        </div>
      </main>

      <SiteFooter />

      {showStreetView ? (
        <StreetViewMode
          locations={locations}
          startLocationId={expandedLocation || locations[0]?.id || ''}
          onClose={() => setShowStreetView(false)}
        />
      ) : null}
    </div>
  );
};

export default BuildingPage;
