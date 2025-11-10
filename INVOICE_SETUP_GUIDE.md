# 🧾 Invoice System Setup Guide

Complete guide to set up the invoicing system for Macworld Inventory App.

---

## 📋 Quick Setup Steps

### Step 1: Run the SQL Script

1. **Open Supabase Dashboard**: Go to https://supabase.com/dashboard
2. **Navigate to SQL Editor**: Click "SQL Editor" in the left sidebar
3. **Open the SQL file**: Find `INVOICE_DATABASE_SETUP.sql` in your project root
4. **Copy the entire SQL script**
5. **Paste it into Supabase SQL Editor**
6. **Click "RUN"** button

The script will create:
- ✅ `customers` table (customer information)
- ✅ `invoices` table (invoice headers)
- ✅ `invoice_items` table (invoice line items)
- ✅ Sample customers for testing
- ✅ Indexes for performance
- ✅ RLS policies (allow all for development)
- ✅ Triggers for automatic timestamps

### Step 2: Test the Invoice System

1. **Refresh your browser** at http://localhost:3000
2. **Click "Invoices"** in the navigation menu
3. You should see the invoice management page!

---

## 🎯 Features Overview

### ✨ Create Invoice
- **Customer Selection**: Choose existing customer or create new
- **Product Search**: Type to find products with live search
- **Smart Cart**: Add/remove products, adjust quantities
- **Stock Validation**: Can't sell more than available stock
- **Automatic Calculations**: Subtotal, discount, tax, total
- **Payment Tracking**: Record payment method and amount paid
- **Payment Status**: Auto-calculates (paid/unpaid/partial)

### 📊 Invoice Dashboard
- **Statistics Cards**: Total invoices, paid, unpaid, total revenue
- **Invoice List**: View all invoices in a clean table
- **Status Badges**: Color-coded payment status
- **Quick Actions**: Download PDF directly from list

### 📄 Invoice Detail View
- **Complete Information**: All invoice details in modal
- **Customer Info**: Full customer details
- **Item Breakdown**: Line-by-line item list
- **Payment Summary**: Subtotal, discount, tax, paid, balance
- **PDF Generation**: Download professional PDF invoice

### 🖨️ PDF Invoice Generation
- **Professional Layout**: Clean, business-ready design
- **Company Header**: Macworld branding and contact info
- **Customer Details**: Full billing information
- **Itemized Table**: Products, quantities, prices
- **Payment Summary**: All calculations and balance due
- **Auto-Download**: One-click PDF generation

### 🔄 Automatic Stock Deduction
- **Real-time Stock Update**: Deducts quantity when invoice created
- **Stock Validation**: Prevents overselling
- **Database Integration**: Updates products table automatically

---

## 🗃️ Database Schema

### Customers Table
```sql
customers
├─ id (BIGSERIAL PRIMARY KEY)
├─ created_at (TIMESTAMPTZ)
├─ updated_at (TIMESTAMPTZ)
├─ name (TEXT, NOT NULL)
├─ email (TEXT)
├─ phone (TEXT)
├─ address (TEXT)
├─ city (TEXT, DEFAULT 'Abuja')
├─ state (TEXT, DEFAULT 'FCT')
├─ country (TEXT, DEFAULT 'Nigeria')
├─ notes (TEXT)
├─ total_purchases (NUMERIC)
└─ is_active (BOOLEAN)
```

### Invoices Table
```sql
invoices
├─ id (BIGSERIAL PRIMARY KEY)
├─ created_at (TIMESTAMPTZ)
├─ updated_at (TIMESTAMPTZ)
├─ invoice_number (TEXT UNIQUE, NOT NULL)
├─ customer_id (BIGINT → customers)
├─ customer_name (TEXT, NOT NULL)
├─ customer_email (TEXT)
├─ customer_phone (TEXT)
├─ customer_address (TEXT)
├─ subtotal (NUMERIC)
├─ discount (NUMERIC)
├─ tax (NUMERIC)
├─ total (NUMERIC)
├─ amount_paid (NUMERIC)
├─ payment_status (TEXT: paid/unpaid/partial)
├─ payment_method (TEXT)
├─ notes (TEXT)
└─ status (TEXT: draft/sent/paid/cancelled)
```

### Invoice Items Table
```sql
invoice_items
├─ id (BIGSERIAL PRIMARY KEY)
├─ created_at (TIMESTAMPTZ)
├─ invoice_id (BIGINT → invoices)
├─ product_id (BIGINT → products)
├─ product_name (TEXT, NOT NULL)
├─ product_sku (TEXT)
├─ quantity (INTEGER)
├─ unit_price (NUMERIC)
├─ discount (NUMERIC)
└─ subtotal (NUMERIC)
```

---

## 🚀 How to Use

### Creating an Invoice

1. **Click "Create Invoice"** button
2. **Select Customer**:
   - Choose existing customer from dropdown, OR
   - Enter new customer details manually
3. **Add Products**:
   - Type in search box to find products
   - Click product to add to cart
   - Use +/- buttons to adjust quantity
   - Click trash icon to remove item
4. **Add Discount/Tax** (optional):
   - Enter discount amount
   - Enter tax amount
   - Totals update automatically
5. **Record Payment**:
   - Select payment method
   - Enter amount paid
   - Payment status calculated automatically
6. **Add Notes** (optional):
   - Any additional information
7. **Click "Create Invoice"**:
   - Invoice is saved
   - Stock is deducted automatically
   - Invoice appears in list

### Viewing Invoice Details

1. **Click any invoice row** in the table
2. **Modal opens** with complete details
3. **Download PDF** using the button
4. **Close modal** with X button

### Downloading PDF

**Method 1**: From invoice detail modal
- Click "Download PDF" button

**Method 2**: From invoice list
- Click download icon in Actions column

---

## 💡 Smart Features

### Automatic Invoice Numbers
- Format: `INV-YYYY-MM-XXXX`
- Example: `INV-2025-11-0042`
- Unique random number for each invoice

### Payment Status Logic
```
IF amount_paid >= total → "PAID" (green)
ELSE IF amount_paid > 0 → "PARTIAL" (yellow)
ELSE → "UNPAID" (red)
```

### Stock Deduction
```
When invoice is created:
1. Loop through all items
2. For each item:
   - Deduct quantity from products table
   - Update product.quantity
3. If stock insufficient → Error (prevents creation)
```

### Stock Validation
```
Before adding to cart:
- Check if product.quantity > 0
- Check if requested qty <= available qty
- Show error if insufficient stock
```

---

## 📱 Responsive Design

### Desktop (> 1024px)
- Full table with all columns
- Two-column form layout
- Large modals

### Tablet (768px - 1024px)
- Condensed table
- Stacked form sections
- Medium modals

### Mobile (< 768px)
- Vertical card layout
- Single-column form
- Full-screen modals

---

## 🎨 Visual Components

### Status Badges
- **Paid**: Green badge with green text
- **Partial**: Yellow badge with yellow text
- **Unpaid**: Red badge with red text

### Statistics Cards
- **Total Invoices**: Gray card
- **Paid**: Green accent
- **Unpaid**: Red accent
- **Total Revenue**: Primary blue

### Form Sections
- **Customer Information**: Bordered card
- **Products**: Bordered card with search
- **Totals & Payment**: Two-column layout

---

## 🔐 Security Notes

### Row Level Security (RLS)
Currently set to **allow all** for development. Before production:

```sql
-- Remove development policy
DROP POLICY "Allow all access to invoices" ON invoices;

-- Add authenticated user policy
CREATE POLICY "Users can access own invoices"
ON invoices FOR ALL
TO authenticated
USING (created_by = auth.uid())
WITH CHECK (created_by = auth.uid());
```

### Input Validation
- ✅ Customer name required
- ✅ At least one product required
- ✅ Quantity must be > 0
- ✅ Amount must be >= 0
- ✅ Total must be >= 0

---

## 🧪 Testing Checklist

### Basic Operations
- [ ] Create invoice with existing customer
- [ ] Create invoice with new customer
- [ ] Add multiple products to cart
- [ ] Increase/decrease product quantity
- [ ] Remove product from cart
- [ ] Add discount and tax
- [ ] Record full payment
- [ ] Record partial payment
- [ ] Save invoice without payment
- [ ] View invoice details
- [ ] Download PDF

### Stock Deduction
- [ ] Check product quantity before invoice
- [ ] Create invoice with product
- [ ] Verify quantity decreased after invoice
- [ ] Try to sell more than available (should fail)

### Edge Cases
- [ ] Create invoice with empty cart (should fail)
- [ ] Create invoice without customer name (should fail)
- [ ] Try to add out-of-stock product
- [ ] Try to increase quantity beyond stock

---

## 🐛 Troubleshooting

### Problem: "Could not find the table 'public.customers'"
**Solution**: Run the SQL script in Supabase SQL Editor

### Problem: Stock not deducting
**Solution**: Check if `products` table exists and has `quantity` column

### Problem: Can't see any products to add
**Solution**: 
1. Check if products exist: Go to Products page
2. Check if products have quantity > 0
3. Make sure products table has data

### Problem: PDF not downloading
**Solution**: 
1. Check browser console for errors
2. Verify jsPDF is installed: `npm list jspdf`
3. If missing: `npm install jspdf`

### Problem: Invoice number not unique
**Solution**: This is rare (random collision). Just create invoice again.

---

## 📈 Sample Data

The SQL script includes **4 sample customers**:
1. **John Doe** - Abuja (john@example.com)
2. **Jane Smith** - Abuja (jane@example.com)
3. **Ahmed Ibrahim** - Lagos (ahmed@example.com)
4. **Chioma Okafor** - Lagos (chioma@example.com)

---

## 🎯 What's Next?

After setting up invoices, you can:
1. ✅ **Create Dashboard**: Analytics and charts
2. ✅ **Customer Management**: Full CRUD for customers
3. ✅ **Reports**: Sales reports, revenue analysis
4. ✅ **Email Invoices**: Send PDFs via email
5. ✅ **Print Invoices**: Print-optimized layout
6. ✅ **Invoice Editing**: Modify existing invoices
7. ✅ **Credit Notes**: Returns and refunds

---

## 📞 Support

If you encounter any issues:
1. Check the troubleshooting section above
2. Verify all SQL tables are created
3. Check browser console for errors
4. Make sure all npm packages are installed

---

## ✅ Success Checklist

Your invoice system is working if:
- [ ] You can navigate to /invoices
- [ ] You see the invoice dashboard
- [ ] "Create Invoice" button works
- [ ] You can search and add products
- [ ] Products table shows your inventory
- [ ] You can create an invoice successfully
- [ ] Invoice appears in the list
- [ ] Stock quantity decreased
- [ ] You can view invoice details
- [ ] PDF downloads successfully
- [ ] Payment status shows correctly

---

**🎉 Congratulations! Your invoice system is ready!**

You now have a complete, professional invoicing system with:
- ✅ Customer management
- ✅ Product selection with search
- ✅ Automatic calculations
- ✅ Payment tracking
- ✅ PDF generation
- ✅ Automatic stock deduction
- ✅ Real-time validation
- ✅ Beautiful, responsive UI

Happy invoicing! 🧾💰

