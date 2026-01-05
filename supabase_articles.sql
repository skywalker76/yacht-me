-- =============================================
-- RIMINI CHARTER - Articles Table
-- Run this in Supabase SQL Editor
-- =============================================

-- Create articles table
CREATE TABLE IF NOT EXISTS articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  cover_image TEXT,
  category TEXT DEFAULT 'blog' CHECK (category IN ('blog', 'escursioni', 'news', 'info')),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  author TEXT,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read published articles
CREATE POLICY "Allow public read published articles"
  ON articles FOR SELECT
  USING (status = 'published');

-- Authenticated users can read all articles (including drafts)
CREATE POLICY "Allow authenticated read all articles"
  ON articles FOR SELECT
  USING (auth.role() = 'authenticated');

-- Only authenticated users can insert
CREATE POLICY "Allow authenticated users to insert articles"
  ON articles FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Only authenticated users can update
CREATE POLICY "Allow authenticated users to update articles"
  ON articles FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Only authenticated users can delete
CREATE POLICY "Allow authenticated users to delete articles"
  ON articles FOR DELETE
  USING (auth.role() = 'authenticated');

-- Create index for faster slug lookups
CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug);
CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category);
CREATE INDEX IF NOT EXISTS idx_articles_status ON articles(status);

-- Insert sample article
INSERT INTO articles (title, slug, excerpt, content, category, status, author, published_at) VALUES
(
  'Escursione alle Isole Tremiti',
  'escursione-isole-tremiti',
  'Scopri le magnifiche Isole Tremiti con il nostro tour esclusivo in yacht.',
  '## Le Isole Tremiti: Un Paradiso nell''Adriatico

Le Isole Tremiti rappresentano una delle mete più affascinanti dell''Adriatico. Con le nostre imbarcazioni di lusso, potrai esplorare:

### San Domino
L''isola più grande, con la famosa **Cala delle Arene**, l''unica spiaggia sabbiosa dell''arcipelago.

### San Nicola
Il centro storico con l''Abbazia di Santa Maria a Mare, un gioiello architettonico.

### Capraia
Isola disabitata, perfetta per lo snorkeling in acque cristalline.

## Cosa Include il Tour

- Trasporto in yacht di lusso
- Skipper esperto
- Pranzo a bordo
- Attrezzatura snorkeling
- Bevande e aperitivo al tramonto

**Durata**: Giornata intera (partenza ore 8:00, rientro ore 19:00)

**Prezzo**: Da €150 a persona

[Prenota ora](/contact)',
  'escursioni',
  'published',
  'Rimini Charter',
  NOW()
),
(
  'Aperitivo al Tramonto',
  'aperitivo-tramonto',
  'Un''esperienza romantica con vista sul tramonto della Riviera Romagnola.',
  '## Aperitivo al Tramonto

Lasciati cullare dalle onde mentre il sole si tuffa nell''orizzonte. Il nostro aperitivo in barca è l''esperienza perfetta per:

- Coppie in cerca di romanticismo
- Gruppi di amici
- Occasioni speciali

### Cosa Include

- 2 ore di navigazione
- Selezione di vini locali
- Finger food gourmet
- Musica d''ambiente

**Orario**: 18:00 - 20:00 (orario variabile in base al tramonto)

**Prezzo**: Da €50 a persona',
  'escursioni',
  'published',
  'Rimini Charter',
  NOW()
);

-- Verify
SELECT id, title, slug, category, status FROM articles;
