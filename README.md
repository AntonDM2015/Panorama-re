# Panorama 360 — Виртуальный тур по кампусу

Высокопроизводительное веб-приложение для просмотра 360° панорамных туров по кампусу РЭУ им. Г.В. Плеханова с собственным движком на WebGL2 и детализированной системой навигации в стиле Google Street View.

## Содержание

- [Ключевые возможности](#ключевые-возможности)
- [Архитектура проекта](#архитектура-проекта)
- [Технологический стек](#технологический-стек)
- [Быстрый старт](#быстрый-старт)
- [Структура базы данных](#структура-базы-данных)
- [API Endpoints](#api-endpoints)
- [Маршруты приложения](#маршруты-приложения)
- [Панель администратора](#панель-администратора)
- [Развертывание](#развертывание)
- [Миграции базы данных](#миграции-базы-данных)
- [Тестирование](#тестирование)
- [Документация](#документация)
- [Вклад в проект](#вклад-в-проект)
- [Лицензия](#лицензия)

---

## Ключевые возможности

- **Собственный WebGL2 движок**: Высокопроизводительная сферическая проекция (96x48 сегментов) для плавного просмотра панорам 360°×180°
- **Навигация Street View**: Перемещение между связанными точками с хотспотами и автоматическими переходами
- **Многокампусная архитектура**: Иерархия Город → Здание → Локация → Панорама с поддержкой нескольких городов
- **Премиальный UI/UX**: Адаптивный дизайн с темной и светлой темами, работающий на всех устройствах
- **Панель администратора**: Полный CRUD-контроль над контентом с интерактивным редактором навигационных связей
- **Мобильное приложение**: Нативный клиент на React Native + Expo для iOS и Android
- **JWT-аутентификация**: Двухуровневая система с access/refresh токенами и ролевой моделью (admin/student)
- **Готов к продакшну**: Конфигурации для Railway, Nixpacks, PM2, Docker-ready

---

## Архитектура проекта

```
Panorama/
├── backend/              # API сервер (Node.js + Express + TypeScript)
├── web/                  # Веб-клиент (React + Vite + TypeScript + WebGL2)
├── mobile/               # Мобильное приложение (React Native + Expo)
├── docs/                 # Техническая документация
├── Design_update/        # Альтернативный дизайн фронтенда
├── migrations/           # SQL-миграции для базы данных
└── tests/                # Автоматические тесты
```

### Компоненты системы

**Backend API:**
- RESTful API с JWT-аутентификацией
- Repository Pattern для работы с данными
- Middleware для валидации и обработки ошибок
- Rate limiting (120 req/min)
- Multer для загрузки файлов
- Zod для валидации схем данных

**Web Frontend:**
- React 18 с TypeScript
- Кастомный WebGL2-движок для рендеринга панорам
- React Router v6 для маршрутизации
- Framer Motion для анимаций
- Vanilla CSS с CSS-переменными для темизации

**Mobile App:**
- Expo SDK 54
- React Navigation 7
- WebView для встроенного просмотра
- React Native Reanimated 4

---

## Технологический стек

### Фронтенд (Web)
| Технология | Версия | Назначение |
|-----------|--------|-----------|
| React | 18.2 | UI-фреймворк |
| TypeScript | 5.3 | Типизация |
| Vite | 5 | Сборщик и dev-сервер |
| React Router | 6.20 | Маршрутизация |
| Axios | 1.6 | HTTP-клиент |
| Framer Motion | 12.38 | Анимации |
| Lucide React | 1.8 | Иконки |
| Radix UI | latest | UI-примитивы |
| WebGL2 | native | 3D-рендеринг панорам |

### Бэкенд
| Технология | Версия | Назначение |
|-----------|--------|-----------|
| Node.js | 18+ | Runtime |
| Express | 4.21 | Web-фреймворк |
| TypeScript | 5.7 | Типизация |
| Supabase SDK | 2.49 | Работа с PostgreSQL и Storage |
| JSON Web Token | 9.0 | Аутентификация |
| bcryptjs | 2.4 | Хеширование паролей |
| Multer | 1.45 | Загрузка файлов |
| Zod | 3.24 | Валидация данных |
| Helmet | 8 | Безопасность заголовков |
| express-rate-limit | 7.5 | Защита от DDoS |

### Мобильное приложение
| Технология | Версия | Назначение |
|-----------|--------|-----------|
| Expo SDK | 54 | Фреймворк |
| React Native | 0.81.5 | Кроссплатформенная разработка |
| React Navigation | 7 | Навигация |
| Reanimated | 4.1 | Анимации |
| WebView | 13.15 | Встроенный браузер |

### База данных и инфраструктура
| Технология | Назначение |
|-----------|-----------|
| Supabase (PostgreSQL) | Основная БД и хранилище файлов |
| Railway | Платформа для деплоя |
| Nixpacks | Автоматическая сборка |
| PM2 | Процесс-менеджер для продакшна |

---

## Быстрый старт

### Предварительные требования

- **Node.js** v18 или выше
- **npm** v9 или выше
- **Аккаунт Supabase** (бесплатный план подходит для разработки)
- **Git**

### 1. Клонирование репозитория

```bash
git clone https://github.com/your-username/panorama.git
cd panorama
```

### 2. Настройка базы данных (Supabase)

1. Создайте новый проект на [supabase.com](https://supabase.com)
2. Перейдите в **SQL Editor** и выполните миграции по порядку:

```sql
-- 1. Основная схема и тестовые данные
-- Скопируйте содержимое backend/src/config/schema.sql

-- 2. Детали зданий (адрес, телефон, удобства, карта)
-- Скопируйте содержимое backend/migrations/add_building_details.sql

-- 3. Связи между панорамами (навигация Street View)
-- Скопируйте содержимое backend/migrate_panorama_links.sql
```

3. Создайте публичный бакет для хранения панорам:
   - Перейдите в **Storage** → **New bucket**
   - Название: `panoramas`
   - Отметьте **Public bucket**

4. Создайте пользователя-администратора:
```sql
-- Скопируйте содержимое backend/create_admin_user.sql
-- Или используйте SQL Editor для создания пользователя с role = 'admin'
```

### 3. Настройка бэкенда

```bash
cd backend

# Установка зависимостей
npm install

# Создание файла окружения
cp .env.example .env

# Откройте .env и заполните:
# SUPABASE_URL=https://your-project.supabase.co
# SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
# JWT_ACCESS_SECRET=your-random-secret
# JWT_REFRESH_SECRET=your-random-secret
```

Запуск в режиме разработки:
```bash
npm run dev
# Сервер запустится на http://localhost:5000
```

### 4. Настройка веб-фронтенда

```bash
cd ../web

# Установка зависимостей
npm install

# Создание файла окружения
cp .env.example .env

# Откройте .env и укажите:
# VITE_API_BASE_URL=http://localhost:5000
```

Запуск в режиме разработки:
```bash
npm run dev
# Vite dev server запустится на http://localhost:5173
```

### 5. Мобильное приложение (опционально)

```bash
cd ../mobile

# Установка зависимостей
npm install

# Запуск Expo DevTools
npm start

# Следуйте инструкциям для запуска на эмуляторе или устройстве
# Android: npm run android
# iOS: npm run ios (требуется macOS)
```

### 6. Проверка работоспособности

1. Откройте http://localhost:5173 в браузере
2. Перейдите на `/admin` и войдите с учетными данными администратора
3. Добавьте город → здание → локацию → панораму
4. Проверьте отображение на главной странице

---

## Структура базы данных

### Схема данных

```
┌─────────     ┌──────────┐     ┌───────────┐     ┌───────────┐
│  Users  │     │  Cities  │────▶│ Buildings │────▶│ Locations │
└─────────     └──────────┘     └──────────     └───────────
                                          │                │
                                    ┌─────┘                │
                                    ▼                      ▼
                              ┌──────────          ┌───────────
                              │Panoramas │          │Nav Links  │
                              └──────────┘          └───────────┘
```

### Таблицы

#### `users` — Пользователи системы
| Поле | Тип | Описание |
|-----|-----|----------|
| id | UUID | Первичный ключ |
| email | VARCHAR(255) | Уникальный email |
| password_hash | TEXT | Хешированный пароль (bcrypt) |
| role | VARCHAR(20) | Роль: `student` или `admin` |

#### `cities` — Города
| Поле | Тип | Описание |
|-----|-----|----------|
| id | UUID | Первичный ключ |
| name | TEXT | Название города |
| country | TEXT | Страна (по умолчанию: Россия) |
| created_at | TIMESTAMPTZ | Дата создания |

#### `buildings` — Здания/корпуса
| Поле | Тип | Описание |
|-----|-----|----------|
| id | UUID | Первичный ключ |
| city_id | UUID | Внешний ключ → cities |
| name | TEXT | Название корпуса |
| address | TEXT | Адрес здания |
| description | TEXT | Описание корпуса |
| preview_url | TEXT | URL превью-изображения |
| working_hours | TEXT | Режим работы (например: "Пн-Пт: 8:00 - 20:00") |
| phone | TEXT | Контактный телефон |
| facilities | TEXT[] | Массив удобств |
| map_url | TEXT | Ссылка на карту (Google/Yandex Maps) |
| created_at | TIMESTAMPTZ | Дата создания |

#### `locations` — Локации (помещения, зоны)
| Поле | Тип | Описание |
|-----|-----|----------|
| id | UUID | Первичный ключ |
| building_id | UUID | Внешний ключ → buildings |
| name | TEXT | Название локации |
| description | TEXT | Описание |
| floor | INTEGER | Этаж (-1: подвал, 0: цоколь, 1+: этажи) |
| type | TEXT | Тип: `location` или `room` |
| room_number | TEXT | Номер кабинета |
| preview_url | TEXT | URL превью |
| panorama_url | TEXT | URL основной панорамы (legacy) |
| created_at | TIMESTAMPTZ | Дата создания |

#### `panoramas` — Панорамные изображения
| Поле | Тип | Описание |
|-----|-----|----------|
| id | UUID | Первичный ключ |
| location_id | UUID | Внешний ключ → locations |
| url | TEXT | URL изображения (эквидистантная проекция) |
| title | TEXT | Название панорамы |
| sort_order | INTEGER | Порядок сортировки |
| created_at | TIMESTAMPTZ | Дата создания |

#### `panorama_links` — Связи между панорамами
| Поле | Тип | Описание |
|-----|-----|----------|
| id | UUID | Первичный ключ |
| from_panorama_id | UUID | Исходная панорама |
| to_panorama_id | UUID | Целевая панорама |
| direction | TEXT | Направление перехода |
| created_at | TIMESTAMPTZ | Дата создания |

#### `navigation_links` — Навигация между локациями
| Поле | Тип | Описание |
|-----|-----|----------|
| id | UUID | Первичный ключ |
| from_location_id | UUID | Исходная локация |
| to_location_id | UUID | Целевая локация |
| direction | TEXT | Направление |
| created_at | TIMESTAMPTZ | Дата создания |

---

## API Endpoints

### Базовый URL
- Development: `http://localhost:5000`
- Production: `https://your-domain.railway.app`

### Аутентификация

| Метод | Эндпоинт | Доступ | Описание |
|-------|----------|--------|----------|
| POST | `/api/auth/register` | Публичный | Регистрация нового пользователя |
| POST | `/api/auth/login` | Публичный | Вход (возвращает access + refresh token) |
| GET | `/api/auth/me` | Авторизован | Профиль текущего пользователя |

### Города (Cities)

| Метод | Эндпоинт | Доступ | Описание |
|-------|----------|--------|----------|
| GET | `/api/cities` | Публичный | Список всех городов |
| GET | `/api/cities/:id` | Публичный | Город по ID |
| POST | `/api/cities` | Admin | Создать город |
| PUT | `/api/cities/:id` | Admin | Обновить город |
| DELETE | `/api/cities/:id` | Admin | Удалить город (cascade: здания, локации) |

### Здания (Buildings)

| Метод | Эндпоинт | Доступ | Описание |
|-------|----------|--------|----------|
| GET | `/api/buildings` | Публичный | Список всех зданий |
| GET | `/api/buildings/:id` | Публичный | Здание по ID |
| GET | `/api/cities/:cityId/buildings` | Публичный | Здания конкретного города |
| POST | `/api/buildings` | Admin | Создать здание |
| PUT | `/api/buildings/:id` | Admin | Обновить здание |
| DELETE | `/api/buildings/:id` | Admin | Удалить здание (cascade: локации) |

### Локации (Locations)

| Метод | Эндпоинт | Доступ | Описание |
|-------|----------|--------|----------|
| GET | `/api/locations` | Публичный | Все локации |
| GET | `/api/locations/:id` | Публичный | Локация по ID (с панорамами) |
| GET | `/api/buildings/:buildingId/locations` | Публичный | Локации здания |
| GET | `/api/locations/panoramas` | Публичный | Все панорамы всех локаций |
| GET | `/api/locations/:locationId/panoramas` | Публичный | Панорамы конкретной локации |
| POST | `/api/locations` | Admin | Создать локацию |
| PUT | `/api/locations/:id` | Admin | Обновить локацию |
| DELETE | `/api/locations/:id` | Admin | Удалить локацию |

### Панорамы (Panoramas)

| Метод | Эндпоинт | Доступ | Описание |
|-------|----------|--------|----------|
| POST | `/api/locations/:locationId/panoramas` | Admin | Добавить панораму |
| PUT | `/api/locations/panoramas/:id` | Admin | Обновить панораму |
| DELETE | `/api/locations/panoramas/:id` | Admin | Удалить панораму |

### Связи панорам (Panorama Links)

| Метод | Эндпоинт | Доступ | Описание |
|-------|----------|--------|----------|
| GET | `/api/locations/panoramas/:panoramaId/links` | Публичный | Связи панорамы |
| POST | `/api/locations/panoramas/:panoramaId/links` | Admin | Создать связь |
| DELETE | `/api/locations/panorama-links/:id` | Admin | Удалить связь |

### Системные эндпоинты

| Метод | Эндпоинт | Описание |
|-------|----------|----------|
| GET | `/api/health` | Проверка работоспособности сервера |
| GET | `/panoramas/:filename` | Отдача изображений панорам |

### Формат запросов

**Заголовки авторизации:**
```http
Authorization: Bearer <access_token>
```

**Пример создания здания:**
```http
POST /api/buildings
Authorization: Bearer <token>
Content-Type: application/json

{
  "cityId": "uuid",
  "name": "Главный корпус",
  "address": "Стремянный пер., 36",
  "description": "Основной учебный корпус",
  "previewUrl": "https://...",
  "workingHours": "Пн-Пт: 8:00 - 20:00",
  "phone": "+7 (495) 958-20-48",
  "facilities": ["Аудитории", "Библиотека", "Столовая"],
  "mapUrl": "https://yandex.ru/maps/..."
}
```

**Пример ответа:**
```json
{
  "building": {
    "id": "uuid",
    "cityId": "uuid",
    "name": "Главный корпус",
    "address": "Стремянный пер., 36",
    "description": "Основной учебный корпус",
    "previewUrl": "https://...",
    "workingHours": "Пн-Пт: 8:00 - 20:00",
    "phone": "+7 (495) 958-20-48",
    "facilities": ["Аудитории", "Библиотека", "Столовая"],
    "mapUrl": "https://yandex.ru/maps/...",
    "createdAt": "2026-04-10T12:00:00Z"
  }
}
```

---

## Маршруты приложения

### Веб-приложение

| Путь | Компонент | Описание |
|------|-----------|----------|
| `/` | HomePage | Главная страница — список городов |
| `/city/:cityId` | CityPage | Страница города — список зданий |
| `/building/:buildingId` | BuildingPage | Страница здания — локации с аккордеоном |
| `/panorama/:locationId` | PanoramaPage | Просмотр отдельной панорамы |
| `/admin` | AdminPage | Панель администратора |

### Мобильное приложение

Маршруты аналогичны веб-версии, адаптированы под React Navigation.

---

## Панель администратора

Панель администратора (`/admin`) предоставляет полный контроль над контентом виртуального тура.

### Функциональность

**Управление городами:**
- Создание/редактирование/удаление городов
- Указание страны

**Управление зданиями:**
- Создание/редактирование/удаление зданий
- Привязка к городу
- Заполнение детальной информации:
  - Адрес
  - Описание
  - URL превью-изображения
  - Режим работы
  - Контактный телефон
  - Список удобств (интерактивные теги)
  - Ссылка на карту (Google Maps, Yandex Maps)

**Управление локациями:**
- Создание/редактирование/удаление локаций
- Тип локации: общая зона или кабинет
- Указание этажа
- Номер кабинета (для типа `room`)

**Управление панорамами:**
- Добавление до 20 панорам на локацию
- Указание порядка отображения
- Настройка навигационных связей между панорамами
- Удаление панорам

**Навигационные связи:**
- Создание переходов между панорамами
- Указание направления перехода
- Визуальный редактор связей

### Безопасность

- Требуется аутентификация (JWT)
- Только пользователи с ролью `admin` имеют доступ к CRUD-операциям
- Публичные эндпоинты доступны без авторизации

---

## Развертывание

### Railway (рекомендуемый способ)

**Backend:**
```bash
cd backend

# Инициализация проекта в Railway
railway init

# Установка переменных окружения
railway variables set SUPABASE_URL=https://your-project.supabase.co
railway variables set SUPABASE_SERVICE_ROLE_KEY=your-key
railway variables set JWT_ACCESS_SECRET=your-secret
railway variables set JWT_REFRESH_SECRET=your-secret

# Деплой
railway up
```

**Web:**
```bash
cd web

# Инициализация проекта в Railway
railway init

# Установка переменных окружения
railway variables set VITE_API_BASE_URL=https://your-backend.railway.app

# Деплой
railway up
```

### Docker

**Backend:**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY dist/ ./dist/
EXPOSE 5000
CMD ["node", "dist/server.js"]
```

**Web:**
```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Переменные окружения для продакшна

**Backend:**
```env
NODE_ENV=production
PORT=5000
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
JWT_ACCESS_SECRET=your-secure-random-string-min-32-chars
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_SECRET=another-secure-random-string
JWT_REFRESH_EXPIRES_IN=7d
SUPABASE_BUCKET=panoramas
CORS_ORIGIN=https://your-frontend-domain.com
```

**Web:**
```env
VITE_API_BASE_URL=https://your-backend-domain.com
```

---

## Миграции базы данных

### Порядок применения миграций

1. **Основная схема** (`backend/src/config/schema.sql`)
   - Создание всех таблиц
   - Индексы для оптимизации запросов
   - Тестовые данные

2. **Детали зданий** (`backend/migrations/add_building_details.sql`)
   - Поля: `working_hours`, `phone`, `facilities`, `map_url`

3. **Связи панорам** (`backend/migrate_panorama_links.sql`)
   - Таблица `panorama_links` для навигации между панорамами

4. **Навигационные связи локаций** (`backend/migrate_navigation_links.sql`)
   - Таблица `navigation_links` для Street View навигации между локациями

### Применение миграций

```sql
-- Через Supabase SQL Editor
-- Скопируйте содержимое каждого файла и выполните по порядку

-- Или через psql
psql -h db.your-project.supabase.co -U postgres -d postgres
\i backend/src/config/schema.sql
\i backend/migrations/add_building_details.sql
\i backend/migrate_panorama_links.sql
\i backend/migrate_navigation_links.sql
```

### Откат миграций

См. `MIGRATION_INSTRUCTIONS.md` для инструкций по откату изменений.

---

## Тестирование

### Запуск тестов

```bash
# Backend тесты (если настроены)
cd backend
npm test

# Фронтенд тесты
cd web
npm test

# Интеграционные тесты API
node test-implementation.js
```

### Контрольный список тестирования

См. `TESTING_GUIDE.md` для полного списка тестовых сценариев.

**Основные сценарии:**
- [x] Аутентификация (регистрация, логин, выход)
- [x] CRUD операции для городов
- [x] CRUD операции для зданий
- [x] CRUD операции для локаций
- [x] Загрузка и управление панорамами
- [x] Навигация Street View
- [x] Отображение панорам в WebGL2
- [x] Адаптивный дизайн (mobile/desktop)
- [x] Переключение тем

---

## Документация

Подробная документация доступна в папке `docs/`:

| Документ | Описание |
|----------|----------|
| [API Reference](docs/api.md) | Полное описание всех эндпоинтов API |
| [Deployment Guide](docs/deployment.md) | Пошаговое руководство по развертыванию |
| [Admin Guide](docs/admin_guide.md) | Инструкция по управлению контентом |
| [Technical Details](docs/technical_details.md) | Архитектура WebGL2-движка и навигации |

### Дополнительные файлы

| Файл | Описание |
|------|----------|
| `MIGRATION_INSTRUCTIONS.md` | Инструкция по применению SQL-миграций |
| `NAVIGATION_LINKS_GUIDE.md` | Руководство по настройке навигации Street View |
| `TESTING_GUIDE.md` | Контрольный список тестирования |
| `TEST_RESULTS.md` | Результаты автоматических тестов |

---

## Вклад в проект

Мы приветствуем вклад в развитие проекта!

### Как внести изменения

1. Форкните репозиторий
2. Создайте feature-ветку (`git checkout -b feature/amazing-feature`)
3. Внесите изменения и протестируйте
4. Зафиксируйте изменения (`git commit -m 'Add amazing feature'`)
5. Отправьте в удаленный репозиторий (`git push origin feature/amazing-feature`)
6. Откройте Pull Request

### Стандарты кода

- TypeScript strict mode
- ESLint для линтинга
- Именование компонентов: PascalCase
- Именование функций и переменных: camelCase
- Коммиты: Conventional Commits specification

### Code Review

Все Pull Request проходят ревью. Убедитесь, что:
- Код проходит линтинг (`npm run lint`)
- Сборка проходит успешно (`npm run build`)
- Тесты проходят (`npm test`)
- Документация обновлена

---

## Лицензия

© 2026 Команда Panorama 360

Проект разработан для РЭУ им. Г.В. Плеханова.

---

## Контакты и поддержка

- **Email**: panorama@rea.ru
- **GitHub Issues**: [Сообщить о баге](https://github.com/your-username/panorama/issues)
- **Документация**: [docs/](docs/)

---

## Благодарности

- **RЭУ им. Г.В. Плеханова** — за поддержку проекта
- **Supabase** — за отличную платформу для базы данных
- **React Team** — за превосходный UI-фреймворк
- **Three.js community** — за вдохновение для WebGL2-движка

---

<div align="center">
  <strong>Сделано командой Panorama 360</strong>
</div>
