# Macworld Inventory System - Setup Guide

This guide will walk you through setting up the Macworld Inventory and Invoicing System from scratch.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** v18 or higher ([Download](https://nodejs.org/))
- **PostgreSQL** v12 or higher ([Download](https://www.postgresql.org/download/))
- **npm** (comes with Node.js)
- A code editor (VS Code recommended)
- Git (optional, for version control)

## Step-by-Step Setup

### Step 1: Database Setup

1. **Start PostgreSQL service**
   ```bash
   # On macOS with Homebrew
   brew services start postgresql
   
   # On Ubuntu/Debian
   sudo systemctl start postgresql
   
   # On Windows
   # Use the PostgreSQL application or Windows Services
   ```

2. **Create the database**
   ```bash
   # Using createdb command
   createdb macworld_inventory
   
   # OR using psql
   psql -U postgres
   CREATE DATABASE macworld_inventory;
   \q
   ```

3. **Run the schema script**
   ```bash
   cd database
   psql -U postgres -d macworld_inventory -f schema.sql
   ```

4. **Load sample data (optional but recommended for testing)**
   ```bash
   psql -U postgres -d macworld_inventory -f seed.sql
   ```

5. **Verify the setup**
   ```bash
   psql -U postgres -d macworld_inventory
   \dt  # List all tables
   SELECT COUNT(*) FROM products;  # Should show 22 products if seed data loaded
   \q
   ```

### Step 2: Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd ../backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```
   
   This will install:
   - express
   - pg (PostgreSQL client)
   - bcrypt
   - jsonwebtoken
   - cors
   - dotenv
   - helmet
   - express-validator
   - nodemon (dev dependency)

3. **Create environment file**
   ```bash
   cp env.example .env
   ```

4. **Edit .env file with your configuration**
   ```env
   NODE_ENV=development
   PORT=5000
   
   # Update these with your PostgreSQL credentials
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=macworld_inventory
   DB_USER=postgres
   DB_PASSWORD=your_actual_password
   
   # Generate a strong secret key (use a password generator)
   JWT_SECRET=your_very_secure_random_secret_key_here
   JWT_EXPIRE=7d
   
   BCRYPT_ROUNDS=10
   ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
   DEFAULT_PAGE_SIZE=20
   MAX_PAGE_SIZE=100
   LOW_STOCK_THRESHOLD=10
   ```

5. **Test the backend connection**
   ```bash
   # The server.js is set up but not started yet
   # You can uncomment the app.listen() lines in server.js to start it
   ```

### Step 3: Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd ../frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```
   
   This will install:
   - react & react-dom
   - react-router-dom
   - axios
   - tailwindcss
   - jspdf
   - recharts
   - vite
   - Other dev dependencies

3. **Create environment file (optional)**
   ```bash
   cp .env.example .env
   ```
   
   Default values should work, but you can customize:
   ```env
   VITE_API_URL=http://localhost:5000/api
   VITE_APP_NAME=Macworld Inventory System
   VITE_APP_VERSION=1.0.0
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```
   
   The frontend will start at http://localhost:3000

### Step 4: Start the Backend Server

1. **In a new terminal, navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Uncomment the server start code in server.js**
   
   Open `server.js` and uncomment these lines at the bottom:
   ```javascript
   app.listen(PORT, () => {
     console.log(`Server is running on port ${PORT}`)
     console.log(`Environment: ${process.env.NODE_ENV || 'development'}`)
   })
   ```

3. **Start the backend server**
   ```bash
   npm run dev
   ```
   
   The API will start at http://localhost:5000

### Step 5: Verify Everything Works

1. **Check backend health**
   
   Open your browser or use curl:
   ```bash
   curl http://localhost:5000/api/health
   ```
   
   Should return:
   ```json
   {
     "status": "OK",
     "message": "Macworld Inventory API is running",
     "timestamp": "2024-01-01T00:00:00.000Z"
   }
   ```

2. **Open the frontend**
   
   Visit http://localhost:3000 in your browser
   
   You should see the Macworld Inventory System welcome page

3. **Test login (if seed data loaded)**
   
   Once authentication pages are built, you can login with:
   - Email: `admin@macworld.com`
   - Password: `password123`

## Common Issues and Solutions

### Issue: Cannot connect to PostgreSQL

**Solution:**
- Ensure PostgreSQL is running: `pg_isready`
- Check your DB credentials in `.env`
- Verify the database exists: `psql -l`

### Issue: Port already in use

**Solution:**
```bash
# Find process using the port
lsof -i :5000  # or :3000

# Kill the process
kill -9 <PID>

# Or change the port in .env (backend) or vite.config.js (frontend)
```

### Issue: npm install fails

**Solution:**
- Clear npm cache: `npm cache clean --force`
- Delete node_modules and package-lock.json
- Run `npm install` again
- Ensure you're using Node.js v18+: `node --version`

### Issue: Module not found errors

**Solution:**
- Make sure you're in the correct directory (frontend or backend)
- Run `npm install` again
- Check that all imports use the correct paths

## Next Steps

After setup is complete, you'll need to:

1. **Create API Routes and Controllers** in the backend:
   - Authentication routes
   - Product CRUD routes
   - Invoice management routes
   - Customer management routes
   - Dashboard statistics routes

2. **Build Frontend Pages**:
   - Login/Register pages
   - Dashboard with charts
   - Products listing and management
   - Invoice creation and management
   - Customer management
   - Reports and analytics

3. **Implement Features**:
   - Authentication flow
   - Product inventory management
   - Invoice generation with PDF export
   - Stock auto-deduction
   - Payment tracking
   - Low stock alerts

## Development Workflow

1. **Backend Development**
   ```bash
   cd backend
   npm run dev  # Uses nodemon for auto-restart
   ```

2. **Frontend Development**
   ```bash
   cd frontend
   npm run dev  # Uses Vite with hot reload
   ```

3. **Database Changes**
   - Update schema.sql
   - Drop and recreate database
   - Run schema.sql again
   - Run seed.sql for test data

## Production Deployment

See README.md for production deployment instructions.

## Support

If you encounter issues not covered here, please:
1. Check the main README.md
2. Review database/README.md for database-specific issues
3. Check console logs for error messages
4. Contact the development team

---

**Happy Coding! 🚀**

