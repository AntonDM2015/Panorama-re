# Исправления от 10 апреля 2026

## 🔧 Исправленные проблемы

### 1. Отзеркаливание панорам в режиме тура

**Проблема:** Панорамы в режиме Street View отображались зеркально по горизонтали.

**Причина:** В файле `web/src/components/PanoramaViewer.tsx` (метод `buildSphere`) была двойная инверсия текстурных координат:
- Текстура инвертировалась через `1 - lon / wSeg` 
- Порядок вершин треугольников также создавал зеркальный эффект при просмотре изнутри сферы

**Решение:** Убрана инверсия S-координаты текстуры
```typescript
// Было (неправильно):
texCoords.push(1 - lon / wSeg, lat / hSeg);

// Стало (правильно):
texCoords.push(lon / wSeg, lat / hSeg);
```

**Файл:** `web/src/components/PanoramaViewer.tsx`, строка 324

---

### 2. Ошибка "Internal server error" при добавлении навигационных ссылок

**Проблема:** При попытке создать ссылку между панорамами в админ-панели возникала ошибка "Internal server error".

**Причина:** 
1. Таблица `panorama_links` не была создана в базе данных (не применена миграция)
2. Ошибки Supabase не логировались, поэтому реальная причина была скрыта

**Решение:**

**А. Добавлено подробное логирование:**
- В `PanoramaLinkRepository.create()` — логирование запросов и ошибок Supabase
- В `LocationController.createPanoramaLink()` — логирование попыток создания
- В `errorHandler()` — логирование всех ошибок в консоль сервера
- В development режиме ошибка возвращается в ответе API

**Б. Обновлена документация:**
- `MIGRATION_INSTRUCTIONS.md` — добавлена инструкция по применению миграции `migrate_panorama_links.sql`
- `README.md` — обновлен порядок применения миграций

**Файлы:**
- `backend/src/repositories/panorama_link.repository.ts`
- `backend/src/controllers/location.controller.ts`
- `backend/src/middleware/error.middleware.ts`
- `MIGRATION_INSTRUCTIONS.md`
- `README.md`

---

## 📋 Как применить исправления

### 1. Примените миграцию для таблицы panorama_links

**Через Supabase Dashboard:**
1. Откройте SQL Editor
2. Скопируйте содержимое `backend/migrate_panorama_links.sql`
3. Нажмите Run

**Через psql:**
```bash
psql -h db.your-project.supabase.co -U postgres -d postgres
\i backend/migrate_panorama_links.sql
```

### 2. Перезапустите серверы

```bash
# Backend
cd backend
npm run dev

# Web
cd web
npm run dev
```

### 3. Проверьте работу

1. Откройте админ-панель
2. Перейдите к управлению панорамами
3. Попробуйте создать навигационную ссылку
4. В консоли сервера должны появиться логи:
   ```
   [createPanoramaLink] Attempting to create link: {...}
   [PanoramaLinkRepository.create] Inserting: {...}
   [PanoramaLinkRepository.create] Success: {...}
   ```

---

## 🐛 Диагностика проблем

Если ошибка сохраняется, проверьте логи сервера:

1. **Ошибка "relation panorama_links does not exist"**
   - Таблица не создана → примените миграцию `migrate_panorama_links.sql`

2. **Ошибка "violates foreign key constraint"**
   - Указан несуществующий panorama ID → проверьте что обе панорамы существуют

3. **Ошибка "duplicate key value violates unique constraint"**
   - Связь уже существует → удалите старую или используйте другую панораму

4. **Ошибка "RLS policy violation"**
   - Row Level Security блокирует → проверьте политики в Supabase Dashboard

---

## ✅ Результаты тестирования

- ✅ Сборка фронтенда проходит без ошибок
- ✅ Сборка бэкенда проходит без ошибок
- ✅ Текстурные координаты корректны (панорамы не зеркалятся)
- ✅ Логирование ошибок работает
- ✅ Документация обновлена

---

## 📝 Примечания

- Исправление зеркальности панорам требует **полной пересборки** фронтенда
- Логирование ошибок работает только в **development режиме**
- В production режиме возвращается только generic сообщение об ошибке (безопасность)
