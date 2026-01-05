-- =============================================
-- RIMINI CHARTER - Database Schema
-- Run this in Supabase SQL Editor
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- BOATS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS boats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Base Info
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('motor_yacht_20m', 'sailboat_14m', 'dinghy', 'jetski')),
    description TEXT,
    
    -- Pricing
    price_full_day INTEGER,
    price_half_day INTEGER,
    
    -- Basic Specs
    capacity INTEGER,
    length TEXT,
    
    -- Images
    image_url TEXT,
    gallery_urls TEXT[] DEFAULT '{}',
    
    -- Features (JSONB for flexibility)
    features JSONB DEFAULT '{}',
    
    -- Display
    is_featured BOOLEAN DEFAULT FALSE,
    
    -- Extended Specs (NEW)
    year INTEGER,
    refurbished_year INTEGER,
    location TEXT,
    location_coords JSONB,
    engine_power TEXT,
    fuel_consumption TEXT,
    
    -- Services (NEW)
    highlights TEXT[] DEFAULT '{}',
    included_services TEXT[] DEFAULT '{}',
    excluded_services TEXT[] DEFAULT '{}',
    extra_services JSONB DEFAULT '[]',
    cancellation_policy TEXT
);

-- Create index for faster slug lookups
CREATE INDEX IF NOT EXISTS idx_boats_slug ON boats(slug);
CREATE INDEX IF NOT EXISTS idx_boats_featured ON boats(is_featured);

-- =============================================
-- BOOKINGS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    boat_id UUID REFERENCES boats(id) ON DELETE CASCADE,
    
    -- Customer Info
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT,
    
    -- Dates
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    
    -- Status
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
    
    -- Details
    notes TEXT,
    total_price INTEGER
);

CREATE INDEX IF NOT EXISTS idx_bookings_boat ON bookings(boat_id);
CREATE INDEX IF NOT EXISTS idx_bookings_dates ON bookings(start_date, end_date);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS
ALTER TABLE boats ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Boats: Public can read, only authenticated can write
CREATE POLICY "Boats are viewable by everyone" ON boats
    FOR SELECT USING (true);

CREATE POLICY "Boats are editable by authenticated users" ON boats
    FOR ALL USING (auth.role() = 'authenticated');

-- Bookings: Authenticated users can manage all
CREATE POLICY "Bookings viewable by authenticated" ON bookings
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Bookings editable by authenticated" ON bookings
    FOR ALL USING (auth.role() = 'authenticated');

-- Public can create bookings (for booking requests)
CREATE POLICY "Anyone can create booking requests" ON bookings
    FOR INSERT WITH CHECK (true);

-- =============================================
-- SAMPLE DATA
-- =============================================

INSERT INTO boats (name, slug, type, description, price_full_day, price_half_day, capacity, length, image_url, features, is_featured, year, refurbished_year, location, engine_power, fuel_consumption, highlights, included_services, excluded_services, extra_services, cancellation_policy)
VALUES 
(
    'The Royal',
    'the-royal',
    'motor_yacht_20m',
    'Il nostro yacht di punta di 20 metri offre il massimo del lusso con 4 cabine eleganti, equipaggio dedicato e ogni comfort immaginabile. Perfetto per eventi esclusivi, crociere romantiche e celebrazioni indimenticabili.',
    3500,
    2000,
    12,
    '20m',
    'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=1200&q=80',
    '{"crew": true, "cabins": 4, "bathrooms": 4, "air_conditioning": true, "wifi": true, "gps": true, "autopilot": true, "tv": true, "stereo": true, "swimming_platform": true, "tender": true}',
    true,
    2018,
    2023,
    'Marina di Rimini',
    '2x 800 HP',
    '150 L/h',
    ARRAY['Skipper incluso', 'Hostess a bordo'],
    ARRAY['Skipper professionista', 'Hostess', 'Carburante 4h navigazione', 'Snack e bevande di benvenuto'],
    ARRAY['Carburante extra', 'Pranzo/Cena a bordo'],
    '[{"name": "Chef a bordo", "price": 300, "unit": "day"}, {"name": "Pranzo gourmet", "price": 80, "unit": "person"}]',
    'Cancellazione gratuita fino a 7 giorni prima. 50% di rimborso tra 7 e 3 giorni.'
),
(
    'The Wind',
    'the-wind',
    'sailboat_14m',
    'Barca a vela di 14 metri perfetta per gli amanti dell''avventura. Vivi la magia della navigazione a vela lungo la costa adriatica.',
    1200,
    700,
    8,
    '14m',
    'https://images.unsplash.com/photo-1540946485063-a40da27545f8?w=1200&q=80',
    '{"cabins": 2, "bathrooms": 1, "gps": true, "vhf_radio": true, "stereo": true}',
    true,
    2015,
    NULL,
    'Porto Turistico Rimini',
    NULL,
    NULL,
    ARRAY['Esperienza autentica', 'Eco-friendly'],
    ARRAY['Skipper', 'Attrezzatura sicurezza'],
    ARRAY['Carburante motore ausiliario'],
    '[]',
    NULL
),
(
    'Smart Dinghy',
    'smart-dinghy',
    'dinghy',
    'Gommoni moderni e facili da guidare. Ideali per esplorare la costa in libertà, senza patente nautica.',
    250,
    150,
    6,
    '5.5m',
    'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200&q=80',
    '{"license_required": false, "life_jackets": true}',
    true,
    2022,
    NULL,
    'Rimini Beach',
    '40 HP',
    NULL,
    ARRAY['Senza patente', 'Facile da guidare'],
    ARRAY['Carburante', 'Briefing sicurezza'],
    NULL,
    '[]',
    NULL
),
(
    'Adrenaline',
    'adrenaline',
    'jetski',
    'Moto d''acqua di ultima generazione per chi cerca adrenalina. Velocità e divertimento garantiti.',
    300,
    180,
    2,
    '3.2m',
    'https://images.unsplash.com/photo-1626618012641-bfbca5a31239?w=1200&q=80',
    '{"license_required": false, "life_jackets": true}',
    true,
    2023,
    NULL,
    'Rimini Beach',
    '180 HP',
    NULL,
    ARRAY['Senza patente', 'Max emozione'],
    ARRAY['Carburante', 'Giubbotto salvagente', 'Briefing'],
    NULL,
    '[]',
    NULL
);
