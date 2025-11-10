# ⚡ Quick Deployment Guide

## 🚀 Fastest Way: Vercel (5 Minutes)

### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

### Step 2: Navigate to Frontend
```bash
cd frontend
```

### Step 3: Login & Deploy
```bash
vercel login
vercel
```

### Step 4: Add Environment Variables
```bash
vercel env add VITE_SUPABASE_URL
# Paste your Supabase URL when prompted

vercel env add VITE_SUPABASE_ANON_KEY
# Paste your Supabase anon key when prompted
```

### Step 5: Deploy to Production
```bash
vercel --prod
```

**Done! Your app is live! 🎉**

---

## 🌐 Alternative: Netlify (5 Minutes)

### Step 1: Install Netlify CLI
```bash
npm install -g netlify-cli
```

### Step 2: Navigate to Frontend
```bash
cd frontend
```

### Step 3: Login & Deploy
```bash
netlify login
netlify deploy --prod
```

### Step 4: Add Environment Variables
Go to Netlify Dashboard → Site Settings → Environment Variables

Add:
- `VITE_SUPABASE_URL` = your Supabase URL
- `VITE_SUPABASE_ANON_KEY` = your Supabase anon key

Then redeploy.

---

## 📋 What You Need

1. **Supabase URL:** From Supabase Dashboard → Settings → API
2. **Supabase Anon Key:** From Supabase Dashboard → Settings → API

---

## ✅ After Deployment

1. Your app will be live at: `https://your-project-name.vercel.app`
2. Test login functionality
3. Test all features
4. Share the link!

---

## 🔧 Troubleshooting

**Build fails?**
- Make sure you're in the `frontend` folder
- Check Node.js version: `node --version` (should be 16+)

**Environment variables not working?**
- Make sure they start with `VITE_`
- Redeploy after adding variables

**App not loading?**
- Check browser console (F12)
- Verify Supabase URL and keys are correct

---

**For detailed guide, see `DEPLOYMENT_GUIDE.md`**

