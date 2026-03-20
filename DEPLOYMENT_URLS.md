# 🌐 Deployment URLs & Configuration

## Current Local Development
- **Frontend:** http://localhost:5173
- **Backend:** http://localhost:5000
- **Admin Email:** karantiwari062@gmail.com
- **Admin Password:** Karantiwari292929

---

## Production Deployment (After completion)

### Frontend (Vercel) - To be updated after deployment
```
URL: https://nagrik-news.vercel.app
GitHub: https://github.com/YOUR_USERNAME/nagrik-news
Vercel Dashboard: https://vercel.com/dashboard
```

### Backend (Render) - To be updated after deployment
```
URL: https://nagrik-news-backend.onrender.com
Render Dashboard: https://dashboard.render.com
```

### Database (MongoDB Atlas) - To be created
```
Cluster: nagrik-news
Database: nagrik_news
Collections: users, feedback, news
Connection String: mongodb+srv://user:pass@cluster.mongodb.net/nagrik_news
Atlas Dashboard: https://cloud.mongodb.com
```

---

## 📝 Quick Setup for Production

### Step 1: Create GitHub Repository
```bash
cd your-project-folder
git init
git add .
git commit -m "initial commit"
git push -u origin main
```

### Step 2: Deploy Frontend to Vercel
1. Go to vercel.com/new
2. Import your GitHub repository
3. Set environment variable: `VITE_API_BASE_URL=https://nagrik-news-backend.onrender.com`
4. Deploy

### Step 3: Deploy Backend to Render
1. Go to render.com/dashboard
2. New Web Service → Connect GitHub repo
3. Set Name: `nagrik-news-backend`
4. Set Environment Variables:
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `JWT_SECRET`: Strong random key
   - `EMAIL_USER`: Your email
   - `EMAIL_PASS`: Your password
   - `CORS_ORIGIN`: Your Vercel frontend URL
5. Deploy

### Step 4: Update Frontend with Backend URL
Once Render deployment is complete, update Vercel environment variables with the Render URL

---

## 🧪 Testing Production URLs

### Admin Panel Login
1. Go to https://nagrik-news.vercel.app
2. Click "Admin Panel"
3. Login with provided credentials

### API Endpoints (Backend)
```
GET  /api/news/feed
GET  /api/news/trending
GET  /api/news/search?q=query
POST /api/auth/login
POST /api/auth/register
POST /api/auth/feedback
GET  /api/auth/feedback/all
GET  /api/auth/users/all
GET  /api/auth/users/stats
```

---

## 🔧 Configuration Files

### Frontend Configuration
- `frontend/vercel.json` - Vercel deployment config
- `frontend/.env.local` - Local development env
- `frontend/.env.production` - Production env (Vercel)
- `frontend/src/config/api.js` - Centralized API base URL

### Backend Configuration
- `backend/package.json` - Node.js scripts
- `backend/.env` - Local development env
- `backend/.env.production` - Production env (Render)
- `backend/render.yaml` - Render infrastructure config

---

## 📞 Support URLs

- **Vercel Docs:** https://vercel.com/docs
- **Render Docs:** https://render.com/docs
- **MongoDB Atlas:** https://docs.atlas.mongodb.com
- **Express.js:** https://expressjs.com
- **React:** https://react.dev

---

## ⚠️ Important Reminders

1. **Never commit sensitive data** - Always use environment variables
2. **Update CORS_ORIGIN** to match your frontend URL
3. **Use strong JWT_SECRET** - Generate with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
4. **Backup MongoDB** - Enable automated backups on MongoDB Atlas
5. **Monitor costs** - Free tiers are limited, upgrade as needed
6. **Set up error tracking** - Consider Sentry or similar for production monitoring

---

Last Updated: March 2026
