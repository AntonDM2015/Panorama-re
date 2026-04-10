-- =============================================
-- ADD PANORAMA LINKS TABLE
-- For specific Panorama-to-Panorama mapping
-- =============================================

-- 1. Create the new table
CREATE TABLE IF NOT EXISTS panorama_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_panorama_id UUID REFERENCES panoramas(id) ON DELETE CASCADE,
  to_panorama_id UUID REFERENCES panoramas(id) ON DELETE CASCADE,
  direction TEXT, -- e.g., '90', '180', 'north'
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(from_panorama_id, to_panorama_id)
);

-- 2. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_panorama_links_from ON panorama_links (from_panorama_id);
CREATE INDEX IF NOT EXISTS idx_panorama_links_to ON panorama_links (to_panorama_id);

-- Add comments
COMMENT ON TABLE panorama_links IS 'Navigation connections between specific panoramas for Street View mode';
COMMENT ON COLUMN panorama_links.direction IS 'Direction hint for navigation (degrees or compass direction)';

-- (Optional) If you want to drop the old locations-based links, uncomment the next line:
-- DROP TABLE IF EXISTS navigation_links;
