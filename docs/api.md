# Справочник API

Бэкенд Panorama 360 представляет собой RESTful API, построенный на Express и TypeScript.

## 1. Аутентификация

API использует JWT для аутентификации. Администраторы имеют специальную роль, которая позволяет им изменять контент.

### 1.1 Вход (Login)
`POST /api/auth/login`
- **Тело (Body)**: `{ "email": "...", "password": "..." }`
- **Ответ (Response)**: `{ "tokens": { "accessToken": "...", "refreshToken": "..." }, "user": { ... } }`

---

## 2. Управление контентом

### 2.1 Глобальный поиск
- **GET /api/locations**: Возвращает все локации.
- **GET /api/locations/panoramas**: Возвращает все панорамы всех локаций.

### 2.2 Здания и локации
- **GET /api/buildings**: Список всех зданий.
- **GET /api/locations/:id**: Получить информацию о конкретной локации.
- **GET /api/locations/:locationId/panoramas**: Получить все панорамы для локации.

---

## 3. Навигационные ссылки панорам

Это ядро системы виртуального тура.

### 3.1 Получение ссылок
- **GET /api/locations/panoramas/:panoramaId/links**
- **Ответ**: `[ { "id": "...", "fromPanoramaId": "...", "toPanoramaId": "...", "direction": "90" } ]`

### 3.2 Создание ссылки (только для администраторов)
- **POST /api/locations/panoramas/:panoramaId/links**
- **Тело**: `{ "toPanoramaId": "...", "direction": "180" }`

### 3.3 Удаление ссылки (только для администраторов)
- **DELETE /api/locations/panorama-links/:id**

---

## 4. Модели данных

### 4.1 Панорама (Panorama)
```typescript
{
  id: string;
  locationId: string;
  url: string;
  title: string | null;
  sortOrder: number;
}
```

### 4.2 Ссылка панорамы (PanoramaLink)
```typescript
{
  id: string;
  fromPanoramaId: string;
  toPanoramaId: string;
  direction: string | null; // Направление в градусах (0-360)
}
```

## 5. Структура директорий
Все маршруты имеют префикс `/api/locations`, за исключением общей аутентификации.
Полную реализацию маршрутизации см. в файле `backend/src/routes/location.routes.ts`.
