-- Seeder: 01_quito_pricing_zones_seeder.sql
-- Description: Seeds the 7 geographic pricing zones in Quito with flat-rate shipping fees.

INSERT INTO pricing_zones (code, name, description, flat_rate, is_active)
VALUES
    ('quito_norte', 'Quito Norte', 'Sector Norte: Carcelén, Cotocollao, El Inca, La Carolina, Iñaquito', 3.00, true),
    ('quito_centro', 'Quito Centro', 'Sector Centro: Centro Histórico, San Juan, Itchimbía, La Loma', 2.50, true),
    ('quito_sur', 'Quito Sur', 'Sector Sur: Villa Flora, El Recreo, Quitumbe, Solanda, Chillogallo', 3.50, true),
    ('valle_chillos_conocoto', 'Valle de los Chillos / Conocoto', 'Valle de los Chillos: Conocoto, San Rafael, Sangolquí, Amaguaña', 4.50, true),
    ('valle_tumbaco', 'Valle de Tumbaco', 'Valle de Tumbaco: Cumbayá, Tumbaco, Puembo, Tababela', 4.50, true),
    ('calderon', 'Calderón', 'Sector Calderón: Carapungo, Llano Chico, Calderón', 4.00, true),
    ('mitad_del_mundo', 'Mitad del Mundo', 'Sector Mitad del Mundo: Pomasqui, San Antonio de Pichincha, Calacalí', 5.00, true)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    flat_rate = EXCLUDED.flat_rate,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();
