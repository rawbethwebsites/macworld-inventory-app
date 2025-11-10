# Project Structure Overview

## Complete File Tree

```
macworld-inventory-app/
│
├── README.md                          # Main project documentation
├── SETUP_GUIDE.md                     # Detailed setup instructions
├── FEATURES.md                        # Feature specifications and checklist
├── PROJECT_STRUCTURE.md              # This file
├── .gitignore                        # Root gitignore
│
├── frontend/                         # React Frontend Application
│   ├── public/                       # Static assets (to be added)
│   ├── src/
│   │   ├── components/              # Reusable UI components
│   │   │   └── .gitkeep
│   │   ├── pages/                   # Page components (routes)
│   │   │   └── .gitkeep
│   │   ├── context/                 # React Context providers
│   │   │   └── AuthContext.jsx     # Authentication context
│   │   ├── hooks/                   # Custom React hooks
│   │   │   └── useAuth.js          # Authentication hook
│   │   ├── utils/                   # Utility functions
│   │   │   ├── api.js              # Axios API client
│   │   │   └── formatters.js       # Currency, date formatters
│   │   ├── App.jsx                  # Main app component
│   │   ├── main.jsx                 # React entry point
│   │   └── index.css                # Global styles with Tailwind
│   ├── index.html                    # HTML template
│   ├── package.json                  # Frontend dependencies
│   ├── vite.config.js               # Vite configuration
│   ├── tailwind.config.js           # Tailwind CSS configuration
│   ├── postcss.config.js            # PostCSS configuration
│   ├── .eslintrc.cjs                # ESLint configuration
│   ├── env.example                  # Environment variables template
│   └── .gitignore                   # Frontend gitignore
│
├── backend/                          # Node.js Backend API
│   ├── config/
│   │   └── database.js              # PostgreSQL connection pool
│   ├── controllers/                 # Business logic (to be created)
│   │   └── .gitkeep
│   ├── routes/                      # API route definitions (to be created)
│   │   └── .gitkeep
│   ├── middleware/
│   │   ├── authMiddleware.js       # JWT authentication
│   │   └── validationMiddleware.js  # Request validation
│   ├── utils/
│   │   ├── jwtUtils.js             # JWT token generation/verification
│   │   └── passwordUtils.js        # Password hashing/comparison
│   ├── server.js                    # Express server entry point
│   ├── package.json                 # Backend dependencies
│   ├── env.example                  # Environment variables template
│   └── .gitignore                   # Backend gitignore
│
└── database/                         # Database Scripts
    ├── schema.sql                   # Complete database schema
    ├── seed.sql                     # Sample data for testing
    └── README.md                    # Database documentation
```

## File Descriptions

### Root Level Files

| File | Description |
|------|-------------|
| `README.md` | Main project overview, tech stack, setup instructions |
| `SETUP_GUIDE.md` | Detailed step-by-step setup guide for developers |
| `FEATURES.md` | Feature specifications, implementation checklist, roadmap |
| `PROJECT_STRUCTURE.md` | This file - complete project structure reference |
| `.gitignore` | Git ignore patterns for the entire project |

### Frontend Files (React + Vite + Tailwind)

#### Configuration Files
| File | Purpose |
|------|---------|
| `package.json` | Dependencies: react, react-router-dom, axios, jspdf, recharts, tailwindcss |
| `vite.config.js` | Vite build tool configuration with proxy to backend |
| `tailwind.config.js` | Tailwind CSS theme customization |
| `postcss.config.js` | PostCSS plugins for Tailwind |
| `.eslintrc.cjs` | ESLint rules for React |
| `env.example` | Template for environment variables |

#### Source Files
| File/Directory | Purpose |
|----------------|---------|
| `index.html` | Single-page application HTML template |
| `src/main.jsx` | React application entry point |
| `src/App.jsx` | Main app component with routing |
| `src/index.css` | Global styles with Tailwind directives and custom utilities |
| `src/context/AuthContext.jsx` | Authentication state management |
| `src/hooks/useAuth.js` | Custom hook for using auth context |
| `src/utils/api.js` | Axios instance with interceptors |
| `src/utils/formatters.js` | Currency, date, invoice number formatters |
| `src/components/` | Reusable UI components (to be created) |
| `src/pages/` | Page components for routes (to be created) |

### Backend Files (Node.js + Express + PostgreSQL)

#### Configuration Files
| File | Purpose |
|------|---------|
| `package.json` | Dependencies: express, pg, bcrypt, jsonwebtoken, cors, dotenv, helmet |
| `env.example` | Template for environment variables (DB, JWT, etc.) |

#### Source Files
| File/Directory | Purpose |
|----------------|---------|
| `server.js` | Express server setup with middleware and routes |
| `config/database.js` | PostgreSQL connection pool and query helper |
| `middleware/authMiddleware.js` | JWT verification and role-based access control |
| `middleware/validationMiddleware.js` | Request validation error handler |
| `utils/jwtUtils.js` | JWT token generation and verification |
| `utils/passwordUtils.js` | Bcrypt password hashing and comparison |
| `routes/` | API route handlers (to be created) |
| `controllers/` | Business logic and database operations (to be created) |

### Database Files (PostgreSQL)

| File | Purpose |
|------|---------|
| `schema.sql` | Complete database schema with tables, indexes, views, triggers |
| `seed.sql` | Sample data for testing (users, products, customers, invoices) |
| `README.md` | Database documentation, queries, maintenance guide |

## Database Schema Summary

### Tables
1. **users** - User accounts with authentication
2. **products** - Product inventory with stock tracking
3. **customers** - Customer information and purchase history
4. **invoices** - Invoice headers with payment information
5. **invoice_items** - Line items for each invoice

### Views
1. **low_stock_products** - Products at or below stock threshold
2. **invoice_summary** - Invoice summaries with item counts

### Key Features
- Automatic timestamp tracking (created_at, updated_at)
- Foreign key constraints for data integrity
- Indexes for query optimization
- Triggers for automatic updates
- Check constraints for data validation

## Technology Stack

### Frontend Stack
```json
{
  "framework": "React 18.2",
  "routing": "React Router 6.20",
  "styling": "Tailwind CSS 3.3",
  "build": "Vite 5.0",
  "http": "Axios 1.6",
  "pdf": "jsPDF 2.5",
  "charts": "Recharts 2.10"
}
```

### Backend Stack
```json
{
  "runtime": "Node.js 18+",
  "framework": "Express 4.18",
  "database": "PostgreSQL 12+",
  "dbClient": "node-postgres (pg) 8.11",
  "auth": "jsonwebtoken 9.0",
  "password": "bcrypt 5.1",
  "security": "helmet 7.1",
  "cors": "cors 2.8"
}
```

## Environment Variables

### Backend (.env)
```env
NODE_ENV=development
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=macworld_inventory
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d
BCRYPT_ROUNDS=10
ALLOWED_ORIGINS=http://localhost:3000
DEFAULT_PAGE_SIZE=20
MAX_PAGE_SIZE=100
LOW_STOCK_THRESHOLD=10
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=Macworld Inventory System
VITE_APP_VERSION=1.0.0
```

## API Endpoints (To Be Implemented)

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Products
- `GET /api/products` - List products (with pagination, search, filter)
- `GET /api/products/:id` - Get product details
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Invoices
- `GET /api/invoices` - List invoices
- `GET /api/invoices/:id` - Get invoice details
- `POST /api/invoices` - Create invoice (auto-deducts stock)
- `PUT /api/invoices/:id` - Update invoice
- `DELETE /api/invoices/:id` - Delete invoice (restores stock)

### Customers
- `GET /api/customers` - List customers
- `GET /api/customers/:id` - Get customer details
- `POST /api/customers` - Create customer
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/sales-trend` - Sales trend data
- `GET /api/dashboard/top-products` - Top selling products

## Development Workflow

1. **Start PostgreSQL Database**
   ```bash
   # Ensure PostgreSQL is running
   brew services start postgresql  # macOS
   ```

2. **Start Backend Server**
   ```bash
   cd backend
   npm install  # First time only
   npm run dev  # Uses nodemon
   # Runs on http://localhost:5000
   ```

3. **Start Frontend Dev Server**
   ```bash
   cd frontend
   npm install  # First time only
   npm run dev  # Uses Vite
   # Runs on http://localhost:3000
   ```

## Next Steps for Development

### Phase 1: Core Setup ✅ COMPLETED
- [x] Create project structure
- [x] Set up frontend with React + Vite
- [x] Set up backend with Express
- [x] Create database schema
- [x] Add sample seed data
- [x] Create documentation

### Phase 2: Authentication (Next)
- [ ] Create auth routes and controllers
- [ ] Build login/register pages
- [ ] Implement JWT authentication
- [ ] Add protected routes
- [ ] Create user profile page

### Phase 3: Product Management
- [ ] Create product routes and controllers
- [ ] Build product listing page
- [ ] Build product form (add/edit)
- [ ] Implement search and filters
- [ ] Add image upload support

### Phase 4: Invoice System
- [ ] Create invoice routes and controllers
- [ ] Build invoice creation form
- [ ] Implement stock validation
- [ ] Add automatic stock deduction
- [ ] Build invoice listing page
- [ ] Implement PDF generation

### Phase 5: Dashboard & Analytics
- [ ] Create dashboard API endpoints
- [ ] Build dashboard page
- [ ] Implement charts with Recharts
- [ ] Add statistics cards
- [ ] Create sales reports

### Phase 6: Polish & Deploy
- [ ] Add error handling
- [ ] Implement loading states
- [ ] Add notifications/toasts
- [ ] Optimize performance
- [ ] Production deployment

## Key Features to Implement

1. **Automatic Stock Deduction** ⚠️ CRITICAL
   - Stock must be deducted when invoice is created
   - Prevent overselling (validation)
   - Stock restored on invoice deletion

2. **Invoice Number Generation**
   - Format: INV-YYYY-MM-0001
   - Auto-increment per month
   - Unique constraint in database

3. **Low Stock Alerts**
   - Compare quantity with threshold
   - Display badges/notifications
   - Dashboard alert count

4. **Payment Tracking**
   - Status: paid, unpaid, partial
   - Amount paid vs total
   - Payment method tracking

5. **PDF Generation**
   - Professional invoice template
   - Company branding
   - Print-friendly format

## Testing Data

Sample credentials (from seed.sql):
- Admin: `admin@macworld.com` / `password123`
- Staff: `staff@macworld.com` / `password123`

Sample data includes:
- 22 products across multiple categories
- 8 customers with contact information
- 4 invoices with varying payment statuses
- Invoice items with proper calculations

## Security Considerations

- ✅ Password hashing with bcrypt
- ✅ JWT token authentication
- ✅ Role-based access control
- ✅ Security headers with Helmet
- ✅ CORS configuration
- ⏳ Input validation (to be implemented)
- ⏳ SQL injection prevention (parameterized queries)
- ⏳ XSS prevention
- ⏳ Rate limiting (future)

## Production Checklist

- [ ] Change JWT_SECRET to strong random value
- [ ] Update default passwords
- [ ] Set NODE_ENV=production
- [ ] Enable SSL/TLS
- [ ] Set up database backups
- [ ] Configure firewall
- [ ] Set up monitoring
- [ ] Configure logging
- [ ] Optimize images
- [ ] Minify and bundle code
- [ ] Set up CDN (optional)

---

**Project Status**: ✅ Structure Complete - Ready for Development

**Next Action**: Implement authentication system (Phase 2)

