-- =============================================
-- RIMINI CHARTER - Database Migration
-- Esegui questo per AGGIORNARE tabelle esistenti
-- =============================================

-- Drop existing policies first
DROP POLICY IF EXISTS "Boats are viewable by everyone" ON boats;
DROP POLICY IF EXISTS "Boats are editable by authenticated users" ON boats;
DROP POLICY IF EXISTS "Bookings viewable by authenticated" ON bookings;
DROP POLICY IF EXISTS "Bookings editable by authenticated" ON bookings;
DROP POLICY IF EXISTS "Anyone can create booking requests" ON bookings;

-- =============================================
-- ADD NEW COLUMNS TO BOATS (if missing)
-- =============================================

-- Extended Specs
ALTER TABLE boats ADD COLUMN IF NOT EXISTS year INTEGER;
ALTER TABLE boats ADD COLUMN IF NOT EXISTS refurbished_year INTEGER;
ALTER TABLE boats ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE boats ADD COLUMN IF NOT EXISTS location_coords JSONB;
ALTER TABLE boats ADD COLUMN IF NOT EXISTS engine_power TEXT;
ALTER TABLE boats ADD COLUMN IF NOT EXISTS fuel_consumption TEXT;

-- Services
ALTER TABLE boats ADD COLUMN IF NOT EXISTS highlights TEXT[] DEFAULT '{}';
ALTER TABLE boats ADD COLUMN IF NOT EXISTS included_services TEXT[] DEFAULT '{}';
ALTER TABLE boats ADD COLUMN IF NOT EXISTS excluded_services TEXT[] DEFAULT '{}';
ALTER TABLE boats ADD COLUMN IF NOT EXISTS extra_services JSONB DEFAULT '[]';
ALTER TABLE boats ADD COLUMN IF NOT EXISTS cancellation_policy TEXT;

-- =============================================
-- RE-CREATE RLS POLICIES
-- =============================================

-- Enable RLS
ALTER TABLE boats ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Boats: Public can read, only authenticated can write
CREATE POLICY "Boats are viewable by everyone" ON boats
    FOR SELECT USING (true);

CREATE POLICY "Boats are editable by authenticated users" ON boats
    FOR ALL USING (auth.role() = 'authenticated');

-- Bookings policies
CREATE POLICY "Bookings viewable by authenticated" ON bookings
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Bookings editable by authenticated" ON bookings
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Anyone can create booking requests" ON bookings
    FOR INSERT WITH CHECK (true);

-- =============================================
-- UPDATE EXISTING BOATS WITH SAMPLE DATA
-- =============================================

-- Update The Royal if exists
UPDATE boats SET
    year = 2018,
    refurbished_year = 2023,
    location = 'Marina di Rimini',
    engine_power = '2x 800 HP',
    fuel_consumption = '150 L/h',
    highlights = ARRAY['Skipper incluso', 'Hostess a bordo'],
    included_services = ARRAY['Skipper professionista', 'Hostess', 'Carburante 4h navigazione', 'Snack e bevande di benvenuto'],
    excluded_services = ARRAY['Carburante extra', 'Pranzo/Cena a bordo'],
    extra_services = '[{"name": "Chef a bordo", "price": 300, "unit": "day"}, {"name": "Pranzo gourmet", "price": 80, "unit": "person"}]',
    cancellation_policy = 'Cancellazione gratuita fino a 7 giorni prima. 50% di rimborso tra 7 e 3 giorni.',
    features = '{"crew": true, "cabins": 4, "bathrooms": 4, "air_conditioning": true, "wifi": true, "gps": true, "autopilot": true, "tv": true, "stereo": true, "swimming_platform": true, "tender": true}'
WHERE slug = 'the-royal';

-- Update The Wind if exists
UPDATE boats SET
    year = 2015,
    location = 'Porto Turistico Rimini',
    highlights = ARRAY['Esperienza autentica', 'Eco-friendly'],
    included_services = ARRAY['Skipper', 'Attrezzatura sicurezza'],
    excluded_services = ARRAY['Carburante motore ausiliario'],
    features = '{"cabins": 2, "bathrooms": 1, "gps": true, "vhf_radio": true, "stereo": true}'
WHERE slug = 'the-wind';

-- Update Smart Dinghy if exists
UPDATE boats SET
    year = 2022,
    location = 'Rimini Beach',
    engine_power = '40 HP',
    highlights = ARRAY['Senza patente', 'Facile da guidare'],
    included_services = ARRAY['Carburante', 'Briefing sicurezza'],
    features = '{"license_required": false, "life_jackets": true}'
WHERE slug = 'smart-dinghy';

-- Update Adrenaline if exists
UPDATE boats SET
    year = 2023,
    location = 'Rimini Beach',
    engine_power = '180 HP',
    highlights = ARRAY['Senza patente', 'Max emozione'],
    included_services = ARRAY['Carburante', 'Giubbotto salvagente', 'Briefing'],
    features = '{"license_required": false, "life_jackets": true}'
WHERE slug = 'adrenaline';

-- Done!
SELECT 'Migration completed!' as status, count(*) as boats_count FROM boats;
