-- =============================================
-- SERVICES TABLE
-- Tabella per gestire i servizi dinamicamente
-- =============================================

-- Crea la tabella services
CREATE TABLE IF NOT EXISTS public.services (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    features TEXT[] DEFAULT '{}',
    price_text VARCHAR(100),
    icon VARCHAR(50) DEFAULT 'Anchor',
    image_url TEXT,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indice per slug
CREATE INDEX IF NOT EXISTS idx_services_slug ON public.services(slug);
CREATE INDEX IF NOT EXISTS idx_services_order ON public.services(display_order);

-- Abilita RLS
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- Policy per lettura pubblica
CREATE POLICY "Services are viewable by everyone" ON public.services
    FOR SELECT USING (true);

-- Policy per gestione admin (inserimento)
CREATE POLICY "Services can be inserted by authenticated users" ON public.services
    FOR INSERT WITH CHECK (true);

-- Policy per gestione admin (aggiornamento)
CREATE POLICY "Services can be updated by authenticated users" ON public.services
    FOR UPDATE USING (true);

-- Policy per gestione admin (eliminazione)
CREATE POLICY "Services can be deleted by authenticated users" ON public.services
    FOR DELETE USING (true);

-- Trigger per updated_at
CREATE OR REPLACE FUNCTION update_services_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_services_updated_at ON public.services;
CREATE TRIGGER trigger_services_updated_at
    BEFORE UPDATE ON public.services
    FOR EACH ROW
    EXECUTE FUNCTION update_services_updated_at();

-- =============================================
-- INSERISCI SERVIZI DI DEFAULT
-- =============================================

INSERT INTO public.services (name, slug, description, features, price_text, icon, image_url, display_order, is_active) VALUES
(
    'Charter con Skipper',
    'charter-skipper',
    'Affidati ai nostri skipper professionisti per un''esperienza sicura e rilassante. Naviga senza pensieri mentre il nostro equipaggio si occupa di tutto.',
    ARRAY['Skipper certificati', 'Conoscenza approfondita della costa', 'Massima sicurezza', 'Itinerari personalizzati'],
    'Da €200/giorno',
    'User',
    'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80',
    1,
    true
),
(
    'Aperitivi in Barca',
    'aperitivi-barca',
    'Brinda al tramonto con un aperitivo esclusivo in barca. Un''esperienza romantica e raffinata sulle acque della Riviera.',
    ARRAY['Selezione vini locali', 'Finger food gourmet', 'Durata 2-3 ore', 'Atmosfera esclusiva'],
    'Da €50/persona',
    'Wine',
    'https://images.unsplash.com/photo-1530053969600-caed2596d242?w=800&q=80',
    2,
    true
),
(
    'Eventi Privati',
    'eventi-privati',
    'Festeggia compleanni, addii al celibato o eventi aziendali in una location unica. Il mare come sfondo per le tue celebrazioni.',
    ARRAY['Personalizzazione completa', 'Catering su richiesta', 'DJ disponibile', 'Decorazioni a tema'],
    'Su preventivo',
    'PartyPopper',
    'https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?w=800&q=80',
    3,
    true
),
(
    'Tour Costieri',
    'tour-costieri',
    'Esplora la Riviera Romagnola con i nostri tour guidati. Scopri calette nascoste, borghi pittoreschi e panorami mozzafiato.',
    ARRAY['Itinerari personalizzabili', 'Soste per nuotare', 'Guide esperte', 'Pranzo incluso su richiesta'],
    'Da €150/persona',
    'Compass',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80',
    4,
    true
)
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    features = EXCLUDED.features,
    price_text = EXCLUDED.price_text,
    icon = EXCLUDED.icon,
    image_url = EXCLUDED.image_url,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active;

-- Verifica
SELECT name, slug, price_text, display_order FROM public.services ORDER BY display_order;
