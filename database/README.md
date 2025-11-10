# Database Documentation

## Overview

This directory contains SQL scripts for setting up and managing the Macworld Inventory System database.

## Files

- **schema.sql**: Complete database schema including tables, indexes, views, and triggers
- **seed.sql**: Sample data for testing and development

## Setup Instructions

### 1. Create Database

```bash
createdb macworld_inventory
```

Or using psql:
```sql
CREATE DATABASE macworld_inventory;
```

### 2. Run Schema

```bash
psql -d macworld_inventory -f schema.sql
```

### 3. Load Sample Data (Optional)

```bash
psql -d macworld_inventory -f seed.sql
```

## Database Schema

### Tables

#### users
Stores user account information with authentication details.
- Primary key: `id`
- Unique constraint: `email`
- Roles: `admin`, `staff`

#### products
Product inventory with stock tracking.
- Primary key: `id`
- Unique constraint: `sku`
- Automatic stock tracking
- Low stock threshold alerts

#### customers
Customer information and purchase history.
- Primary key: `id`
- Tracks total purchases
- Stores contact and address information

#### invoices
Invoice headers with payment information.
- Primary key: `id`
- Unique constraint: `invoice_number`
- Payment status: `paid`, `unpaid`, `partial`
- Invoice status: `draft`, `sent`, `paid`, `cancelled`

#### invoice_items
Line items for each invoice.
- Primary key: `id`
- Foreign key to `invoices` (CASCADE delete)
- Foreign key to `products` (SET NULL on delete)

### Views

#### low_stock_products
Shows products where stock is at or below the threshold.
```sql
SELECT * FROM low_stock_products;
```

#### invoice_summary
Provides a summary of all invoices with item counts.
```sql
SELECT * FROM invoice_summary;
```

### Indexes

Optimized indexes on:
- User email and role
- Product SKU, category, and stock quantity
- Customer email and phone
- Invoice number, customer, status, and payment status
- Invoice items relationships

### Triggers

Automatic `updated_at` timestamp updates on:
- users
- products
- customers
- invoices

## Sample Queries

### Get low stock products
```sql
SELECT * FROM low_stock_products;
```

### Get customer purchase history
```sql
SELECT 
    c.name,
    c.total_purchases,
    COUNT(i.id) as invoice_count
FROM customers c
LEFT JOIN invoices i ON c.id = i.customer_id
GROUP BY c.id;
```

### Get monthly sales report
```sql
SELECT 
    DATE_TRUNC('month', created_at) as month,
    COUNT(*) as invoice_count,
    SUM(total) as total_sales,
    SUM(amount_paid) as total_paid
FROM invoices
WHERE status != 'cancelled'
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY month DESC;
```

### Get product sales by category
```sql
SELECT 
    p.category,
    COUNT(DISTINCT ii.invoice_id) as orders,
    SUM(ii.quantity) as units_sold,
    SUM(ii.subtotal) as revenue
FROM products p
JOIN invoice_items ii ON p.id = ii.product_id
GROUP BY p.category
ORDER BY revenue DESC;
```

## Maintenance

### Backup Database
```bash
pg_dump macworld_inventory > backup_$(date +%Y%m%d).sql
```

### Restore Database
```bash
psql macworld_inventory < backup_20240101.sql
```

### Reset Database
```bash
psql -d macworld_inventory -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
psql -d macworld_inventory -f schema.sql
psql -d macworld_inventory -f seed.sql
```

## Security Notes

1. Create a dedicated database user with limited permissions
2. Never use the superuser account in production
3. Ensure SSL/TLS is enabled for database connections
4. Regular backups are essential
5. Update the sample passwords in seed.sql

## Production Recommendations

1. Set up regular automated backups
2. Configure connection pooling
3. Monitor slow queries and optimize as needed
4. Set up replication for high availability
5. Implement database monitoring and alerting

