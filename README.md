# Macworld Inventory and Invoicing System

A modern, full-stack inventory management and invoicing system built for Macworld, a gadget store in Wuse 2, Abuja, Nigeria.

## 🚀 Features

- **Inventory Management**: Add, edit, delete products and track stock levels in real-time
- **Invoice Generation**: Create professional invoices with automatic stock deduction
- **Sales Tracking**: Comprehensive sales reports and revenue analytics
- **Customer Management**: Maintain detailed customer records and purchase history
- **Dashboard Analytics**: Visual charts and key performance indicators
- **Low Stock Alerts**: Automatic notifications when products run low
- **PDF Generation**: Export and print professional invoices
- **Payment Tracking**: Monitor payment status (paid, unpaid, partial)
- **User Authentication**: Secure JWT-based authentication with role-based access control
- **Responsive Design**: Mobile-friendly interface built with Tailwind CSS

## 🛠️ Tech Stack

### Frontend
- **React.js** - UI library
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client
- **jsPDF** - PDF generation
- **Recharts** - Data visualization
- **Vite** - Build tool and dev server

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **PostgreSQL** - Relational database
- **JWT** - Authentication tokens
- **Bcrypt** - Password hashing
- **Helmet** - Security middleware
- **CORS** - Cross-origin resource sharing

## 📁 Project Structure

```
macworld-inventory-app/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Page components
│   │   ├── context/         # React context (AuthContext, etc.)
│   │   ├── hooks/           # Custom React hooks
│   │   ├── utils/           # Utility functions and API client
│   │   ├── App.jsx          # Main app component
│   │   ├── main.jsx         # Entry point
│   │   └── index.css        # Global styles
│   ├── index.html           # HTML template
│   ├── package.json         # Frontend dependencies
│   ├── vite.config.js       # Vite configuration
│   └── tailwind.config.js   # Tailwind CSS configuration
│
├── backend/                  # Node.js backend API
│   ├── config/              # Configuration files (database, etc.)
│   ├── controllers/         # Business logic and request handlers
│   ├── routes/              # API route definitions
│   ├── middleware/          # Custom middleware (auth, validation)
│   ├── utils/               # Utility functions (JWT, password hashing)
│   ├── server.js            # Server entry point
│   ├── package.json         # Backend dependencies
│   └── env.example          # Environment variables template
│
└── database/                 # Database scripts
    ├── schema.sql           # Database schema (tables, indexes, views)
    └── seed.sql             # Sample data for testing
```

## 🚦 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### Database Setup

1. Create a PostgreSQL database:
```bash
createdb macworld_inventory
```

2. Run the schema script:
```bash
psql -d macworld_inventory -f database/schema.sql
```

3. (Optional) Load sample data:
```bash
psql -d macworld_inventory -f database/seed.sql
```

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file from template:
```bash
cp env.example .env
```

4. Update `.env` with your configuration:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=macworld_inventory
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your_secret_key
```

5. Start the development server:
```bash
npm run dev
```

The API will be available at `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## 🔐 Security Features

- **Password Hashing**: All passwords are hashed using bcrypt with salt rounds
- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access**: Admin and staff roles with different permissions
- **Input Validation**: Server-side validation using express-validator
- **Security Headers**: Helmet middleware for setting security headers
- **CORS Protection**: Configured CORS to allow only specified origins

## 📊 Database Schema

### Main Tables

- **users**: User accounts with authentication
- **products**: Product inventory with stock tracking
- **customers**: Customer information and purchase history
- **invoices**: Invoice headers with payment information
- **invoice_items**: Individual line items for each invoice

### Key Features

- Automatic timestamp tracking (created_at, updated_at)
- Foreign key constraints for data integrity
- Indexes for optimized query performance
- Views for common queries (low_stock_products, invoice_summary)
- Triggers for automatic timestamp updates

## 🔄 Invoice Number Format

Invoices are automatically numbered in the format: `INV-YYYY-MM-NNNN`

Example: `INV-2024-01-0001`

## 📱 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Products
- `GET /api/products` - List all products
- `GET /api/products/:id` - Get product details
- `POST /api/products` - Create new product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Invoices
- `GET /api/invoices` - List all invoices
- `GET /api/invoices/:id` - Get invoice details
- `POST /api/invoices` - Create new invoice (auto-deducts stock)
- `PUT /api/invoices/:id` - Update invoice
- `DELETE /api/invoices/:id` - Delete invoice

### Customers
- `GET /api/customers` - List all customers
- `GET /api/customers/:id` - Get customer details
- `POST /api/customers` - Create new customer
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/recent-sales` - Get recent sales
- `GET /api/dashboard/low-stock` - Get low stock products

## 🎨 UI Components

The application uses a custom design system built with Tailwind CSS:

- **Buttons**: Primary, secondary, danger variants
- **Forms**: Validated input fields with error messages
- **Cards**: Product cards, invoice cards, stat cards
- **Tables**: Sortable, paginated data tables
- **Charts**: Line charts, bar charts, pie charts
- **Modals**: Confirmation dialogs, forms
- **Alerts**: Success, error, warning, info messages

## 🧪 Testing

Sample data is provided in `database/seed.sql` for testing purposes.

Default test credentials:
- Admin: `admin@macworld.com` / `password123`
- Staff: `staff@macworld.com` / `password123`

⚠️ **Note**: Change these credentials in production!

## 📝 Development Notes

### Stock Management
- Stock is automatically deducted when invoices are created
- The system prevents selling more than available stock
- Low stock alerts are triggered based on the threshold set for each product

### Payment Tracking
- Payment status: `paid`, `unpaid`, `partial`
- Invoice status: `draft`, `sent`, `paid`, `cancelled`
- Amount paid can be less than total for partial payments

### User Roles
- **Admin**: Full access to all features
- **Staff**: Limited access (cannot delete records or manage users)

## 🚀 Production Deployment

1. Set `NODE_ENV=production` in backend `.env`
2. Update `JWT_SECRET` with a strong random key
3. Configure PostgreSQL for production
4. Build frontend: `npm run build`
5. Serve frontend static files
6. Use a process manager like PM2 for the backend
7. Set up SSL/TLS certificates
8. Configure firewall and security groups

## 📄 License

This project is proprietary software developed for Macworld.

## 👥 Support

For support and questions, please contact the development team.

---

**Macworld** - Wuse 2, Abuja, Nigeria

