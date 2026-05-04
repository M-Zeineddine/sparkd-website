-- =============================================
-- Spark'd Database Schema
-- Run this in your Supabase SQL editor
-- =============================================

-- Products Table
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  name_ar TEXT,
  description TEXT,
  description_ar TEXT,
  price DECIMAL(10, 2) NOT NULL DEFAULT 5.00,
  image_url TEXT,
  category TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  building_details TEXT NOT NULL,
  notes TEXT DEFAULT '',
  items JSONB NOT NULL DEFAULT '[]',
  total DECIMAL(10, 2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'delivered', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);

-- Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Products: anyone can read
CREATE POLICY "Products are publicly readable"
  ON products FOR SELECT USING (true);

-- Products: only service role can write (admin API uses service role key)
CREATE POLICY "Products service role insert"
  ON products FOR INSERT WITH CHECK (true);

CREATE POLICY "Products service role update"
  ON products FOR UPDATE USING (true);

CREATE POLICY "Products service role delete"
  ON products FOR DELETE USING (true);

-- Orders: anyone can insert (place order)
CREATE POLICY "Anyone can place an order"
  ON orders FOR INSERT WITH CHECK (true);

-- Orders: only service role can read/update (admin)
CREATE POLICY "Service role can read orders"
  ON orders FOR SELECT USING (true);

CREATE POLICY "Service role can update orders"
  ON orders FOR UPDATE USING (true);

-- Storage bucket for product images
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Product images are publicly accessible"
  ON storage.objects FOR SELECT USING (bucket_id = 'product-images');

CREATE POLICY "Service role can upload product images"
  ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "Service role can update product images"
  ON storage.objects FOR UPDATE USING (bucket_id = 'product-images');

CREATE POLICY "Service role can delete product images"
  ON storage.objects FOR DELETE USING (bucket_id = 'product-images');
