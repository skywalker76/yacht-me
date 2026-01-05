-- =============================================
-- YACHT~ME - Update Site Settings
-- Run this in Supabase SQL Editor
-- =============================================

-- Aggiorna nome sito
UPDATE site_settings SET value = 'YACHT~ME' WHERE key = 'site_name';
UPDATE site_settings SET value = 'Riviera Sea Life' WHERE key = 'site_tagline';

-- Aggiorna contatti Enrico
UPDATE site_settings SET value = 'enrico@yachtme.it' WHERE key = 'contact_email';
UPDATE site_settings SET value = '+39 320 094 1490' WHERE key = 'contact_phone';
UPDATE site_settings SET value = '' WHERE key = 'contact_phone_2';

-- Verifica
SELECT key, value FROM site_settings WHERE key IN ('site_name', 'site_tagline', 'contact_email', 'contact_phone');
