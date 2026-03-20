# 🚀 Nagrik News - Deployment Guide (Vercel + Render)

## 📋 Overview
- **Frontend:** React + Vite → Vercel
- **Backend:** Express.js + MongoDB → Render
- **Database:** MongoDB Atlas (Cloud) or Local MongoDB

---

## 🔧 Prerequisites
1. GitHub account (for version control)
2. Vercel account (https://vercel.com) - Sign up with GitHub
3. Render account (https://render.com) - Sign up with GitHub
4. MongoDB Atlas account (https://www.mongodb.com/cloud/atlas) - for cloud database
5. Code pushed to GitHub repository

---

## 📦 Step 1: Prepare MongoDB (Cloud Database)

### Create MongoDB Atlas Account
1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up with your email or GitHub
3. Create a new project called "nagrik-news"
4. Create a cluster (choose Free tier for development)
5. Wait for cluster to be created (5-10 minutes)
6. Click "Connect" → "Build a Connection String"
7. Copy the connection string: `mongodb+srv://<username>:<password>@cluster.mongodb.net/nagrik_news`
8. Save this somewhere safe - you'll need it for Render

---

## 🎨 Step 2: Deploy Frontend to Vercel

### 2.1 Push Code to GitHub
```bash
cd c:\Users\karan\OneDrive\Desktop\NAGRIK_NEWS
git init
git add .
git commit -m "Initial commit - Nagrik News"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/nagrik-news.git
git push -u origin main
```

### 2.2 Deploy on Vercel
1. Go to https://vercel.com/dashboard
2. Click "New Project"
3. Select your "nagrik-news" repository from GitHub
4. Choose "React" as framework
5. **Build Command:** `npm run build`
6. **Output Directory:** `dist`
7. Click "Environment Variables" and add:
   - **Name:** `VITE_API_BASE_URL`
   - **Value:** `https://nagrik-news-backend.onrender.com` (you'll update this after Render deployment)
8. Click "Deploy"
9. Wait for deployment to complete (2-3 minutes)
10. You'll get a URL like: `https://nagrik-news.vercel.app`
11. Copy this URL - you'll need it for Render CORS settings

---

## 🖥️ Step 3: Deploy Backend to Render

### 3.1 Create render.yaml (or use Web Service UI)

**Option A: Using Render UI (Easier)**
1. Go to https://render.com/dashboard
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Fill in details:
   - **Name:** `nagrik-news-backend`
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** Free (for testing)
5. Click "Advanced" and add Environment Variables:
   - `NODE_ENV` = `production`
   - `MONGODB_URI` = Paste your MongoDB Atlas connection string
   - `JWT_SECRET` = Create a strong secret key (example: `super-secret-key-xyz123!@#`)
   - `EMAIL_USER` = `karantiwari062@gmail.com`
   - `EMAIL_PASS` = `Karantiwari292929`
   - `CORS_ORIGIN` = `https://nagrik-news.vercel.app` (your Vercel URL)
6. Click "Create Web Service"
7. Wait for deployment (5-10 minutes)
8. You'll get a URL like: `https://nagrik-news-backend.onrender.com`

**Option B: Using render.yaml (Advanced)**
Create `render.yaml` in backend root:
```yaml
services:
  - type: web
    name: nagrik-news-backend
    env: node
    plan: free
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: MONGODB_URI
        value: mongodb+srv://username:password@cluster.mongodb.net/nagrik_news
      - key: JWT_SECRET
        value: your-secret-key
      - key: EMAIL_USER
        value: karantiwari062@gmail.com
      - key: EMAIL_PASS
        value: Karantiwari292929
      - key: CORS_ORIGIN
        value: https://nagrik-news.vercel.app
```

---

## 🔄 Step 4: Update Frontend with Backend URL

1. Go to Vercel Dashboard
2. Select your "nagrik-news" project
3. Go to Settings → Environment Variables
4. Update `VITE_API_BASE_URL` to your Render backend URL
   - Example: `https://nagrik-news-backend.onrender.com`
5. Redeploy: Click "Deployments" → "Redeploy" on latest deployment

---

## ✅ Step 5: Test Deployment

### Frontend (Vercel)
```
https://nagrik-news.vercel.app
```

### Admin Panel
1. Go to your Vercel URL
2. Click on Admin Panel / CMSDashboard
3. Login with:
   - Email: `karantiwari062@gmail.com`
   - Password: `Karantiwari292929`

### Test Features
- [ ] Login works
- [ ] Can view users stats
- [ ] Can view feedback
- [ ] Can create new articles
- [ ] Search functionality works
- [ ] Dark mode works

---

## 🔐 Important Notes

### Security
1. **JWT_SECRET:** Change this to a strong random key
   ```bash
   # Generate a strong secret in Node REPL
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

2. **Email Credentials:** Consider using environment-specific credentials
   - For production, create a separate Gmail account or use a service like SendGrid

3. **MongoDB:**
   - Don't commit `mongodb://127.0.0.1:27017` in production
   - Always use MongoDB Atlas or another cloud database
   - Enable IP whitelist on MongoDB Atlas

4. **CORS:**
   - Only allow your Vercel domain
   - Update when you change frontend hosting

### MongoDB Atlas Setup
1. Create IP whitelist entry: Click "Security" → "Network Access"
2. Add IP: `0.0.0.0/0` (for Render) or use Render's IP
3. Get connection string with your username/password

---

## 📊 Environment Variables Summary

### Frontend (.env.production)
```
VITE_API_BASE_URL=https://nagrik-news-backend.onrender.com
```

### Backend (Render Environment Variables)
```
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/nagrik_news
JWT_SECRET=your-strong-secret-key
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
CORS_ORIGIN=https://nagrik-news.vercel.app
```

---

## 🐛 Troubleshooting

### Frontend not connecting to backend
- Check CORS is enabled on backend
- Verify `VITE_API_BASE_URL` matches Render backend URL
- Check browser console for CORS errors

### MongoDB connection fails
- Verify connection string in `.env`
- Check IP whitelist on MongoDB Atlas
- Ensure database name matches: `nagrik_news`

### Admin login not working
- Check email/password in backend `.env`
- Verify MongoDB is connected
- Check backend logs on Render dashboard

### Free tier limitations
- **Vercel:** 100GB bandwidth/month (usually enough)
- **Render:** Free tier spins down after 15 minutes of inactivity (first request will be slow)
- **MongoDB Atlas:** 512MB storage free (upgrade if needed)

---

## 🚀 Deployment Checklist
- [ ] GitHub repository created and code pushed
- [ ] MongoDB Atlas account created with connection string
- [ ] Frontend deployed on Vercel
- [ ] Backend deployed on Render
- [ ] Environment variables configured on both platforms
- [ ] Admin panel tested and working
- [ ] All routes and API calls verified
- [ ] Dark mode and UI features tested

---

## 📈 Next Steps
1. Monitor performance on Render/Vercel dashboards
2. Set up auto-deployments (push to main = auto deploy)
3. Configure custom domain (optional)
4. Set up monitoring/alerts
5. Plan database scaling if needed

---

**Questions?** Check Vercel docs (vercel.com/docs) or Render docs (render.com/docs)
