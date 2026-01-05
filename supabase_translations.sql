-- =============================================
-- MULTI-LANGUAGE SUPPORT FOR DYNAMIC CONTENT
-- Adds English translation fields to services, articles, and boats
-- =============================================

-- ==================== SERVICES ====================
-- Add English translation fields
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS name_en TEXT;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS description_en TEXT;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS features_en TEXT[] DEFAULT '{}';
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS price_text_en VARCHAR(100);

-- ==================== ARTICLES ====================
-- Add English translation fields
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS title_en TEXT;
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS excerpt_en TEXT;
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS content_en TEXT;

-- ==================== BOATS ====================
-- Add English translation fields
ALTER TABLE public.boats ADD COLUMN IF NOT EXISTS name_en TEXT;
ALTER TABLE public.boats ADD COLUMN IF NOT EXISTS description_en TEXT;

-- ==================== VERIFY ====================
-- Check that columns were added
SELECT 
    'services' as table_name,
    column_name 
FROM information_schema.columns 
WHERE table_name = 'services' AND column_name LIKE '%_en'
UNION ALL
SELECT 
    'articles' as table_name,
    column_name 
FROM information_schema.columns 
WHERE table_name = 'articles' AND column_name LIKE '%_en'
UNION ALL
SELECT 
    'boats' as table_name,
    column_name 
FROM information_schema.columns 
WHERE table_name = 'boats' AND column_name LIKE '%_en';
