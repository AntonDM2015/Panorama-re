# Инструкция по применению миграции базы данных

## Миграция: Добавление детальной информации о корпусах

**Дата:** 10 апреля 2026  
**Файл миграции:** `backend/migrations/add_building_details.sql`

### Что добавляется

Новые поля в таблицу `buildings`:
- `working_hours` (TEXT) - Режим работы корпуса
- `phone` (TEXT) - Контактный телефон
- `facilities` (TEXT[]) - Массив удобств (Аудитории, Библиотека, Столовая и т.д.)
- `map_url` (TEXT) - Ссылка на карту (Google Maps, Yandex Maps)

### Как применить миграцию

#### Вариант 1: Через Supabase Dashboard (рекомендуется)

1. Откройте ваш проект в Supabase Dashboard
2. Перейдите в раздел **SQL Editor**
3. Нажмите **New query**
4. Выполните миграции **в строгом порядке**:

**Миграция 1:** Детали зданий
```sql
-- Скопируйте содержимое backend/migrations/add_building_details.sql
```

**Миграция 2:** Связи между панорамами (ВАЖНО для навигации!)
```sql
-- Скопируйте содержимое backend/migrate_panorama_links.sql
```

5. Нажмите **Run** для каждой миграции
6. Убедитесь, что миграция выполнена успешно (сообщение "Success" или аналогичное)

#### Вариант 2: Через psql (локальная разработка)

```bash
# Подключитесь к вашей базе данных
psql -h localhost -U postgres -d campus_panorama

# Выполните миграции в порядке:
\i backend/migrations/add_building_details.sql
\i backend/migrate_panorama_links.sql

# Проверьте, что таблицы созданы
\dt
\d panorama_links

# Выйдите из psql
\q
```

#### Вариант 3: Через Supabase CLI (если используется)

```bash
# Применить миграцию
supabase db push

# Или вручную
supabase migration up
```

### Проверка миграции

После применения миграции проверьте, что поля добавлены:

```sql
-- Проверка структуры таблицы
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'buildings'
ORDER BY ordinal_position;

-- Тестовая вставка данных
UPDATE buildings 
SET 
  working_hours = 'Пн-Пт: 8:00 - 20:00',
  phone = '+7 (4832) 74-37-36',
  facilities = ARRAY['Аудитории', 'Библиотека', 'Столовая', 'Спортзал'],
  map_url = 'https://yandex.ru/maps/?text=Стремянный+пер.,+36'
WHERE name = 'Главный корпус';

-- Проверка данных
SELECT name, working_hours, phone, facilities, map_url
FROM buildings;
```

### Откат миграции (при необходимости)

Если нужно удалить добавленные поля:

```sql
ALTER TABLE buildings 
DROP COLUMN IF EXISTS working_hours,
DROP COLUMN IF EXISTS phone,
DROP COLUMN IF EXISTS facilities,
DROP COLUMN IF EXISTS map_url;
```

### Что изменилось в коде

#### Backend
- ✅ Обновлен интерфейс `Building` в `backend/src/types/index.ts`
- ✅ Обновлен `building.repository.ts` для работы с новыми полями
- ✅ Методы `create` и `update` поддерживают новые поля

#### Frontend
- ✅ Обновлен интерфейс `Building` в `web/src/types/index.ts`
- ✅ Обновлены типы в `api.ts` для функций `createBuilding` и `updateBuilding`
- ✅ Расширена форма создания/редактирования корпуса в `AdminPage.tsx`
- ✅ Добавлены CSS стили в `AdminPage.css`

#### Новая функциональность в админ-панели

При создании/редактировании корпуса теперь доступны поля:
1. **Адрес** - текстовое поле
2. **Описание корпуса** - многострочное текстовое поле
3. **URL превью изображения** - ссылка на изображение
4. **Режим работы** - текст (например: "Пн-Пт: 8:00 - 20:00")
5. **Телефон** - текстовое поле
6. **Удобства** - интерактивный список с возможностью добавления/удаления тегов
7. **Ссылка на карту** - URL на Google Maps или Yandex Maps

### Важные заметки

- Все новые поля являются опциональными (nullable)
- Миграция безопасна и не влияет на существующие данные
- Поле `facilities` использует PostgreSQL array type (TEXT[])
- При миграции все существующие записи получат NULL значения для новых полей
