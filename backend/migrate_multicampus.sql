-- =============================================
-- MULTICAMPUS ARCHITECTURE - DATABASE SCHEMA
-- Execute this in Supabase SQL Editor
-- =============================================

-- Enable pgcrypto extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================
-- DROP EXISTING TABLES (if they exist)
-- WARNING: This will delete all existing data!
-- =============================================
DROP TABLE IF EXISTS panoramas CASCADE;
DROP TABLE IF EXISTS locations CASCADE;
DROP TABLE IF EXISTS buildings CASCADE;
DROP TABLE IF EXISTS cities CASCADE;

-- =============================================
-- CITIES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS cities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  country TEXT DEFAULT 'Россия',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- BUILDINGS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS buildings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id UUID REFERENCES cities(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT,
  description TEXT,
  preview_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- LOCATIONS TABLE (inside buildings)
-- =============================================
CREATE TABLE IF NOT EXISTS locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id UUID REFERENCES buildings(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  floor INTEGER,
  type TEXT DEFAULT 'location' CHECK (type IN ('location', 'room')),
  room_number TEXT,
  preview_url TEXT,
  panorama_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- PANORAMAS TABLE (multiple per location)
-- =============================================
CREATE TABLE IF NOT EXISTS panoramas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id UUID REFERENCES locations(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  title TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- INDEXES
-- =============================================
CREATE INDEX IF NOT EXISTS idx_buildings_city_id ON buildings (city_id);
CREATE INDEX IF NOT EXISTS idx_locations_building_id ON locations (building_id);
CREATE INDEX IF NOT EXISTS idx_locations_type ON locations (type);
CREATE INDEX IF NOT EXISTS idx_locations_floor ON locations (floor);
CREATE INDEX IF NOT EXISTS idx_panoramas_location_id ON panoramas (location_id);
CREATE INDEX IF NOT EXISTS idx_panoramas_sort_order ON panoramas (sort_order);

-- =============================================
-- TEST DATA
-- =============================================

-- Insert Moscow city
INSERT INTO cities (id, name) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Москва')
ON CONFLICT (id) DO NOTHING;

-- Insert Main Building
INSERT INTO buildings (id, city_id, name, address, description) VALUES
  ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'Главный корпус', 'Стремянный пер., 36', 'Основной учебный корпус РЭУ им. Г.В. Плеханова')
ON CONFLICT (id) DO NOTHING;

-- Insert locations
INSERT INTO locations (id, building_id, name, description, type, floor, panorama_url) VALUES
  ('33333333-3333-3333-3333-333333333331', '22222222-2222-2222-2222-222222222222', 'Буфет', 'Буфет на первом этаже', 'location', 1, 'https://oyzcqekxrqywdlykpdic.supabase.co/storage/v1/object/public/Panoramas/street_1.jpg'),
  ('33333333-3333-3333-3333-333333333332', '22222222-2222-2222-2222-222222222222', 'Библиотека', 'Научная библиотека', 'location', 1, 'https://oyzcqekxrqywdlykpdic.supabase.co/storage/v1/object/public/Panoramas/street_2.jpg'),
  ('33333333-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222222', 'Аудитория 104', 'Учебная аудитория', 'room', 1, 'https://oyzcqekxrqywdlykpdic.supabase.co/storage/v1/object/public/Panoramas/street_3.jpg')
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- VERIFICATION QUERIES (optional - run after creation)
-- =============================================

-- SELECT * FROM cities;
-- SELECT * FROM buildings;
-- SELECT * FROM locations;
-- SELECT * FROM panoramas;
