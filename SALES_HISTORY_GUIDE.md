# 📈 Sales History Guide

Complete guide to track and analyze product sales in your Macworld Inventory System.

---

## 🎯 Quick Answer to Your Question

**"How do I select a product that was bought or paid?"**

**Answer**: 
1. Click **"Sales"** (📈) in the navigation menu
2. You'll see **ALL products that have been sold**
3. Click **"Paid"** filter button to see only fully paid products
4. Click **"View Details →"** on any product to see complete purchase history
5. View all invoices, customers, dates, and payment status!

---

## ✨ What Is Sales History?

The **Sales History** page shows you:
- ✅ Which products have been sold
- ✅ How many units of each product sold
- ✅ How many times each product was sold
- ✅ Total revenue per product
- ✅ Paid revenue (from paid invoices only)
- ✅ Complete invoice history per product
- ✅ Customer purchase records
- ✅ Payment status tracking

---

## 🚀 How to Access

### Method 1: Navigation Menu
1. Look at the top navigation bar
2. Click **"Sales"** (📈 icon)
3. You're there!

### Method 2: Direct URL
Go to: `http://localhost:3000/sales-history`

---

## 📊 Page Layout

```
┌─────────────────────────────────────────────────────────────┐
│                    📈 Sales History                         │
│        Track product sales, revenue, and purchases          │
├─────────────────────────────────────────────────────────────┤
│  STATISTICS (4 cards):                                      │
│  [Total Products] [Quantity Sold] [Total Revenue] [Paid]   │
├─────────────────────────────────────────────────────────────┤
│  FILTERS:                                                   │
│  Search: [____________]   [All] [Paid] [Has Unpaid]        │
├─────────────────────────────────────────────────────────────┤
│  PRODUCTS TABLE:                                            │
│  Product | Qty | Times | Revenue | Paid | Status | Actions │
│  iPhone  | 50  |  15   | ₦500k   | ₦450k| Partial| Details→│
│  MacBook | 10  |   8   | ₦800k   | ₦800k| Paid   | Details→│
└─────────────────────────────────────────────────────────────┘
```

---

## 📈 Statistics Cards

### 1. Total Products Sold
- **Shows**: Number of unique products that have been sold
- **Example**: "25" means 25 different products have been sold

### 2. Quantity Sold
- **Shows**: Total number of units sold across all products
- **Example**: "100" means 100 units total

### 3. Total Revenue
- **Shows**: Total money from all sales (paid + unpaid)
- **Example**: "₦500,000" = total sales value
- **Includes**: Both paid and unpaid invoices

### 4. Paid Revenue
- **Shows**: Money actually received (paid invoices only)
- **Example**: "₦450,000" = money in hand
- **Excludes**: Unpaid and partial invoices

---

## 🔍 Filtering Options

### Payment Status Filters

#### All (Default)
- Shows all products that have been sold
- Regardless of payment status
- Complete overview

#### Paid
- Shows only products with **at least one paid invoice**
- Good for seeing confirmed sales
- Products that generated revenue

#### Has Unpaid
- Shows products with **at least one unpaid invoice**
- Good for tracking outstanding payments
- Follow up on pending payments

### Search Bar
- Type product name
- Real-time filtering
- Case-insensitive
- Example: Type "iphone" to find all iPhone products

---

## 📊 Table Columns Explained

### Product (with image)
- Product name
- Product ID
- Product image (if available)

### Quantity Sold
- Total units sold across all invoices
- Example: "50 units"

### Times Sold
- Number of invoices containing this product
- Example: "15 invoices"

### Total Revenue
- Sum of all sales (paid + unpaid)
- Example: "₦500,000"
- **Green color**

### Paid Revenue
- Sum of paid invoices only
- Example: "₦450,000"
- **Purple color**
- Shows "Pending" if less than total

### Status
- **All Paid** (green badge): All invoices paid
- **All Unpaid** (red badge): No invoices paid
- **Partial** (yellow badge): Some paid, some unpaid

### Actions
- **"View Details →"** button
- Click to see complete history

---

## 🔎 Product Detail Modal

When you click **"View Details"**, you'll see:

### Product Information Section
```
┌─────────────────────────────────────────────────────────┐
│  [Product Image]  Product Name                          │
│                   - Total Sold: 50 units                │
│                   - Times Sold: 15 invoices             │
│                   - Total Revenue: ₦500,000             │
│                   - Paid Revenue: ₦450,000              │
└─────────────────────────────────────────────────────────┘
```

### Invoice History Section
- **Complete list** of all invoices for this product
- Each invoice shows:
  - Invoice number (e.g., INV-2025-11-0042)
  - Payment status badge (Paid/Unpaid/Partial)
  - Customer name
  - Date and time
  - Quantity sold
  - Unit price
  - Total amount
- **Click any invoice** to go to full invoice details

---

## 💡 Common Use Cases

### 1. Find Your Best Sellers
**Goal**: See which products make the most money

**Steps**:
1. Go to Sales History page
2. Look at the top of the table
3. Products are **sorted by revenue** (highest first)
4. Top products = best sellers!

**Why**: Helps you decide what to stock more

---

### 2. Track Products with Paid Sales
**Goal**: See which products have generated actual revenue

**Steps**:
1. Go to Sales History page
2. Click **"Paid"** filter button
3. See only products with paid invoices
4. View paid revenue column

**Why**: Know your real income, not just sales on paper

---

### 3. Find Products with Unpaid Invoices
**Goal**: Follow up on outstanding payments

**Steps**:
1. Go to Sales History page
2. Click **"Has Unpaid"** filter button
3. See products with pending payments
4. Click "View Details" to see which invoices are unpaid
5. Contact those customers

**Why**: Collect outstanding payments

---

### 4. View Complete Sales History for a Product
**Goal**: See all invoices for a specific product

**Steps**:
1. Go to Sales History page
2. Search for product name (or scroll to find it)
3. Click **"View Details →"**
4. See complete invoice list
5. Click any invoice to view full details

**Why**: Track product performance over time

---

### 5. See Who Bought a Product
**Goal**: Find customers who purchased a specific product

**Steps**:
1. Go to Sales History page
2. Find the product
3. Click **"View Details →"**
4. View invoice history
5. See customer names for each purchase

**Why**: Contact customers for feedback, warranties, or promotions

---

### 6. Calculate Profit Margins
**Goal**: Compare cost vs revenue

**Steps**:
1. Go to Sales History page
2. Note the "Total Revenue" for a product
3. Go to Products page
4. Check product cost/price
5. Calculate: Revenue - (Cost × Quantity Sold)

**Why**: Understand profitability

---

## 📊 Understanding the Metrics

### Total Quantity Sold
**Formula**: Sum of all quantities from all invoices

**Example**:
- Invoice 1: Sold 5 units
- Invoice 2: Sold 3 units
- Invoice 3: Sold 2 units
- **Total Quantity Sold: 10 units**

---

### Times Sold
**Formula**: Count of invoices containing this product

**Example**:
- Product appears in 15 different invoices
- **Times Sold: 15**

**Note**: Different from quantity (one invoice can have multiple units)

---

### Total Revenue
**Formula**: Sum of subtotals from ALL invoices (paid + unpaid)

**Example**:
- Paid Invoice 1: ₦50,000
- Paid Invoice 2: ₦30,000
- Unpaid Invoice 3: ₦20,000
- **Total Revenue: ₦100,000**

**Meaning**: Total value of sales (whether paid or not)

---

### Paid Revenue
**Formula**: Sum of subtotals from PAID invoices only

**Example**:
- Paid Invoice 1: ₦50,000
- Paid Invoice 2: ₦30,000
- Unpaid Invoice 3: ₦20,000 (not counted)
- **Paid Revenue: ₦80,000**

**Meaning**: Actual money received

---

### Pending/Outstanding
**Formula**: Total Revenue - Paid Revenue

**Example**:
- Total Revenue: ₦100,000
- Paid Revenue: ₦80,000
- **Pending: ₦20,000**

**Meaning**: Money still owed by customers

---

## 🎨 Status Badge Colors

### 🟢 Green Badge: "All Paid"
- **Meaning**: Every invoice is paid
- **Status**: times_paid = times_sold
- **Example**: 15 invoices, 15 paid

### 🔴 Red Badge: "All Unpaid"
- **Meaning**: No invoices paid
- **Status**: times_paid = 0
- **Example**: 5 invoices, 0 paid

### 🟡 Yellow Badge: "Partial"
- **Meaning**: Some paid, some unpaid
- **Status**: 0 < times_paid < times_sold
- **Example**: 10 invoices, 6 paid

---

## 🔗 Navigation & Integration

### From Sales History Page

**To Invoice Details**:
- Click product "View Details"
- Click any invoice in the history
- Navigates to Invoices page (with invoice details)

**To Products Page**:
- Click "Products" in navigation
- Manage inventory

**To Create Invoice**:
- Click "Invoices" in navigation
- Click "Create Invoice"

---

## 📱 Responsive Design

### Desktop (> 1024px)
- Full table with all columns
- Large statistics cards
- Side-by-side filters

### Tablet (768px - 1024px)
- Scrollable table
- Stacked statistics
- Condensed layout

### Mobile (< 768px)
- Vertical card layout
- Touch-friendly buttons
- Full-width modals

---

## 🎯 Tips & Tricks

### ✅ DO:
- ✓ Sort by revenue to find best sellers
- ✓ Use filters to narrow down results
- ✓ Click "View Details" for complete history
- ✓ Check "Pending" amounts for follow-ups
- ✓ Compare Total vs Paid revenue

### ❌ DON'T:
- ✗ Confuse "Times Sold" with "Quantity Sold"
- ✗ Forget to filter by payment status
- ✗ Ignore partial payments
- ✗ Skip viewing product details

---

## 🔄 Data Updates

### When Does Data Update?

**Automatically updates when**:
- New invoice is created
- Invoice payment status changes
- Product is added to invoice

**Refresh the page to see**:
- Latest statistics
- New sales records
- Updated payment statuses

---

## ❓ FAQ

### Q: Why don't I see any products?
**A**: No invoices have been created yet. Create an invoice first!

### Q: Why is Total Revenue different from Paid Revenue?
**A**: Total includes unpaid invoices. Paid only counts money received.

### Q: How do I see which customer bought a product?
**A**: Click "View Details →" on the product, then view invoice history.

### Q: Can I export this data?
**A**: Currently no export feature. Coming in future update!

### Q: What if payment status changes?
**A**: Update the invoice payment status, then refresh Sales History page.

### Q: Why is a product showing as "Partial"?
**A**: Some invoices are paid, some are unpaid or partially paid.

### Q: Can I see sales by date range?
**A**: Not yet. Click "View Details" to see dates for each sale.

### Q: How do I track a specific customer's purchases?
**A**: Use the Customers page (coming soon) or check invoice history.

---

## 🎯 Real-World Examples

### Example 1: Following Up on Unpaid Sales

**Scenario**: You want to collect outstanding payments

**Steps**:
1. Go to Sales History
2. Click **"Has Unpaid"** filter
3. See products with unpaid invoices
4. Click "View Details" on high-value products
5. Note customer names with unpaid invoices
6. Contact them for payment

**Result**: Clear action list of who owes money

---

### Example 2: Identifying Best Sellers

**Scenario**: You want to restock top products

**Steps**:
1. Go to Sales History
2. Look at top 5 products (sorted by revenue)
3. Note quantity sold and times sold
4. Go to Products page
5. Check current stock levels
6. Reorder popular items

**Result**: Never run out of popular products

---

### Example 3: Analyzing Product Performance

**Scenario**: Compare two similar products

**Steps**:
1. Go to Sales History
2. Find Product A: ₦500k revenue, 50 units
3. Find Product B: ₦300k revenue, 100 units
4. Calculate:
   - A: ₦10,000 per unit (high-value)
   - B: ₦3,000 per unit (high-volume)
5. Decision: Stock both (different market segments)

**Result**: Data-driven inventory decisions

---

## ✅ Summary

**Sales History lets you**:
- ✅ See all products that have been sold
- ✅ Track sales performance by product
- ✅ Identify best sellers
- ✅ Monitor paid vs unpaid revenue
- ✅ View complete purchase history
- ✅ Follow up on outstanding payments
- ✅ Make data-driven decisions

**To answer your original question again**:

> "How do I select a product that was bought or paid?"

**Go to Sales History** → Click **"Sales"** (📈) in menu → Filter by **"Paid"** → Click **"View Details"** on any product → See complete purchase history!

---

## 🎉 You're All Set!

The Sales History page is ready to use. Just refresh your browser and click **"Sales"** in the navigation menu!

**No additional setup needed** - it uses the same database tables as the invoicing system.

Happy tracking! 📈💰

