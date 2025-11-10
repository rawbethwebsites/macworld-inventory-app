# Feature Specifications

This document outlines all features to be implemented in the Macworld Inventory and Invoicing System.

## 1. Authentication & Authorization

### User Registration
- [x] Database schema for users
- [ ] Registration API endpoint
- [ ] Password hashing with bcrypt
- [ ] Email validation
- [ ] Registration form (frontend)

### User Login
- [x] Database schema
- [ ] Login API endpoint
- [ ] JWT token generation
- [ ] Token validation middleware
- [ ] Login form (frontend)
- [ ] Auth context (frontend)

### Role-Based Access Control
- [x] Database support for roles (admin, staff)
- [ ] Admin middleware
- [ ] Role-based route protection
- [ ] UI elements based on role

## 2. Dashboard

### Overview Cards
- [ ] Total revenue (current month)
- [ ] Total sales count
- [ ] Total products
- [ ] Low stock alerts count

### Charts
- [ ] Sales trend (last 30 days) - Line chart
- [ ] Revenue by category - Pie chart
- [ ] Top selling products - Bar chart
- [ ] Payment status distribution - Doughnut chart

### Recent Activity
- [ ] Recent invoices list
- [ ] Recent low stock alerts
- [ ] Quick actions menu

### API Endpoints
- [ ] GET /api/dashboard/stats
- [ ] GET /api/dashboard/sales-trend
- [ ] GET /api/dashboard/category-sales
- [ ] GET /api/dashboard/top-products
- [ ] GET /api/dashboard/recent-activity

## 3. Product Management

### Product Listing
- [ ] Display all products in a table/grid
- [ ] Search by name, SKU, category
- [ ] Filter by category, stock status
- [ ] Sort by name, price, stock, date
- [ ] Pagination
- [ ] Low stock indicator

### Product Details
- [ ] View full product information
- [ ] Stock history
- [ ] Sales history
- [ ] Edit product
- [ ] Delete product (with confirmation)

### Add/Edit Product
- [ ] Product form with validation
- [ ] Fields: name, description, category, SKU, price, cost price, quantity, threshold
- [ ] Image upload (optional)
- [ ] Auto-generate SKU option
- [ ] Category dropdown/autocomplete

### Stock Management
- [ ] Adjust stock levels
- [ ] Stock history log
- [ ] Bulk stock update
- [ ] Import products from CSV (future)

### API Endpoints
- [ ] GET /api/products
- [ ] GET /api/products/:id
- [ ] POST /api/products
- [ ] PUT /api/products/:id
- [ ] DELETE /api/products/:id
- [ ] PATCH /api/products/:id/stock

## 4. Invoice Management

### Invoice Listing
- [ ] Display all invoices in a table
- [ ] Search by invoice number, customer name
- [ ] Filter by status, payment status, date range
- [ ] Sort by date, total, status
- [ ] Pagination
- [ ] Status badges (paid, unpaid, partial)

### Create Invoice
- [ ] Customer selection (existing or new)
- [ ] Add products (search and add to cart)
- [ ] Quantity selection with stock validation
- [ ] Calculate subtotal, discount, tax, total
- [ ] Payment information
- [ ] Auto-generate invoice number
- [ ] Preview before saving
- [ ] **Auto-deduct stock on creation**

### Invoice Details
- [ ] View full invoice
- [ ] Customer information
- [ ] Line items with details
- [ ] Payment status
- [ ] Actions: Edit, Delete, Print, Email

### Invoice Actions
- [ ] Edit invoice (if unpaid)
- [ ] Delete invoice (with stock restoration)
- [ ] Mark as paid/unpaid
- [ ] Record partial payment
- [ ] Generate PDF
- [ ] Print invoice
- [ ] Email invoice (future)

### PDF Generation
- [ ] Professional invoice template
- [ ] Company logo and details
- [ ] Customer information
- [ ] Line items table
- [ ] Totals breakdown
- [ ] Payment information
- [ ] Terms and conditions

### Stock Deduction
- [ ] Automatic deduction on invoice creation
- [ ] Validation: prevent overselling
- [ ] Stock restoration on invoice deletion
- [ ] Stock adjustment on invoice edit
- [ ] Transaction logging

### API Endpoints
- [ ] GET /api/invoices
- [ ] GET /api/invoices/:id
- [ ] POST /api/invoices (with stock deduction)
- [ ] PUT /api/invoices/:id
- [ ] DELETE /api/invoices/:id (with stock restoration)
- [ ] PATCH /api/invoices/:id/payment
- [ ] GET /api/invoices/:id/pdf

## 5. Customer Management

### Customer Listing
- [ ] Display all customers in a table
- [ ] Search by name, email, phone
- [ ] Sort by name, purchases, date
- [ ] Pagination
- [ ] Total purchases indicator

### Customer Details
- [ ] View customer information
- [ ] Purchase history
- [ ] Total purchases amount
- [ ] Invoice list
- [ ] Edit customer
- [ ] Delete customer

### Add/Edit Customer
- [ ] Customer form with validation
- [ ] Fields: name, email, phone, address, city, state, country
- [ ] Notes field
- [ ] Quick add from invoice creation

### API Endpoints
- [ ] GET /api/customers
- [ ] GET /api/customers/:id
- [ ] POST /api/customers
- [ ] PUT /api/customers/:id
- [ ] DELETE /api/customers/:id
- [ ] GET /api/customers/:id/invoices

## 6. Reports & Analytics

### Sales Reports
- [ ] Date range selector
- [ ] Total sales
- [ ] Total revenue
- [ ] Average order value
- [ ] Sales by category
- [ ] Sales by product
- [ ] Export to CSV/PDF

### Payment Reports
- [ ] Outstanding invoices
- [ ] Paid invoices
- [ ] Partial payments
- [ ] Payment methods breakdown
- [ ] Export reports

### Inventory Reports
- [ ] Current stock levels
- [ ] Low stock products
- [ ] Out of stock products
- [ ] Stock value
- [ ] Inventory turnover
- [ ] Export reports

### Customer Reports
- [ ] Top customers
- [ ] Customer purchases
- [ ] Customer segments
- [ ] Export reports

### API Endpoints
- [ ] GET /api/reports/sales
- [ ] GET /api/reports/payments
- [ ] GET /api/reports/inventory
- [ ] GET /api/reports/customers

## 7. Settings

### User Profile
- [ ] View profile
- [ ] Edit profile
- [ ] Change password
- [ ] Profile picture (future)

### User Management (Admin only)
- [ ] List all users
- [ ] Add new user
- [ ] Edit user
- [ ] Deactivate user
- [ ] Change user role

### System Settings (Admin only)
- [ ] Company information
- [ ] Invoice settings (tax rate, currency)
- [ ] Low stock threshold (global)
- [ ] Invoice number format
- [ ] Terms and conditions

### API Endpoints
- [ ] GET /api/users/profile
- [ ] PUT /api/users/profile
- [ ] PUT /api/users/password
- [ ] GET /api/users (admin)
- [ ] POST /api/users (admin)
- [ ] PUT /api/users/:id (admin)
- [ ] GET /api/settings (admin)
- [ ] PUT /api/settings (admin)

## 8. Notifications

### Low Stock Alerts
- [ ] Display low stock badge
- [ ] Low stock notification center
- [ ] Email notifications (future)
- [ ] SMS notifications (future)

### System Notifications
- [ ] Success messages
- [ ] Error messages
- [ ] Warning messages
- [ ] Info messages

## 9. UI/UX Features

### Navigation
- [ ] Responsive sidebar
- [ ] Top navigation bar
- [ ] Breadcrumbs
- [ ] Mobile menu

### Components
- [ ] Reusable button components
- [ ] Form input components
- [ ] Modal dialogs
- [ ] Confirmation dialogs
- [ ] Loading spinners
- [ ] Data tables
- [ ] Pagination component
- [ ] Search component
- [ ] Filter component
- [ ] Badge component
- [ ] Card component

### Responsive Design
- [ ] Mobile-friendly layouts
- [ ] Tablet-friendly layouts
- [ ] Desktop layouts
- [ ] Touch-friendly controls

## 10. Security Features

### Implementation Status
- [x] Password hashing (bcrypt)
- [x] JWT authentication
- [x] Auth middleware
- [x] Role-based access
- [x] Security headers (helmet)
- [x] CORS configuration
- [ ] Input validation (express-validator)
- [ ] SQL injection prevention
- [ ] XSS prevention
- [ ] CSRF protection (future)
- [ ] Rate limiting (future)

## Implementation Priority

### Phase 1: Core Features (MVP)
1. Authentication (login/register)
2. Product management (CRUD)
3. Basic dashboard
4. Invoice creation with stock deduction
5. Customer management (basic)

### Phase 2: Enhanced Features
1. Advanced dashboard with charts
2. Payment tracking
3. PDF generation
4. Reports
5. Low stock alerts

### Phase 3: Additional Features
1. User management
2. Settings
3. Advanced reports
4. Email notifications
5. CSV import/export

### Phase 4: Future Enhancements
1. Mobile app
2. Barcode scanning
3. SMS notifications
4. Multi-location support
5. Purchase orders
6. Supplier management

## Testing Checklist

- [ ] Unit tests for API endpoints
- [ ] Integration tests
- [ ] Frontend component tests
- [ ] E2E tests
- [ ] Security testing
- [ ] Performance testing
- [ ] Browser compatibility testing
- [ ] Mobile responsiveness testing

---

**Note**: This is a living document and will be updated as features are implemented and requirements change.

