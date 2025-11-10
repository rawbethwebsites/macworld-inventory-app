# 🚀 Deployment Guide - Macworld Inventory App

This guide covers deploying your Macworld inventory management system online.

## 📋 Prerequisites

- ✅ Your app is working locally
- ✅ Supabase project is set up and working
- ✅ Git repository (GitHub, GitLab, or Bitbucket)
- ✅ Environment variables ready

---

## 🎯 Deployment Options

Since you're using **Supabase** for database and authentication, you mainly need to deploy the **frontend**. The backend (Express) is optional.

### **Recommended: Frontend Only (Easiest)**
- ✅ Vercel (Recommended - Easiest)
- ✅ Netlify
- ✅ Cloudflare Pages
- ✅ GitHub Pages

### **Full Stack (If you need the Express backend)**
- ✅ Railway
- ✅ Render
- ✅ DigitalOcean App Platform

---

## 🌟 Option 1: Vercel (Recommended - Easiest)

Vercel is the easiest way to deploy React/Vite apps.

### Step 1: Prepare Your Project

1. **Ensure your `.env` file has the correct variables:**
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

2. **Create `vercel.json` in the frontend folder:**
   ```json
   {
     "buildCommand": "npm run build",
     "outputDirectory": "dist",
     "devCommand": "npm run dev",
     "installCommand": "npm install",
     "framework": "vite"
   }
   ```

### Step 2: Deploy to Vercel

**Option A: Using Vercel CLI (Recommended)**

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Navigate to frontend folder:**
   ```bash
   cd frontend
   ```

3. **Login to Vercel:**
   ```bash
   vercel login
   ```

4. **Deploy:**
   ```bash
   vercel
   ```

5. **Follow the prompts:**
   - Set up and deploy? **Yes**
   - Which scope? **Your account**
   - Link to existing project? **No**
   - Project name? **macworld-inventory** (or your choice)
   - Directory? **./** (current directory)
   - Override settings? **No**

6. **Add environment variables:**
   ```bash
   vercel env add VITE_SUPABASE_URL
   vercel env add VITE_SUPABASE_ANON_KEY
   ```

7. **Redeploy with environment variables:**
   ```bash
   vercel --prod
   ```

**Option B: Using Vercel Dashboard (Easier)**

1. **Go to [vercel.com](https://vercel.com)**
2. **Sign up/Login** (use GitHub)
3. **Click "Add New Project"**
4. **Import your Git repository**
5. **Configure:**
   - Framework Preset: **Vite**
   - Root Directory: **frontend**
   - Build Command: `npm run build`
   - Output Directory: `dist`
6. **Add Environment Variables:**
   - `VITE_SUPABASE_URL` = your Supabase URL
   - `VITE_SUPABASE_ANON_KEY` = your Supabase anon key
7. **Click "Deploy"**

### Step 3: Access Your App

- Your app will be live at: `https://your-project-name.vercel.app`
- Vercel automatically provides HTTPS
- Custom domain can be added later

---

## 🌐 Option 2: Netlify

### Step 1: Prepare Your Project

1. **Create `netlify.toml` in the frontend folder:**
   ```toml
   [build]
     command = "npm run build"
     publish = "dist"

   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```

### Step 2: Deploy to Netlify

**Option A: Using Netlify CLI**

1. **Install Netlify CLI:**
   ```bash
   npm install -g netlify-cli
   ```

2. **Navigate to frontend folder:**
   ```bash
   cd frontend
   ```

3. **Login:**
   ```bash
   netlify login
   ```

4. **Deploy:**
   ```bash
   netlify deploy --prod
   ```

5. **Add environment variables:**
   ```bash
   netlify env:set VITE_SUPABASE_URL "your_supabase_url"
   netlify env:set VITE_SUPABASE_ANON_KEY "your_supabase_anon_key"
   ```

**Option B: Using Netlify Dashboard**

1. **Go to [netlify.com](https://netlify.com)**
2. **Sign up/Login** (use GitHub)
3. **Click "Add new site" → "Import an existing project"**
4. **Connect your Git repository**
5. **Configure:**
   - Base directory: **frontend**
   - Build command: `npm run build`
   - Publish directory: `frontend/dist`
6. **Add Environment Variables:**
   - Site settings → Environment variables
   - Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
7. **Deploy**

---

## ☁️ Option 3: Cloudflare Pages

### Step 1: Deploy

1. **Go to [dash.cloudflare.com](https://dash.cloudflare.com)**
2. **Pages → Create a project**
3. **Connect Git repository**
4. **Configure:**
   - Project name: **macworld-inventory**
   - Production branch: **main** (or **master**)
   - Framework preset: **Vite**
   - Build command: `npm run build`
   - Build output directory: `dist`
5. **Add Environment Variables:**
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
6. **Save and Deploy**

---

## 🚂 Option 4: Railway (Full Stack)

If you want to deploy both frontend and backend:

### Step 1: Prepare Backend

1. **Create `railway.json` in backend folder:**
   ```json
   {
     "$schema": "https://railway.app/railway.schema.json",
     "build": {
       "builder": "NIXPACKS"
     },
     "deploy": {
       "startCommand": "node server.js",
       "restartPolicyType": "ON_FAILURE",
       "restartPolicyMaxRetries": 10
     }
   }
   ```

2. **Update backend `server.js` to use environment variables:**
   ```javascript
   const PORT = process.env.PORT || 3000;
   ```

### Step 2: Deploy to Railway

1. **Go to [railway.app](https://railway.app)**
2. **Sign up/Login** (use GitHub)
3. **New Project → Deploy from GitHub repo**
4. **Add Service → Frontend:**
   - Root directory: `frontend`
   - Build command: `npm run build`
   - Start command: `npm run preview` (or use a static file server)
5. **Add Service → Backend (optional):**
   - Root directory: `backend`
   - Start command: `node server.js`
6. **Add Environment Variables** for both services
7. **Deploy**

---

## 🔧 Environment Variables Setup

For all platforms, you need to add these environment variables:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

**Where to find these:**
1. Go to your Supabase Dashboard
2. Settings → API
3. Copy the URL and anon/public key

---

## 📝 Pre-Deployment Checklist

Before deploying, make sure:

- [ ] `.env` file has correct Supabase credentials
- [ ] App works locally (`npm run dev`)
- [ ] Build works locally (`npm run build`)
- [ ] All environment variables are ready
- [ ] Git repository is up to date
- [ ] No sensitive data in code (use env variables)

---

## 🎯 Recommended Deployment Flow

### For Quick Deployment (Frontend Only):

1. **Use Vercel** (easiest and fastest)
2. **Connect GitHub repository**
3. **Add environment variables**
4. **Deploy**

### For Production (Full Stack):

1. **Frontend:** Deploy to Vercel/Netlify
2. **Backend:** Deploy to Railway/Render (if needed)
3. **Database:** Already on Supabase ✅
4. **Storage:** Already on Supabase ✅

---

## 🔒 Security Checklist

- [ ] Environment variables are set (not hardcoded)
- [ ] Supabase RLS policies are configured
- [ ] API keys are not exposed in client code
- [ ] HTTPS is enabled (automatic on most platforms)
- [ ] CORS is properly configured in Supabase

---

## 🌍 Custom Domain Setup

### Vercel:
1. Go to Project Settings → Domains
2. Add your domain
3. Follow DNS configuration instructions

### Netlify:
1. Go to Site Settings → Domain Management
2. Add custom domain
3. Configure DNS

---

## 🐛 Troubleshooting

### Build Fails:
- Check Node.js version (should be 16+)
- Check all dependencies are in `package.json`
- Check for TypeScript errors

### Environment Variables Not Working:
- Make sure variables start with `VITE_` for Vite
- Redeploy after adding environment variables
- Check variable names match exactly

### CORS Errors:
- Update Supabase Dashboard → Settings → API
- Add your deployment URL to allowed origins

### App Not Loading:
- Check browser console for errors
- Verify Supabase URL and keys are correct
- Check network tab for failed requests

---

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Netlify Documentation](https://docs.netlify.com)
- [Supabase Documentation](https://supabase.com/docs)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)

---

## ✅ Quick Start (Vercel - 5 Minutes)

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Go to frontend folder
cd frontend

# 3. Login
vercel login

# 4. Deploy
vercel

# 5. Add environment variables
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY

# 6. Deploy to production
vercel --prod
```

**Done! Your app is live! 🎉**

---

## 💡 Pro Tips

1. **Use Vercel** for the easiest deployment experience
2. **Enable automatic deployments** from your main branch
3. **Set up preview deployments** for pull requests
4. **Monitor your app** using the platform's analytics
5. **Set up custom domain** for a professional look
6. **Enable HTTPS** (automatic on most platforms)

---

## 🆘 Need Help?

If you encounter issues:
1. Check the platform's documentation
2. Check browser console for errors
3. Verify environment variables are set correctly
4. Check Supabase dashboard for API issues
5. Review build logs in deployment platform

---

**Good luck with your deployment! 🚀**

