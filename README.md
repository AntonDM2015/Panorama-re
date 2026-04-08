# Campus Panorama 360

Кроссплатформенное мобильное приложение колледжа для просмотра панорамных фотографий кампуса (360°).

## Технологический стек

- Mobile: React Native + Expo
- 360 Viewer: react-three-fiber + Three.js
- Navigation: React Navigation
- Backend: Node.js + Express + TypeScript
- Database: PostgreSQL
- Storage: Supabase Storage
- Auth: JWT

## Структура проекта

```text
Panorama/
  mobile/
    assets/
      panoramas/
    src/
      components/
      screens/
      navigation/
      services/
      types/
      constants/
      hooks/
    App.tsx
    package.json
    tsconfig.json
    babel.config.js
  backend/
    src/
      app.ts
      server.ts
      config/
      controllers/
      routes/
      middleware/
      services/
      repositories/
      utils/
      types/
    uploads/
    .env
    package.json
    tsconfig.json
```

## 1) Инициализация mobile (Expo)

```bash
cd c:\Users\Anton\Documents\trae_projects\Panorama
npx create-expo-app@latest mobile --template
cd mobile
```

## 2) Установка зависимостей mobile (одной командой)

```bash
npm install three @react-three/fiber @react-three/drei @react-navigation/native @react-navigation/native-stack react-native-screens react-native-safe-area-context react-native-gesture-handler react-native-reanimated expo-sensors expo-gl expo-asset expo-file-system
```

## 3) Запуск mobile

```bash
cd c:\Users\Anton\Documents\trae_projects\Panorama\mobile
npx expo start
```

## 4) Инициализация backend

```bash
cd c:\Users\Anton\Documents\trae_projects\Panorama
mkdir backend
cd backend
npm init -y
```

## 5) Установка зависимостей backend

```bash
npm install express cors helmet express-rate-limit cookie-parser dotenv jsonwebtoken bcryptjs pg zod @supabase/supabase-js http-errors multer
npm install -D typescript ts-node-dev eslint eslint-config-prettier @typescript-eslint/parser @typescript-eslint/eslint-plugin @types/node @types/express @types/cors @types/cookie-parser @types/jsonwebtoken @types/bcryptjs @types/pg @types/http-errors @types/multer
```

## 6) Настройка PostgreSQL

1. Создай базу данных `campus_panorama`.
2. Выполни SQL из `backend/src/config/schema.sql`.
3. Заполни `backend/.env` корректными значениями.

## 7) Запуск backend (development)

```bash
cd c:\Users\Anton\Documents\trae_projects\Panorama\backend
npm run dev
```

Сервер поднимется на `http://localhost:5000`.

## 8) Полезные API endpoints

- `GET /api/health` - проверка здоровья сервера
- `POST /api/auth/register` - регистрация
- `POST /api/auth/login` - вход
- `GET /api/auth/me` - профиль текущего пользователя
- `GET /api/locations` - список локаций
- `GET /api/locations/:locationId` - локация по ID
- `POST /api/locations` - создать локацию (только admin, multipart/form-data, поле файла: `panorama`)

## 9) Важно для Expo + Reanimated

В `mobile/babel.config.js` должен быть подключен плагин:

```js
plugins: ["react-native-reanimated/plugin"];
```

## 10) Что нужно заменить перед продом

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `CORS_ORIGIN`
- публичные тестовые URL панорам в `LocationsScreen.tsx`
