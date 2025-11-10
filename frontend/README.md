# Macworld Inventory App - Frontend

A modern React-based inventory management system for Macworld, built with Vite, React, Tailwind CSS, and Supabase.

## 🚀 Features

- ✅ **User Authentication** - Secure login and registration with Supabase
- ✅ **Inventory Management** - Complete CRUD operations
- ✅ **Real-time Updates** - Live data synchronization
- ✅ **Search & Filter** - Fast search with debouncing
- ✅ **Responsive Design** - Mobile-friendly UI with Tailwind CSS
- ✅ **Modern Stack** - React 18, Vite, and latest libraries

## 🛠️ Tech Stack

- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Backend**: Supabase (Authentication & Database)
- **Routing**: React Router v6
- **Charts**: Recharts
- **PDF Generation**: jsPDF
- **HTTP Client**: Axios

## 📋 Prerequisites

- Node.js 16+ and npm
- Supabase account and project

## 🔧 Installation

1. **Clone the repository** (if not already done)
   ```bash
   cd /Users/hitler/Documents/macworld-inventory-app/frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   VITE_API_URL=http://localhost:5000/api
   VITE_APP_NAME=Macworld Inventory System
   VITE_APP_VERSION=1.0.0
   
   # Supabase Configuration
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:5173`

## 🗄️ Supabase Integration

This project uses Supabase for authentication and database operations. 

### 📚 Complete Supabase Documentation

For detailed information about the Supabase integration, see:

- **[SUPABASE_INDEX.md](./SUPABASE_INDEX.md)** - 📚 Complete documentation index
- **[README_SUPABASE.md](./README_SUPABASE.md)** - ⭐ Comprehensive overview (start here!)
- **[GETTING_STARTED_CHECKLIST.md](./GETTING_STARTED_CHECKLIST.md)** - ✅ Setup checklist
- **[HOOKS_GUIDE.md](./HOOKS_GUIDE.md)** - 🎣 Custom hooks guide
- **[QUICK_REFERENCE.md](./QUICK_REFERENCE.md)** - 📓 Quick reference
- **[MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)** - 🔄 Migration from old system

### Quick Start with Supabase

1. **Set up your Supabase project**: Follow [GETTING_STARTED_CHECKLIST.md](./GETTING_STARTED_CHECKLIST.md)
2. **Learn the basics**: Read [README_SUPABASE.md](./README_SUPABASE.md)
3. **Use custom hooks**: Check [HOOKS_GUIDE.md](./HOOKS_GUIDE.md)

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/        # React components
│   │   ├── AuthExample.jsx        # Authentication example
│   │   └── InventoryExample.jsx   # Inventory CRUD example
│   ├── context/          # React contexts
│   │   └── AuthContext.jsx        # Authentication context (Supabase)
│   ├── hooks/            # Custom React hooks
│   │   ├── useAuth.js             # Auth hook
│   │   └── useSupabase.js         # Supabase hooks
│   ├── pages/            # Page components
│   ├── utils/            # Utility functions
│   │   ├── api.js                 # API client
│   │   ├── formatters.js          # Data formatters
│   │   ├── supabase.js            # Supabase client
│   │   └── supabaseDb.js          # Database helpers
│   ├── App.jsx           # Main app component
│   ├── main.jsx          # Entry point
│   └── index.css         # Global styles
├── public/               # Static assets
├── .env                  # Environment variables (not in git)
├── env.example           # Environment variables template
├── vite.config.js        # Vite configuration
├── tailwind.config.js    # Tailwind configuration
└── package.json          # Dependencies
```

## 🎯 Available Scripts

```bash
# Development
npm run dev              # Start dev server on http://localhost:5173

# Production
npm run build            # Build for production
npm run preview          # Preview production build

# Code Quality
npm run lint             # Run ESLint
```

## 🔑 Authentication

The app uses Supabase for authentication. Example usage:

```javascript
import { useContext } from 'react'
import { AuthContext } from './context/AuthContext'

function MyComponent() {
  const { user, login, logout, register, isAuthenticated } = useContext(AuthContext)
  
  const handleLogin = async () => {
    const result = await login(email, password)
    if (result.success) {
      // Logged in!
    }
  }
}
```

For more details, see [README_SUPABASE.md](./README_SUPABASE.md)

## 🗃️ Database Operations

Use custom hooks for easy database operations:

```javascript
import { useInventory } from './hooks/useSupabase'

function InventoryList() {
  const { items, loading, addItem, updateItem, deleteItem } = useInventory()
  
  // Items automatically update in real-time!
}
```

For more details, see [HOOKS_GUIDE.md](./HOOKS_GUIDE.md)

## 🎨 Styling

This project uses Tailwind CSS for styling. The configuration is in `tailwind.config.js`.

Example usage:
```jsx
<div className="bg-blue-500 text-white p-4 rounded-lg">
  Hello World
</div>
```

## 🔒 Environment Variables

All environment variables must be prefixed with `VITE_` to be accessible in the app.

```javascript
// Access in code
const apiUrl = import.meta.env.VITE_API_URL
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
```

## 📦 Building for Production

1. **Build the app**
   ```bash
   npm run build
   ```

2. **Preview the build**
   ```bash
   npm run preview
   ```

3. **Deploy**
   - The `dist/` folder contains the production build
   - Deploy to your preferred hosting service (Vercel, Netlify, etc.)

## 🐛 Troubleshooting

### Common Issues

**Issue**: "Missing Supabase credentials"
- **Solution**: Check that `.env` file exists and restart dev server

**Issue**: Authentication not working
- **Solution**: Verify Supabase URL and keys are correct
- Check email settings in Supabase dashboard

**Issue**: Database queries failing
- **Solution**: Check Row Level Security policies in Supabase
- Ensure user is authenticated

For more troubleshooting, see [QUICK_REFERENCE.md - Common Issues](./QUICK_REFERENCE.md#common-issues)

## 📚 Documentation

### Supabase Integration
- [SUPABASE_INDEX.md](./SUPABASE_INDEX.md) - Documentation index
- [README_SUPABASE.md](./README_SUPABASE.md) - Complete overview
- [GETTING_STARTED_CHECKLIST.md](./GETTING_STARTED_CHECKLIST.md) - Setup checklist
- [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) - Detailed documentation
- [HOOKS_GUIDE.md](./HOOKS_GUIDE.md) - Custom hooks guide
- [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) - Quick reference
- [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) - Migration guide
- [SETUP_SUMMARY.md](./SETUP_SUMMARY.md) - Setup summary

### Example Components
- [src/components/AuthExample.jsx](./src/components/AuthExample.jsx) - Authentication UI
- [src/components/InventoryExample.jsx](./src/components/InventoryExample.jsx) - CRUD operations

## 🔗 Useful Links

- **Supabase Project**: https://app.supabase.com/project/ngluohuaitkwqhrsysnk
- **Supabase Docs**: https://supabase.com/docs
- **React Docs**: https://react.dev
- **Vite Docs**: https://vitejs.dev
- **Tailwind CSS**: https://tailwindcss.com

## 🤝 Contributing

1. Make sure all tests pass
2. Follow the existing code style
3. Update documentation if needed
4. Create clear commit messages

## 📝 License

[Add your license here]

## 👥 Team

Macworld Inventory Team

---

## 🚀 Quick Start Summary

```bash
# 1. Install dependencies
npm install

# 2. Set up .env file with Supabase credentials
# (See env.example)

# 3. Follow Supabase setup
# Read: GETTING_STARTED_CHECKLIST.md

# 4. Start dev server
npm run dev

# 5. Build for production
npm run build
```

## 📞 Support

- Check documentation in this directory
- Review [SUPABASE_INDEX.md](./SUPABASE_INDEX.md) for guides
- Visit Supabase dashboard for logs and settings
- Check browser console for errors

---

**Last Updated**: November 10, 2025

**Status**: ✅ Supabase Integration Complete

