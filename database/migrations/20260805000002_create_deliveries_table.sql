-- Migration: Create deliveries table
-- Description: Records delivery orders with status lifecycle tracking, foreign key reference to pricing zone, and structured address metadata.

CREATE TABLE IF NOT EXISTS deliveries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL,
    pricing_zone_id UUID NOT NULL REFERENCES pricing_zones(id) ON DELETE RESTRICT,
    delivery_status VARCHAR(32) NOT NULL DEFAULT 'pending'
        CHECK (delivery_status IN ('pending', 'assigned', 'in_transit', 'delivered', 'failed', 'cancelled')),
    payment_status VARCHAR(32) NOT NULL DEFAULT 'pending'
        CHECK (payment_status IN ('pending', 'paid', 'refunded', 'failed')),
    delivery_address JSONB NOT NULL,
    shipping_fee DECIMAL(10, 2) NOT NULL DEFAULT 0.00 CHECK (shipping_fee >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Enforce latitude and longitude bounds within delivery_address JSONB structure
    CONSTRAINT chk_delivery_address_lat CHECK (
        (delivery_address->>'lat') IS NULL OR (
            (delivery_address->>'lat')::numeric >= -90.0 AND
            (delivery_address->>'lat')::numeric <= 90.0
        )
    ),
    CONSTRAINT chk_delivery_address_lng CHECK (
        (delivery_address->>'lng') IS NULL OR (
            (delivery_address->>'lng')::numeric >= -180.0 AND
            (delivery_address->>'lng')::numeric <= 180.0
        )
    )
);

-- Indexes for status, order lookup, and spatial queries
CREATE INDEX IF NOT EXISTS idx_deliveries_order_id ON deliveries(order_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_pricing_zone_id ON deliveries(pricing_zone_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_delivery_status ON deliveries(delivery_status);
CREATE INDEX IF NOT EXISTS idx_deliveries_payment_status ON deliveries(payment_status);

-- GIN index on delivery_address JSONB for address query performance
CREATE INDEX IF NOT EXISTS idx_deliveries_address_jsonb ON deliveries USING GIN (delivery_address);

-- Trigger for auto-updating updated_at timestamp
CREATE OR REPLACE FUNCTION update_deliveries_modtime()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_deliveries_updated_at ON deliveries;
CREATE TRIGGER trg_deliveries_updated_at
    BEFORE UPDATE ON deliveries
    FOR EACH ROW
    EXECUTE FUNCTION update_deliveries_modtime();
