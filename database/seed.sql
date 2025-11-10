-- Macworld Inventory System - Seed Data
-- This file contains sample data for testing

-- Clear existing data (in correct order)
TRUNCATE TABLE invoice_items, invoices, customers, products, users RESTART IDENTITY CASCADE;

-- Insert sample users
-- Password for all users: 'password123' (will be hashed by the application)
INSERT INTO users (email, password, full_name, role) VALUES
('admin@macworld.com', '$2b$10$rQZ8xqJ5m8F7K0H5N2H5N2H5N2H5N2H5N2H5N2H5N2H5N2H5N2H5N2', 'Admin User', 'admin'),
('staff@macworld.com', '$2b$10$rQZ8xqJ5m8F7K0H5N2H5N2H5N2H5N2H5N2H5N2H5N2H5N2H5N2H5N2', 'Staff User', 'staff');

-- Note: The passwords above are placeholders. Use the application's registration endpoint to create users with properly hashed passwords.

-- Insert sample products
INSERT INTO products (name, description, category, sku, price, cost_price, quantity_in_stock, low_stock_threshold, created_by) VALUES
-- Smartphones
('iPhone 14 Pro Max', 'Latest Apple flagship smartphone with A16 Bionic chip, 256GB', 'Smartphones', 'IPH14PM256', 850000, 750000, 15, 5, 1),
('Samsung Galaxy S23 Ultra', 'Samsung flagship with S Pen, 256GB', 'Smartphones', 'SAMS23U256', 780000, 680000, 12, 5, 1),
('Google Pixel 7 Pro', 'Google flagship with Tensor G2 chip, 128GB', 'Smartphones', 'GPIX7P128', 650000, 550000, 8, 5, 1),
('OnePlus 11', '5G smartphone with Snapdragon 8 Gen 2, 256GB', 'Smartphones', 'OP11256', 520000, 450000, 10, 5, 1),
('Xiaomi 13 Pro', 'Flagship phone with Leica camera, 256GB', 'Smartphones', 'XM13P256', 580000, 500000, 7, 5, 1),

-- Laptops
('MacBook Pro 16"', 'M2 Pro chip, 16GB RAM, 512GB SSD', 'Laptops', 'MBP16M2', 1850000, 1650000, 8, 3, 1),
('Dell XPS 15', 'Intel i7, 16GB RAM, 512GB SSD, 4K display', 'Laptops', 'DXPS15I7', 1200000, 1050000, 6, 3, 1),
('HP Spectre x360', 'Intel i7, 16GB RAM, 1TB SSD, 2-in-1 convertible', 'Laptops', 'HPSP360', 1100000, 950000, 5, 3, 1),
('Lenovo ThinkPad X1', 'Intel i7, 16GB RAM, 512GB SSD, Business laptop', 'Laptops', 'LNTPX1', 980000, 850000, 4, 3, 1),
('ASUS ROG Zephyrus', 'Gaming laptop, RTX 4070, 32GB RAM, 1TB SSD', 'Laptops', 'ASROG14', 1650000, 1450000, 3, 2, 1),

-- Tablets
('iPad Pro 12.9"', 'M2 chip, 256GB, WiFi + Cellular', 'Tablets', 'IPADPM2', 950000, 850000, 10, 4, 1),
('Samsung Galaxy Tab S8+', 'Snapdragon 8 Gen 1, 256GB, S Pen included', 'Tablets', 'SGTS8P256', 620000, 550000, 8, 4, 1),
('Microsoft Surface Pro 9', 'Intel i7, 16GB RAM, 256GB SSD', 'Tablets', 'MSSP9I7', 850000, 750000, 6, 3, 1),

-- Accessories
('AirPods Pro 2', 'Active Noise Cancellation, USB-C', 'Accessories', 'APP2USBC', 180000, 150000, 25, 10, 1),
('Samsung Galaxy Buds 2 Pro', 'Premium wireless earbuds with ANC', 'Accessories', 'SGB2PRO', 140000, 120000, 20, 10, 1),
('Apple Magic Keyboard', 'For iPad Pro 12.9"', 'Accessories', 'AMKIPAD', 250000, 220000, 12, 5, 1),
('Logitech MX Master 3S', 'Wireless mouse for professionals', 'Accessories', 'LGMXM3S', 85000, 70000, 15, 8, 1),
('Anker PowerCore 20K', '20,000mAh power bank with PD charging', 'Accessories', 'ANKPC20K', 45000, 35000, 30, 15, 1),
('Belkin USB-C Hub', '7-in-1 multiport adapter', 'Accessories', 'BLKUSBCH', 35000, 28000, 18, 10, 1),

-- Smartwatches
('Apple Watch Series 9', 'GPS + Cellular, 45mm, Aluminum', 'Smartwatches', 'AWS9C45', 420000, 370000, 12, 5, 1),
('Samsung Galaxy Watch 6', '44mm, Bluetooth, GPS', 'Smartwatches', 'SGW644', 280000, 240000, 10, 5, 1),
('Garmin Fenix 7', 'Premium multisport GPS watch', 'Smartwatches', 'GARF7', 650000, 580000, 5, 3, 1);

-- Insert sample customers
INSERT INTO customers (name, email, phone, address, city, state, country, created_by) VALUES
('Emeka Okafor', 'emeka.okafor@email.com', '+234 803 456 7890', '15 Ademola Adetokunbo Street', 'Abuja', 'FCT', 'Nigeria', 1),
('Aisha Mohammed', 'aisha.mohammed@email.com', '+234 805 123 4567', '28 Gimbiya Street', 'Abuja', 'FCT', 'Nigeria', 1),
('Chidi Nwankwo', 'chidi.nwankwo@email.com', '+234 807 890 1234', '42 Adeola Odeku Street', 'Lagos', 'Lagos', 'Nigeria', 1),
('Fatima Yusuf', 'fatima.yusuf@email.com', '+234 809 234 5678', '10 Ibrahim Babangida Way', 'Abuja', 'FCT', 'Nigeria', 1),
('Oluwaseun Adeyemi', 'oluwaseun.adeyemi@email.com', '+234 802 345 6789', '23 Awolowo Road', 'Lagos', 'Lagos', 'Nigeria', 1),
('Ngozi Eze', 'ngozi.eze@email.com', '+234 806 567 8901', '18 Kingsway Road', 'Abuja', 'FCT', 'Nigeria', 1),
('Yusuf Ibrahim', 'yusuf.ibrahim@email.com', '+234 808 678 9012', '35 Herbert Macaulay Way', 'Abuja', 'FCT', 'Nigeria', 1),
('Chiamaka Okoro', 'chiamaka.okoro@email.com', '+234 804 789 0123', '50 Allen Avenue', 'Lagos', 'Lagos', 'Nigeria', 1);

-- Insert sample invoices
INSERT INTO invoices (invoice_number, customer_id, customer_name, customer_email, customer_phone, customer_address, subtotal, discount, tax, total, amount_paid, payment_status, payment_method, status, created_by) VALUES
('INV-2024-01-0001', 1, 'Emeka Okafor', 'emeka.okafor@email.com', '+234 803 456 7890', '15 Ademola Adetokunbo Street, Abuja', 850000, 0, 0, 850000, 850000, 'paid', 'Bank Transfer', 'paid', 1),
('INV-2024-01-0002', 2, 'Aisha Mohammed', 'aisha.mohammed@email.com', '+234 805 123 4567', '28 Gimbiya Street, Abuja', 1200000, 50000, 0, 1150000, 1150000, 'paid', 'Cash', 'paid', 1),
('INV-2024-01-0003', 3, 'Chidi Nwankwo', 'chidi.nwankwo@email.com', '+234 807 890 1234', '42 Adeola Odeku Street, Lagos', 1650000, 0, 0, 1650000, 1000000, 'partial', 'Bank Transfer', 'sent', 1),
('INV-2024-01-0004', 4, 'Fatima Yusuf', 'fatima.yusuf@email.com', '+234 809 234 5678', '10 Ibrahim Babangida Way, Abuja', 320000, 20000, 0, 300000, 0, 'unpaid', NULL, 'sent', 1);

-- Insert sample invoice items
INSERT INTO invoice_items (invoice_id, product_id, product_name, product_sku, quantity, unit_price, discount, subtotal) VALUES
-- Invoice 1 items
(1, 1, 'iPhone 14 Pro Max', 'IPH14PM256', 1, 850000, 0, 850000),

-- Invoice 2 items
(2, 6, 'MacBook Pro 16"', 'MBP16M2', 1, 1850000, 50000, 1800000),
(2, 14, 'AirPods Pro 2', 'APP2USBC', 2, 180000, 0, 360000),

-- Invoice 3 items
(3, 10, 'ASUS ROG Zephyrus', 'ASROG14', 1, 1650000, 0, 1650000),

-- Invoice 4 items
(4, 20, 'Apple Watch Series 9', 'AWS9C45', 1, 420000, 0, 420000),
(4, 17, 'Logitech MX Master 3S', 'LGMXM3S', 1, 85000, 0, 85000);

-- Update customer total purchases
UPDATE customers SET total_purchases = (
    SELECT COALESCE(SUM(total), 0)
    FROM invoices
    WHERE customer_id = customers.id
);

-- Note: In production, stock should be deducted when invoices are created/confirmed
-- For this seed data, we're starting with the stock levels as shown in the products table

