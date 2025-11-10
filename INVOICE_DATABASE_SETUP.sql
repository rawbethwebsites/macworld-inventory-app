-- Invoice System Database Setup for Supabase

-- 1. Create customers table
CREATE TABLE IF NOT EXISTS customers (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT DEFAULT 'Abuja',
  state TEXT DEFAULT 'FCT',
  country TEXT DEFAULT 'Nigeria',
  notes TEXT,
  total_purchases NUMERIC(12, 2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true
);

-- 2. Create invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  invoice_number TEXT UNIQUE NOT NULL,
  customer_id BIGINT REFERENCES customers(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  customer_phone TEXT,
  customer_address TEXT,
  subtotal NUMERIC(12, 2) NOT NULL CHECK (subtotal >= 0),
  discount NUMERIC(12, 2) DEFAULT 0 CHECK (discount >= 0),
  tax NUMERIC(12, 2) DEFAULT 0 CHECK (tax >= 0),
  total NUMERIC(12, 2) NOT NULL CHECK (total >= 0),
  amount_paid NUMERIC(12, 2) DEFAULT 0 CHECK (amount_paid >= 0),
  payment_status TEXT DEFAULT 'unpaid' CHECK (payment_status IN ('paid', 'unpaid', 'partial')),
  payment_method TEXT,
  notes TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'cancelled')),
  created_by TEXT
);

-- 3. Create invoice_items table
CREATE TABLE IF NOT EXISTS invoice_items (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  invoice_id BIGINT REFERENCES invoices(id) ON DELETE CASCADE,
  product_id BIGINT REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  product_sku TEXT,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(10, 2) NOT NULL CHECK (unit_price >= 0),
  discount NUMERIC(10, 2) DEFAULT 0 CHECK (discount >= 0),
  subtotal NUMERIC(12, 2) NOT NULL CHECK (subtotal >= 0)
);

-- 4. Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_invoices_number ON invoices(invoice_number);
CREATE INDEX IF NOT EXISTS idx_invoices_customer ON invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_payment_status ON invoices(payment_status);
CREATE INDEX IF NOT EXISTS idx_invoices_created_at ON invoices(created_at);
CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice ON invoice_items(invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoice_items_product ON invoice_items(product_id);

-- 5. Enable RLS
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;

-- 6. Create policies (allow all for development)
DROP POLICY IF EXISTS "Allow all access to customers" ON customers;
CREATE POLICY "Allow all access to customers"
ON customers FOR ALL
TO public
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all access to invoices" ON invoices;
CREATE POLICY "Allow all access to invoices"
ON invoices FOR ALL
TO public
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all access to invoice_items" ON invoice_items;
CREATE POLICY "Allow all access to invoice_items"
ON invoice_items FOR ALL
TO public
USING (true)
WITH CHECK (true);

-- 7. Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 8. Create triggers for updated_at
DROP TRIGGER IF EXISTS update_customers_updated_at ON customers;
CREATE TRIGGER update_customers_updated_at
    BEFORE UPDATE ON customers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_invoices_updated_at ON invoices;
CREATE TRIGGER update_invoices_updated_at
    BEFORE UPDATE ON invoices
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 9. Insert sample customers
INSERT INTO customers (name, email, phone, address, city, state) VALUES
  ('John Doe', 'john@example.com', '+234 803 123 4567', '15 Herbert Macaulay Way', 'Abuja', 'FCT'),
  ('Jane Smith', 'jane@example.com', '+234 805 987 6543', '42 Gimbiya Street', 'Abuja', 'FCT'),
  ('Ahmed Ibrahim', 'ahmed@example.com', '+234 807 456 7890', '23 Adeola Odeku', 'Lagos', 'Lagos'),
  ('Chioma Okafor', 'chioma@example.com', '+234 809 234 5678', '10 Allen Avenue', 'Lagos', 'Lagos')
ON CONFLICT DO NOTHING;

-- Done! Invoice system is ready.
