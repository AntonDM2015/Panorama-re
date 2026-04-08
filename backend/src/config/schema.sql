CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin'))
);

-- Cities table
CREATE TABLE IF NOT EXISTS cities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  country TEXT DEFAULT 'Россия',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Buildings table
CREATE TABLE IF NOT EXISTS buildings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id UUID REFERENCES cities(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT,
  description TEXT,
  preview_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Locations table (inside buildings)
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

-- Panoramas table (multiple per location)
CREATE TABLE IF NOT EXISTS panoramas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id UUID REFERENCES locations(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  title TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Navigation links table (connections between locations)
CREATE TABLE IF NOT EXISTS navigation_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_location_id UUID REFERENCES locations(id) ON DELETE CASCADE,
  to_location_id UUID REFERENCES locations(id) ON DELETE CASCADE,
  direction TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(from_location_id, to_location_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
CREATE INDEX IF NOT EXISTS idx_buildings_city_id ON buildings (city_id);
CREATE INDEX IF NOT EXISTS idx_locations_building_id ON locations (building_id);
CREATE INDEX IF NOT EXISTS idx_locations_type ON locations (type);
CREATE INDEX IF NOT EXISTS idx_locations_floor ON locations (floor);
CREATE INDEX IF NOT EXISTS idx_panoramas_location_id ON panoramas (location_id);
CREATE INDEX IF NOT EXISTS idx_panoramas_sort_order ON panoramas (sort_order);
CREATE INDEX IF NOT EXISTS idx_navigation_links_from ON navigation_links (from_location_id);
CREATE INDEX IF NOT EXISTS idx_navigation_links_to ON navigation_links (to_location_id);

-- Test data
INSERT INTO cities (id, name) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Москва')
ON CONFLICT (id) DO NOTHING;

INSERT INTO buildings (id, city_id, name, address, description) VALUES
  ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'Главный корпус', 'Стремянный пер., 36', 'Основной учебный корпус РЭУ им. Г.В. Плеханова')
ON CONFLICT (id) DO NOTHING;

INSERT INTO locations (id, building_id, name, description, type, floor, panorama_url) VALUES
  ('33333333-3333-3333-3333-333333333331', '22222222-2222-2222-2222-222222222222', 'Буфет', 'Буфет на первом этаже', 'location', 1, 'https://oyzcqekxrqywdlykpdic.supabase.co/storage/v1/object/public/Panoramas/street_1.jpg'),
  ('33333333-3333-3333-3333-333333333332', '22222222-2222-2222-2222-222222222222', 'Библиотека', 'Научная библиотека', 'location', 1, 'https://oyzcqekxrqywdlykpdic.supabase.co/storage/v1/object/public/Panoramas/street_2.jpg'),
  ('33333333-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222222', 'Аудитория 104', 'Учебная аудитория', 'room', 1, 'https://oyzcqekxrqywdlykpdic.supabase.co/storage/v1/object/public/Panoramas/street_3.jpg')
ON CONFLICT (id) DO NOTHING;
