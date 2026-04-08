# Campus Panorama Web

Веб-приложение для просмотра 360° панорам кампуса РЭУ им. Г.В. Плеханова.

## Технологии

- **React 18** + **TypeScript**
- **Vite** - быстрый сборщик
- **Pannellum.js** - 360° viewer
- **React Router** - навигация
- **Axios** - HTTP запросы

## Установка

```bash
cd web
npm install
```

## Запуск

```bash
npm run dev
```

Приложение откроется на `http://localhost:5173`

## Переменные окружения

Создайте файл `.env`:

```env
VITE_API_BASE_URL=http://localhost:3000
```

Или для production:

```env
VITE_API_BASE_URL=https://your-backend-url.com
```

## Сборка

```bash
npm run build
```

Собранные файлы будут в папке `dist/`

## Структура проекта

```
web/
├── src/
│   ├── components/
│   │   ├── Header.tsx           — шапка с логотипом
│   │   ├── LocationCard.tsx     — карточка локации
│   │   └── PanoramaViewer.tsx   — 360° вьювер
│   ├── pages/
│   │   ├── HomePage.tsx         — список локаций
│   │   ├── PanoramaPage.tsx     — просмотр панорамы
│   │   └── AdminPage.tsx        — админ-панель
│   ├── services/
│   │   └── api.ts               — API запросы
│   ├── types/
│   │   └── index.ts             — TypeScript типы
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── index.html
├── vite.config.ts
└── package.json
```

## API Endpoints

- `GET /api/locations` - список всех локаций
- `GET /api/locations/:id` - локация по ID

## Дизайн

- **Тема**: тёмно-синяя (#0B1F4D)
- **Акцент**: голубой (#38BDF8)
- **Адаптивность**: мобильные и десктоп
