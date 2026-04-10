-- Migration: Add building details fields
-- Date: 2026-04-10
-- Description: Добавление полей для режима работы, телефона, удобств и ссылки на карту

-- Добавляем новые поля в таблицу buildings
ALTER TABLE buildings 
ADD COLUMN IF NOT EXISTS working_hours TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS facilities TEXT[], -- Массив удобств (PostgreSQL array)
ADD COLUMN IF NOT EXISTS map_url TEXT;

-- Добавляем комментарии к полям
COMMENT ON COLUMN buildings.working_hours IS 'Режим работы корпуса (например: Пн-Пт: 8:00 - 20:00)';
COMMENT ON COLUMN buildings.phone IS 'Контактный телефон';
COMMENT ON COLUMN buildings.facilities IS 'Массив удобств (Аудитории, Библиотека, Столовая и т.д.)';
COMMENT ON COLUMN buildings.map_url IS 'Ссылка на карту (Google Maps, Yandex Maps и т.д.)';
