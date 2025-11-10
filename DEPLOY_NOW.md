# 🚀 Deploy to Vercel - Step by Step

## ✅ Pre-Deployment Checklist

- [x] Build works (✅ Verified - build successful!)
- [ ] Vercel CLI installed
- [ ] Supabase credentials ready
- [ ] Git repository (optional but recommended)

---

## 📋 Step 1: Install Vercel CLI

Open your terminal and run:

```bash
npm install -g vercel
```

**If you get permission errors, use:**
```bash
sudo npm install -g vercel
```

Or install locally (no sudo needed):
```bash
cd frontend
npm install vercel --save-dev
npx vercel
```

---

## 📋 Step 2: Get Your Supabase Credentials

1. Go to your **Supabase Dashboard**: https://supabase.com/dashboard
2. Select your project
3. Go to **Settings** → **API**
4. Copy these values:
   - **Project URL** (this is your `VITE_SUPABASE_URL`)
   - **anon public** key (this is your `VITE_SUPABASE_ANON_KEY`)

**Keep these handy - you'll need them in Step 4!**

---

## 📋 Step 3: Navigate to Frontend Folder

```bash
cd /Users/hitler/Documents/macworld-inventory-app/frontend
```

---

## 📋 Step 4: Login to Vercel

```bash
vercel login
```

This will:
- Open your browser
- Ask you to login (use GitHub, Google, or email)
- Authorize Vercel CLI

---

## 📋 Step 5: Deploy Your App

```bash
vercel
```

**Answer the prompts:**
- Set up and deploy? → **Yes**
- Which scope? → **Your account**
- Link to existing project? → **No** (first time)
- Project name? → **macworld-inventory** (or press Enter for default)
- Directory? → **./** (current directory - press Enter)
- Override settings? → **No**

This will create a **preview deployment** first.

---

## 📋 Step 6: Add Environment Variables

You need to add your Supabase credentials:

```bash
vercel env add VITE_SUPABASE_URL
```
- When prompted, paste your **Supabase URL**
- Select environment: **Production, Preview, Development** (or just Production)

```bash
vercel env add VITE_SUPABASE_ANON_KEY
```
- When prompted, paste your **Supabase anon key**
- Select environment: **Production, Preview, Development** (or just Production)

---

## 📋 Step 7: Deploy to Production

```bash
vercel --prod
```

This will deploy your app to production!

---

## 🎉 Done!

Your app will be live at: `https://your-project-name.vercel.app`

---

## 🔄 Alternative: Deploy via Vercel Dashboard (Easier!)

If you prefer a visual interface:

1. **Go to [vercel.com](https://vercel.com)**
2. **Sign up/Login** (use GitHub - easiest)
3. **Click "Add New Project"**
4. **Import your Git repository** (if you have one)
   - Or drag and drop your `frontend` folder
5. **Configure:**
   - Framework Preset: **Vite**
   - Root Directory: **frontend** (if deploying from root)
   - Build Command: `npm run build`
   - Output Directory: `dist`
6. **Add Environment Variables:**
   - Click "Environment Variables"
   - Add `VITE_SUPABASE_URL` = your Supabase URL
   - Add `VITE_SUPABASE_ANON_KEY` = your Supabase anon key
7. **Click "Deploy"**

---

## 🐛 Troubleshooting

### "vercel: command not found"
- Install Vercel CLI: `npm install -g vercel`
- Or use: `npx vercel` (no installation needed)

### "Permission denied"
- Use: `sudo npm install -g vercel`
- Or install locally: `npm install vercel --save-dev` then `npx vercel`

### Build fails
- Make sure you're in the `frontend` folder
- Check Node.js version: `node --version` (should be 16+)
- Try: `npm install` then `npm run build`

### Environment variables not working
- Make sure they start with `VITE_`
- Redeploy after adding: `vercel --prod`
- Check in Vercel Dashboard → Settings → Environment Variables

---

## 📞 Need Help?

1. Check Vercel Dashboard for deployment logs
2. Check browser console (F12) for errors
3. Verify Supabase credentials are correct
4. Make sure Supabase project is active

---

## ✅ Quick Command Summary

```bash
# Install Vercel CLI
npm install -g vercel

# Navigate to frontend
cd frontend

# Login
vercel login

# Deploy
vercel

# Add environment variables
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY

# Deploy to production
vercel --prod
```

**That's it! Your app will be live! 🎉**

