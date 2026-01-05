-- =============================================
-- RIMINI CHARTER - Insert Sample Boats
-- Run this in Supabase SQL Editor to add boats
-- =============================================

INSERT INTO boats (name, slug, type, description, price_full_day, price_half_day, capacity, length, image_url, gallery_urls, features, is_featured, year, refurbished_year, location, engine_power, fuel_consumption, highlights, included_services, excluded_services, extra_services, cancellation_policy)
VALUES 
(
    'The Royal',
    'the-royal',
    'motor_yacht_20m',
    'Il nostro yacht di punta di 20 metri offre il massimo del lusso con 4 cabine eleganti, equipaggio dedicato e ogni comfort immaginabile. Perfetto per eventi esclusivi, crociere romantiche e celebrazioni indimenticabili.

Dotato di ampio ponte prendisole, zona pranzo all''aperto, e interni raffinati con finiture in legno pregiato.',
    3500,
    2000,
    12,
    '20m',
    'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=1200&q=80',
    ARRAY['https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=1200&q=80', 'https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?w=1200&q=80', 'https://images.unsplash.com/photo-1530053969600-caed2596d242?w=1200&q=80'],
    '{"crew": true, "cabins": 4, "bathrooms": 4, "air_conditioning": true, "wifi": true, "gps": true, "autopilot": true, "radar": true, "vhf_radio": true, "life_jackets": true, "tv": true, "stereo": true, "swimming_platform": true, "tender": true, "snorkeling_equipment": true}',
    true,
    2018,
    2023,
    'Marina di Rimini',
    '2x 800 HP',
    '150 L/h',
    ARRAY['Skipper incluso', 'Hostess a bordo'],
    ARRAY['Skipper professionista', 'Hostess', 'Carburante 4h navigazione', 'Asciugamani e lenzuola', 'Snack e bevande di benvenuto'],
    ARRAY['Carburante extra', 'Pranzo/Cena a bordo', 'Pernottamento'],
    '[{"name": "Chef a bordo", "price": 300, "unit": "day"}, {"name": "Pranzo gourmet", "price": 80, "unit": "person"}, {"name": "Aperitivo al tramonto", "price": 40, "unit": "person"}, {"name": "Attrezzatura diving", "price": 150, "unit": "day"}]',
    'Cancellazione gratuita fino a 7 giorni prima. 50% di rimborso tra 7 e 3 giorni. Nessun rimborso dopo.'
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
    ARRAY['https://images.unsplash.com/photo-1540946485063-a40da27545f8?w=1200&q=80'],
    '{"cabins": 2, "bathrooms": 1, "gps": true, "vhf_radio": true, "life_jackets": true, "stereo": true}',
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
    ARRAY['https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200&q=80'],
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
    ARRAY['https://images.unsplash.com/photo-1626618012641-bfbca5a31239?w=1200&q=80'],
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

-- Verify insertion
SELECT name, slug, type, location FROM boats;
