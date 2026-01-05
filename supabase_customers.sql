-- =====================================================
-- YACHT~ME - Customer Management (Mini CRM)
-- =====================================================
-- Run this script in Supabase SQL Editor
-- =====================================================

-- Tabella customers
CREATE TABLE IF NOT EXISTS customers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    notes TEXT,
    tags TEXT[] DEFAULT '{}', -- Es: ['VIP', 'Azienda', 'Fedele']
    source VARCHAR(50) DEFAULT 'manual', -- 'manual', 'booking', 'website'
    total_spent DECIMAL(10,2) DEFAULT 0,
    total_bookings INTEGER DEFAULT 0,
    last_booking_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indici per ricerche veloci
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_name ON customers(name);
CREATE INDEX IF NOT EXISTS idx_customers_tags ON customers USING GIN(tags);

-- Trigger per aggiornare updated_at automaticamente
CREATE OR REPLACE FUNCTION update_customers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS customers_updated_at ON customers;
CREATE TRIGGER customers_updated_at
    BEFORE UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION update_customers_updated_at();

-- =====================================================
-- Politiche RLS (Row Level Security)
-- =====================================================

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Permetti lettura agli utenti autenticati
DROP POLICY IF EXISTS "Allow authenticated read customers" ON customers;
CREATE POLICY "Allow authenticated read customers" ON customers
    FOR SELECT TO authenticated USING (true);

-- Permetti inserimento agli utenti autenticati
DROP POLICY IF EXISTS "Allow authenticated insert customers" ON customers;
CREATE POLICY "Allow authenticated insert customers" ON customers
    FOR INSERT TO authenticated WITH CHECK (true);

-- Permetti aggiornamento agli utenti autenticati
DROP POLICY IF EXISTS "Allow authenticated update customers" ON customers;
CREATE POLICY "Allow authenticated update customers" ON customers
    FOR UPDATE TO authenticated USING (true);

-- Permetti eliminazione agli utenti autenticati
DROP POLICY IF EXISTS "Allow authenticated delete customers" ON customers;
CREATE POLICY "Allow authenticated delete customers" ON customers
    FOR DELETE TO authenticated USING (true);

-- =====================================================
-- Funzione per aggiornare le statistiche del cliente
-- =====================================================

CREATE OR REPLACE FUNCTION update_customer_stats(customer_email VARCHAR)
RETURNS void AS $$
DECLARE
    booking_stats RECORD;
BEGIN
    SELECT 
        COUNT(*) as total_bookings,
        COALESCE(SUM(total_price), 0) as total_spent,
        MAX(start_date) as last_booking
    INTO booking_stats
    FROM bookings
    WHERE customer_email = customer_email AND status != 'cancelled';
    
    UPDATE customers
    SET 
        total_bookings = booking_stats.total_bookings,
        total_spent = booking_stats.total_spent,
        last_booking_date = booking_stats.last_booking
    WHERE email = customer_email;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- Inserisci clienti esistenti dalle prenotazioni
-- =====================================================

INSERT INTO customers (name, email, phone, source, total_spent, total_bookings, last_booking_date)
SELECT DISTINCT ON (customer_email)
    customer_name as name,
    customer_email as email,
    customer_phone as phone,
    'booking' as source,
    (SELECT COALESCE(SUM(total_price), 0) FROM bookings b2 WHERE b2.customer_email = b.customer_email AND b2.status != 'cancelled') as total_spent,
    (SELECT COUNT(*) FROM bookings b2 WHERE b2.customer_email = b.customer_email AND b2.status != 'cancelled') as total_bookings,
    (SELECT MAX(start_date) FROM bookings b2 WHERE b2.customer_email = b.customer_email AND b2.status != 'cancelled') as last_booking_date
FROM bookings b
WHERE customer_email IS NOT NULL AND customer_email != ''
ON CONFLICT (email) DO NOTHING;

-- =====================================================
-- Verifica
-- =====================================================
SELECT 'Customers table created successfully!' as status;
SELECT COUNT(*) as total_customers FROM customers;
