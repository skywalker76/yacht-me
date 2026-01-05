-- =============================================
-- RIMINI CHARTER - Site Settings Table
-- Run this in Supabase SQL Editor
-- =============================================

-- Create site_settings table
CREATE TABLE IF NOT EXISTS site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value TEXT,
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read settings
CREATE POLICY "Allow public read access on site_settings"
  ON site_settings FOR SELECT
  USING (true);

-- Only authenticated users can update
CREATE POLICY "Allow authenticated users to update site_settings"
  ON site_settings FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert site_settings"
  ON site_settings FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Insert default settings with placeholder values
INSERT INTO site_settings (key, value, description) VALUES
-- Immagini
('hero_image', 'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=1920&q=80', 'Immagine hero homepage'),
('fleet_hero_image', 'https://images.unsplash.com/photo-1540946485063-a40da27545f8?w=1920&q=80', 'Immagine hero pagina flotta'),
('contact_hero_image', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&q=80', 'Immagine hero pagina contatti'),
('services_hero_image', 'https://images.unsplash.com/photo-1530053969600-caed2596d242?w=1920&q=80', 'Immagine hero pagina servizi'),
('about_section_image', 'https://images.unsplash.com/photo-1540946485063-a40da27545f8?w=1920&q=80', 'Immagine sezione chi siamo'),
-- Informazioni Sito
('site_name', 'Rimini Charter', 'Nome del sito'),
('site_tagline', 'Il Lusso del Mare', 'Slogan del sito'),
-- Contatti
('contact_email', 'info@riminicharter.it', 'Email principale'),
('contact_phone', '+39 0541 123 456', 'Telefono principale'),
('contact_phone_2', '+39 333 123 4567', 'Telefono secondario'),
('contact_address', 'Via Ortigara 80, Marina di Rimini, 47921 Rimini (RN)', 'Indirizzo completo'),
('contact_hours', 'Lun - Dom: 8:00 - 20:00', 'Orari di apertura'),
-- Social Media
('social_facebook', '', 'URL pagina Facebook'),
('social_instagram', '', 'URL profilo Instagram'),
('social_whatsapp', '', 'Numero WhatsApp (con prefisso)')
ON CONFLICT (key) DO NOTHING;

-- Verify
SELECT * FROM site_settings;
