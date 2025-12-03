# 🚀 CryptoFlash - Complete Setup Guide

Welcome to CryptoFlash! This guide will help you set up your own cryptocurrency tracking platform in under 30 minutes.

## 📋 What You'll Need

- Node.js 18+ installed ([Download here](https://nodejs.org/))
- A Firebase account (free tier is perfect!)
- A Render.com account (free tier works great!)
- Basic command line knowledge

---

## 🎯 Quick Start (5 Steps)

### Step 1: Extract & Install Dependencies
```bash
# Extract the ZIP file
# Open terminal in the project folder

# Install dependencies
npm install


Step 2: Set Up Firebase
Go to Firebase Console: https://console.firebase.google.com/

Click "Create a project"

Enter project name (e.g., "my-crypto-tracker")

Disable Google Analytics (optional)

Click "Create Project"

Enable Authentication:
Click "Authentication" in left sidebar

Click "Get Started"

Click "Email/Password" → Enable it → Save

Get Your Config:
Click ⚙️ Settings → Project settings

Scroll to "Your apps" section

Click Web icon (</> ) → Register app

Copy the firebaseConfig values

Step 3: Configure Environment Variables
Copy the example file:

bash
cp .env.example .env
Open .env file and paste your Firebase credentials:

env
VITE_FIREBASE_API_KEY=AIza...your_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
VITE_FIREBASE_MEASUREMENT_ID=G-ABC123
Set Admin UID (do this AFTER creating your account in Step 4)

Step 4: Create Your Admin Account
bash
# Start development server
npm run dev
Open: http://localhost:5173

Click "Get Started" or "Sign Up"

Create your admin account with email/password

Go to Firebase Console → Authentication → Users

Copy your User UID (long string like nPIAdCY...)

Paste it in .env:

env
VITE_ADMIN_UID=nPIAdCYivzflUvIZO1PST0UJPIx1
Step 5: Test Locally
bash
# Restart the server (Ctrl+C, then npm run dev)
npm run dev
Go to: http://localhost:5173/admin/login

Log in with your admin account

You should see the admin dashboard! ✅

🌐 Deploy to Production (Render.com)
Step 1: Push to GitHub
bash
# Initialize git (if not done)
git init
git add .
git commit -m "Initial commit"

# Create GitHub repo and push
git remote add origin https://github.com/yourusername/your-repo.git
git branch -M main
git push -u origin main
Step 2: Deploy on Render
Go to: https://dashboard.render.com/

Sign up/Login with GitHub

Click "New +" → "Static Site"

Connect your GitHub repository

Configure:

Name: my-crypto-tracker

Build Command: npm run build

Publish Directory: dist

Click "Advanced" → Add Environment Variables:

Add all 8 variables from your .env file:

VITE_FIREBASE_API_KEY

VITE_FIREBASE_AUTH_DOMAIN

VITE_FIREBASE_PROJECT_ID

VITE_FIREBASE_STORAGE_BUCKET

VITE_FIREBASE_MESSAGING_SENDER_ID

VITE_FIREBASE_APP_ID

VITE_FIREBASE_MEASUREMENT_ID

VITE_ADMIN_UID

Click "Create Static Site"

Step 3: Configure Redirects
After deployment, go to "Redirects/Rewrites" tab

Add rule:

Source: /*

Destination: /index.html

Action: Rewrite

Save

Step 4: Add Domain to Firebase
Copy your Render URL (e.g., your-app.onrender.com)

Go to Firebase Console → Authentication → Settings

Scroll to "Authorized domains"

Click "Add domain"

Paste your Render URL (without https://)

Save

Step 5: Test Live Site
Go to your Render URL

Log in with your admin account

Access /admin - should work! 🎉

🎨 Customization Guide
Change Branding
Update site title & meta:

Edit index.html - change title, description

Replace logo in src/components/Navbar.tsx

Update colors:

Edit tailwind.config.js for theme colors

Modify gradient classes in components

Add Your Payment Gateway
For Stripe/PayPal:

Get API keys from your payment provider

Add to .env:

env
VITE_STRIPE_PUBLIC_KEY=pk_test_...
Update src/lib/stripe.ts (or create it)

🆘 Troubleshooting
Admin route redirects to login
Check: Admin UID matches your user UID in Firebase

Check: Environment variables are set in Render

Fix: Clear browser cache, hard refresh (Ctrl+Shift+R)

Firebase errors on deployed site
Check: Render domain is added to Firebase authorized domains

Check: All environment variables are set correctly in Render

Fix: Redeploy with "Clear build cache"

"Cannot find module" errors
Fix: Delete node_modules and run npm install again

Build fails on Render
Check: package.json has all dependencies

Fix: Run npm run build locally first to test

📧 Support
Need help? Contact: your-email@example.com

🎉 You're All Set!
Enjoy your crypto tracking platform! Don't forget to:

⭐ Star the project if you found it useful

📣 Share with friends

💬 Leave a review

Happy tracking! 🚀