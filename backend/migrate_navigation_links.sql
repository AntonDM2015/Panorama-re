-- =============================================
-- ADD NAVIGATION LINKS TABLE
-- For Google Street View-style navigation
-- =============================================

-- Navigation links table (stores connections between locations)
CREATE TABLE IF NOT EXISTS navigation_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_location_id UUID REFERENCES locations(id) ON DELETE CASCADE,
  to_location_id UUID REFERENCES locations(id) ON DELETE CASCADE,
  direction TEXT, -- e.g., 'north', 'south', 'left', 'right', 'forward', 'back'
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(from_location_id, to_location_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_navigation_links_from ON navigation_links (from_location_id);
CREATE INDEX IF NOT EXISTS idx_navigation_links_to ON navigation_links (to_location_id);

-- Add comments
COMMENT ON TABLE navigation_links IS 'Navigation connections between locations for Street View mode';
COMMENT ON COLUMN navigation_links.direction IS 'Direction hint for navigation (north, south, left, right, etc.)';

-- Sample navigation links (optional - remove if you want to start empty)
-- INSERT INTO navigation_links (from_location_id, to_location_id, direction) VALUES
-- ('33333333-3333-3333-3333-333333333331', '33333333-3333-3333-3333-333333333332', 'forward'),
-- ('33333333-3333-3333-3333-333333333332', '33333333-3333-3333-3333-333333333331', 'back');
