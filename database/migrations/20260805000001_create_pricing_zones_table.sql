-- Migration: Create pricing_zones table
-- Description: Stores flat-rate shipping pricing configuration grouped by geographic sectors in Quito.

CREATE TABLE IF NOT EXISTS pricing_zones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(64) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT NULL,
    flat_rate DECIMAL(10, 2) NOT NULL DEFAULT 0.00 CHECK (flat_rate >= 0),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for quick lookup by sector code and active status
CREATE INDEX IF NOT EXISTS idx_pricing_zones_code ON pricing_zones(code);
CREATE INDEX IF NOT EXISTS idx_pricing_zones_active ON pricing_zones(is_active);

-- Trigger for auto-updating updated_at timestamp
CREATE OR REPLACE FUNCTION update_pricing_zones_modtime()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_pricing_zones_updated_at ON pricing_zones;
CREATE TRIGGER trg_pricing_zones_updated_at
    BEFORE UPDATE ON pricing_zones
    FOR EACH ROW
    EXECUTE FUNCTION update_pricing_zones_modtime();
