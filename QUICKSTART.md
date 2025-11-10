# Quick Start Guide

Get the Macworld Inventory System up and running in 5 minutes!

## Prerequisites Check

```bash
# Check Node.js version (need v18+)
node --version

# Check PostgreSQL (need v12+)
psql --version

# Check npm
npm --version
```

If any are missing, see [SETUP_GUIDE.md](SETUP_GUIDE.md) for installation instructions.

## 5-Minute Setup

### 1. Database (2 minutes)

```bash
# Create database
createdb macworld_inventory

# Load schema
cd database
psql -U postgres -d macworld_inventory -f schema.sql

# Load sample data (optional but recommended)
psql -U postgres -d macworld_inventory -f seed.sql

cd ..
```

### 2. Backend (1 minute)

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp env.example .env

# Edit .env with your PostgreSQL password
# nano .env  # or use any text editor

# The server.js is ready but not started yet
# You'll need to uncomment the app.listen() lines to start it

cd ..
```

**Important**: Update `DB_PASSWORD` in the `.env` file!

### 3. Frontend (1 minute)

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

### 4. Start Backend (1 minute)

Open a new terminal:

```bash
cd backend

# First, edit server.js and uncomment these lines at the bottom:
# app.listen(PORT, () => {
#   console.log(`Server is running on port ${PORT}`)
#   console.log(`Environment: ${process.env.NODE_ENV || 'development'}`)
# })

# Then start the server
npm run dev
```

## Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Health Check**: http://localhost:5000/api/health

## Test with Sample Data

If you loaded the seed data, you can use these credentials (once auth is implemented):

- **Admin**: admin@macworld.com / password123
- **Staff**: staff@macworld.com / password123

⚠️ **Note**: Change these in production!

## Project Structure at a Glance

```
macworld-inventory-app/
├── frontend/          # React app (port 3000)
├── backend/           # Express API (port 5000)
└── database/          # SQL scripts
```

## Common Commands

### Backend
```bash
cd backend
npm run dev          # Start with auto-reload
npm start            # Start production mode
```

### Frontend
```bash
cd frontend
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
```

### Database
```bash
# Backup
pg_dump macworld_inventory > backup.sql

# Restore
psql macworld_inventory < backup.sql

# Reset database
psql -d macworld_inventory -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
psql -d macworld_inventory -f database/schema.sql
psql -d macworld_inventory -f database/seed.sql
```

## Verify Everything Works

1. **Backend Health Check**
   ```bash
   curl http://localhost:5000/api/health
   ```
   Should return: `{"status":"OK","message":"Macworld Inventory API is running",...}`

2. **Frontend Loads**
   Open http://localhost:3000 in your browser
   Should see: "Macworld Inventory System"

3. **Database Connected**
   Check backend terminal for: "Connected to PostgreSQL database"

## Next Steps

Now that your setup is complete:

1. **Explore the code structure** → See [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)
2. **Understand the features** → See [FEATURES.md](FEATURES.md)
3. **Start developing** → Follow Phase 2 in FEATURES.md (Authentication)

## Troubleshooting

### "Cannot connect to database"
- Ensure PostgreSQL is running: `pg_isready`
- Check credentials in `backend/.env`
- Verify database exists: `psql -l | grep macworld`

### "Port already in use"
```bash
# Find process using port 5000 or 3000
lsof -i :5000
lsof -i :3000

# Kill the process
kill -9 <PID>
```

### "Module not found"
```bash
# Clear npm cache and reinstall
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

### Backend not responding
- Check if server.js has `app.listen()` uncommented
- Check backend terminal for errors
- Verify .env file exists with correct values

## Development Tips

1. **Keep two terminals open**: one for frontend, one for backend
2. **Use nodemon**: Backend auto-restarts on file changes
3. **Use Vite HMR**: Frontend updates instantly without refresh
4. **Check browser console**: For frontend errors
5. **Check terminal**: For backend errors

## Quick Reference

| What | Where | Port |
|------|-------|------|
| Frontend | http://localhost:3000 | 3000 |
| Backend API | http://localhost:5000/api | 5000 |
| Database | localhost | 5432 |

## Need More Help?

- 📖 Detailed setup → [SETUP_GUIDE.md](SETUP_GUIDE.md)
- 🏗️ Project structure → [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)
- ✨ Features list → [FEATURES.md](FEATURES.md)
- 📚 Main docs → [README.md](README.md)
- 🗄️ Database docs → [database/README.md](database/README.md)

---

**Ready to build something amazing! 🚀**

