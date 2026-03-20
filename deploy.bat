@echo off
REM ============================================
REM NAGRIK NEWS - ONE-CLICK DEPLOYMENT SCRIPT
REM ============================================
REM यह script आपके application को deploy करने के लिए सब कुछ करेगा

setlocal enabledelayedexpansion

echo.
echo ======================================
echo NAGRIK NEWS - DEPLOYMENT WIZARD
echo ======================================
echo.

REM Step 1: Git Setup
echo [STEP 1/4] Git Repository Setup...
git --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Git installed nahi hai! https://git-scm.com se download karo
    pause
    exit /b 1
)

REM Initialize git if not already done
if not exist ".git" (
    echo Initializing Git Repository...
    git init
    git config user.email "karantiwari062@gmail.com"
    git config user.name "Nagrik News Admin"
)

REM Step 2: Add and commit
echo.
echo [STEP 2/4] Committing code to Git...
git add .
git commit -m "Nagrik News - Ready for production deployment"

REM Step 3: GitHub instructions
echo.
echo [STEP 3/4] GitHub Setup Instructions...
echo.
echo ===== GITHUB SETUP (Do this in browser) =====
echo 1. Go to https://github.com/new
echo 2. Create new repository named: "nagrik-news"
echo 3. Select "Public" (for free)
echo 4. Click "Create Repository"
echo 5. Copy the HTTPS URL from: git remote add origin https://github.com/YOUR_USERNAME/nagrik-news.git
echo.
pause

REM Get GitHub URL from user
set /p GITHUB_URL="Enter your GitHub https URL (from step 5 above): "

REM Add remote and push
git remote remove origin >nul 2>&1
git remote add origin %GITHUB_URL%
git branch -M main
git push -u origin main

if errorlevel 1 (
    echo ERROR: Git push failed. Check your GitHub URL.
    pause
    exit /b 1
)

echo.
echo ✅ Code pushed to GitHub successfully!
echo.

REM Step 4: Display deployment instructions
echo.
echo [STEP 4/4] DEPLOYMENT INSTRUCTIONS FOR YOU
echo.
echo ======================================
echo NEXT STEPS (Copy-paste in your browser):
echo ======================================
echo.
echo 1. RENDER BACKEND DEPLOYMENT:
echo    → Go to: https://render.com/dashboard
echo    → Click "New" → "Web Service"
echo    → Connect to GitHub: %GITHUB_URL%
echo    → Name: nagrik-news-backend
echo    → Build Command: npm install
echo    → Start Command: npm start
echo    → Root Directory: backend
echo.
echo    Environment Variables (Add these):
echo    • NODE_ENV = production
echo    • MONGODB_URI = mongodb+srv://user:pass@cluster.mongodb.net/nagrik_news
echo    • JWT_SECRET = (strong random key)
echo    • EMAIL_USER = karantiwari062@gmail.com
echo    • EMAIL_PASS = Karantiwari292929
echo    • CORS_ORIGIN = (your-vercel-url - add after step 2)
echo.
echo 2. VERCEL FRONTEND DEPLOYMENT:
echo    → Go to: https://vercel.com/dashboard
echo    → Click "Add New" → "Project"
echo    → Import: %GITHUB_URL%
echo    → Framework: Vite
echo    → Root Directory: frontend
echo.
echo    Environment Variable:
echo    • VITE_API_BASE_URL = (your-render-backend-url)
echo.
echo 3. MongoDB Atlas (Database):
echo    → Go to: https://www.mongodb.com/cloud/atlas
echo    → Create cluster "nagrik-news"
echo    → Get connection string
echo    → Use in Render MONGODB_URI
echo.
echo ======================================
echo.
echo 📺 YouTube Link (If you need visual guide):
echo    Search: "Deploy Node.js to Render + React to Vercel"
echo.
pause

echo.
echo ✅ DEPLOYMENT SETUP COMPLETE!
echo.
echo Your code is on GitHub. Now just follow the 3 browser steps above.
echo Total time: ~20 minutes
echo.
pause
