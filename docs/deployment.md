# Руководство по развертыванию

Это руководство объясняет, как развернуть проект **Panorama 360** в продакшн-среде.

## 1. Настройка Supabase

Проект использует Supabase в качестве базы данных и хранилища файлов.

### 1.1 Настройка базы данных
Запустите SQL-скрипт из `backend/src/config/schema.sql` в редакторе SQL в панели управления Supabase.
**Примечание**: Обязательно выполните миграцию для таблицы `panorama_links`:

```sql
CREATE TABLE IF NOT EXISTS panorama_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_panorama_id UUID REFERENCES panoramas(id) ON DELETE CASCADE,
  to_panorama_id UUID REFERENCES panoramas(id) ON DELETE CASCADE,
  direction TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(from_panorama_id, to_panorama_id)
);
```

### 1.2 Настройка хранилища
1. В панели управления Supabase перейдите в раздел **Storage**.
2. Создайте новый бакет (bucket) с именем `panoramas`.
3. Установите для бакета статус **Public**.

## 2. Развертывание бэкенда

### 2.1 Переменные окружения
Создайте файл `.env` в директории `backend` со следующими переменными:

| Переменная | Описание |
| :--- | :--- |
| `NODE_ENV` | `production` |
| `PORT` | Порт, на котором будет слушать сервер (по умолчанию: `5000`) |
| `JWT_ACCESS_SECRET` | Секретный ключ для подписи токенов доступа |
| `JWT_REFRESH_SECRET` | Секретный ключ для подписи токенов обновления |
| `SUPABASE_URL` | URL вашего проекта Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Ваш ключ **service_role** от Supabase (требуется для админ-операций) |
| `SUPABASE_BUCKET` | `panoramas` |
| `CORS_ORIGIN` | URL вашего развернутого фронтенда (или `*` для тестирования) |

### 2.2 Запуск с помощью PM2
Чтобы сервер работал в фоновом режиме:

```bash
cd backend
npm install
npm run build
pm2 start dist/server.js --name panorama-backend
```

## 3. Развертывание веб-фронтенда

### 3.1 Переменные окружения
Создайте файл `.env` в директории `web`:

```env
VITE_API_BASE_URL=https://your-backend-api.com
```

### 3.2 Сборка для продакшна
Vite генерирует статический пакет, который можно разместить у любого хостинг-провайдера для статических сайтов.

```bash
cd web
npm install
npm run build
```

Результат сборки будет находиться в папке `web/dist`.

### 3.3 Варианты хостинга
- **Статический хостинг**: Загрузите содержимое `web/dist` на Vercel, Netlify или AWS S3.
- **Nginx**: Используйте традиционный веб-сервер для раздачи статических файлов и проксирования запросов к API.

## 4. Устранение неполадок
- **Ошибки CORS**: Убедитесь, что параметр `CORS_ORIGIN` на бэкенде точно соответствует URL вашего фронтенда.
- **Доступ к хранилищу**: Проверьте, что бакет `panoramas` является публичным и у `SUPABASE_SERVICE_ROLE_KEY` есть права на запись в него.
