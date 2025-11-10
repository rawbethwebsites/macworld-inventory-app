#!/bin/bash

# Macworld Inventory App - Vercel Deployment Script
# This script helps you deploy to Vercel

echo "═══════════════════════════════════════════════════════════════"
echo "🚀 Macworld Inventory - Vercel Deployment"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Check if we're in the right directory
if [ ! -d "frontend" ]; then
    echo "❌ Error: frontend directory not found!"
    echo "Please run this script from the project root directory."
    exit 1
fi

cd frontend

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
    echo ""
fi

echo "✅ Vercel CLI is ready!"
echo ""
echo "📋 Next Steps:"
echo ""
echo "1. Login to Vercel:"
echo "   vercel login"
echo ""
echo "2. Deploy your app:"
echo "   vercel"
echo ""
echo "3. Add environment variables:"
echo "   vercel env add VITE_SUPABASE_URL"
echo "   vercel env add VITE_SUPABASE_ANON_KEY"
echo ""
echo "4. Deploy to production:"
echo "   vercel --prod"
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Ask if user wants to proceed
read -p "Do you want to start deployment now? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🔐 Step 1: Logging in to Vercel..."
    vercel login
    
    echo ""
    echo "🚀 Step 2: Deploying to Vercel..."
    vercel
    
    echo ""
    echo "📝 Step 3: Adding environment variables..."
    echo "You'll need to enter your Supabase credentials:"
    echo ""
    vercel env add VITE_SUPABASE_URL
    vercel env add VITE_SUPABASE_ANON_KEY
    
    echo ""
    echo "🌐 Step 4: Deploying to production..."
    vercel --prod
    
    echo ""
    echo "✅ Deployment complete!"
    echo "Your app should be live now!"
else
    echo "Deployment cancelled. Run this script again when ready."
fi

