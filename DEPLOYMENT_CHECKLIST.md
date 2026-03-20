# ✅ Deployment Setup - Summary of Changes

## 📝 Files Created for Deployment

### Frontend Configuration
1. **`frontend/src/config/api.js`** - NEW
   - Centralized API base URL configuration
   - Reads from `VITE_API_BASE_URL` environment variable
   - Defaults to `http://localhost:5000` for local development

2. **`frontend/.env.local`** - NEW
   - Local development environment variables
   - `VITE_API_BASE_URL=http://localhost:5000`

3. **`frontend/.env.production`** - NEW
   - Production environment variables for Vercel
   - `VITE_API_BASE_URL=https://nagrik-news-backend.onrender.com`
   - Update this URL after Render deployment

4. **`frontend/vercel.json`** - NEW
   - Vercel deployment configuration
   - Specifies build command and output directory
   - Defines environment variables for Vercel

### Backend Configuration
1. **`backend/.env.production`** - NEW
   - Production environment variables for Render
   - Contains MongoDB URI, JWT secret, email credentials
   - Update with your actual values before deployment

2. **`backend/render.yaml`** - NEW
   - Render infrastructure-as-code configuration
   - Defines web service, build/start commands, environment variables
   - Optional: Can use Render UI instead

### Documentation Files
1. **`DEPLOYMENT_GUIDE.md`** - NEW
   - Comprehensive step-by-step deployment guide
   - Covers MongoDB Atlas setup, Vercel deployment, Render deployment
   - Includes troubleshooting and security best practices

2. **`DEPLOYMENT_URLS.md`** - NEW
   - Quick reference for all URLs and configurations
   - Configuration file locations and purposes
   - Testing endpoints and support links

---

## 🔄 Files Modified for Deployment

### Backend
1. **`backend/package.json`**
   - Added `"start": "node index.js"` script for Render
   - This is required for Render to know how to start the app

### Frontend
1. **`frontend/src/pages/Home.jsx`**
   - Added import: `import API_BASE_URL from '../config/api';`
   - Updated all API URLs from hardcoded `http://localhost:5000` to dynamic `${API_BASE_URL}`

2. **`frontend/src/pages/Login.jsx`**
   - Updated API calls to use `API_BASE_URL`
   - Changed: `axios.post('http://localhost:5000/api/auth/login', ...)` 
   - To: `axios.post('${API_BASE_URL}/api/auth/login', ...)`

3. **`frontend/src/pages/CMSDashboard.jsx`**
   - Added import: `import API_BASE_URL from '../config/api';`
   - Updated all API endpoints to use dynamic base URL
   - Affects: admin login, articles CRUD, news upload, etc.

4. **`frontend/src/components/FeedbackModal.jsx`**
   - Updated feedback submission to use `API_BASE_URL`

5. **`frontend/src/components/FeedbackViewer.jsx`**
   - Updated feedback and stats fetch calls to use `API_BASE_URL`

6. **`frontend/src/components/TrendingSidebar.jsx`**
   - Updated trending news fetch to use `API_BASE_URL`

7. **`frontend/src/components/UsersViewer.jsx`**
   - Updated user statistics and list fetch to use `API_BASE_URL`

---

## 🎯 What These Changes Enable

### Before (Hardcoded URLs)
```javascript
// ❌ Only works with local backend
const res = await axios.post('http://localhost:5000/api/auth/login', data);
```

### After (Dynamic URLs)
```javascript
// ✅ Works with any backend URL based on environment
const res = await axios.post(`${API_BASE_URL}/api/auth/login`, data);
```

**Benefits:**
- Local development uses `http://localhost:5000`
- Production uses Render backend URL from environment variables
- No code changes needed to switch between environments
- Easy to test with different backends

---

## 🚀 Deployment Process Overview

### 1. Prepare Code
- ✅ All API calls use centralized `API_BASE_URL`
- ✅ Backend has `start` script in package.json
- ✅ Environment variables are configured
- 🔲 Push code to GitHub

### 2. Deploy Backend (Render)
- 🔲 Create Render account
- 🔲 Connect GitHub repository
- 🔲 Set environment variables (MongoDB URI, etc.)
- 🔲 Deploy and note the URL (e.g., `https://nagrik-news-backend.onrender.com`)

### 3. Deploy Frontend (Vercel)
- 🔲 Create Vercel account
- 🔲 Import GitHub repository
- 🔲 Set `VITE_API_BASE_URL` to Render backend URL
- 🔲 Deploy and note the URL (e.g., `https://nagrik-news.vercel.app`)

### 4. Update Backend CORS
- 🔲 Update `CORS_ORIGIN` environment variable on Render with Vercel URL

### 5. Test Production
- 🔲 Visit Vercel frontend URL
- 🔲 Test admin login
- 🔲 Test all features (feedback, users, images, etc.)

---

## 📋 Setup Checklist for Deployment

### GitHub
- [ ] Initialize git repository
- [ ] Add all files
- [ ] Commit changes with message "setup: deployment configuration"
- [ ] Create GitHub repository
- [ ] Push code to GitHub

### MongoDB Atlas
- [ ] Create account at mongodb.com/cloud/atlas
- [ ] Create cluster (nagrik-news)
- [ ] Create database (nagrik_news)
- [ ] Get connection string
- [ ] Add IP whitelist (0.0.0.0/0 for Render)

### Render Backend
- [ ] Create Render account at render.com
- [ ] Create new Web Service
- [ ] Connect GitHub repository
- [ ] Set Name: `nagrik-news-backend`
- [ ] Set Buildcommand: `npm install`
- [ ] Set Start Command: `npm start`
- [ ] Add environment variables:
  - `NODE_ENV=production`
  - `MONGODB_URI=<your-mongodb-connection-string>`
  - `JWT_SECRET=<strong-random-key>`
  - `EMAIL_USER=<your-email>`
  - `EMAIL_PASS=<your-password>`
  - `CORS_ORIGIN=<your-vercel-url>`
- [ ] Deploy
- [ ] Note the URL

### Vercel Frontend
- [ ] Create Vercel account at vercel.com
- [ ] Import GitHub repository
- [ ] Set Project Name: `nagrik-news`
- [ ] Add environment variable:
  - `VITE_API_BASE_URL=<your-render-url>`
- [ ] Deploy

### Final Testing
- [ ] Test admin login on production
- [ ] Test creating news article
- [ ] Test feedback submission
- [ ] Test user registration and login
- [ ] Check browser console for CORS errors
- [ ] Test dark mode toggle
- [ ] Test search functionality

---

## 🔐 Security Notes

Before deploying to production:

1. **JWT_SECRET** - Generate a strong secret:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

2. **Email Credentials** - Consider:
   - Using Gmail App Password instead of account password
   - Or use SendGrid/Mailgun API instead
   - Never commit actual credentials to GitHub

3. **MongoDB** - Enable:
   - IP whitelist (add Render IP)
   - Strong password for database user
   - Automatic backups

4. **CORS** - Only allow:
   - Your Vercel frontend domain
   - Add any other domains if needed

5. **Secrets Management** - Never:
   - Commit `.env` files
   - Share API keys
   - Use weak JWT secrets
   - Allow public access to MongoDB

---

## 📞 Local Development Testing

To test the API configuration locally:

```bash
# Terminal 1: Backend
cd backend
node index.js
# Should start on http://localhost:5000

# Terminal 2: Frontend
cd frontend
npm run dev
# Should start on http://localhost:5173

# Test API calls
# Frontend uses VITE_API_BASE_URL from .env.local
# Which is set to http://localhost:5000
```

---

## 🎉 Next Steps After Deployment

1. **Monitor Performance** - Check Vercel and Render dashboards
2. **Set Up Auto-Deployments** - Push to main branch = auto deploy
3. **Custom Domain** - Connect custom domain (optional)
4. **Analytics** - Set up tracking for user behavior
5. **Error Monitoring** - Use Sentry or similar service
6. **Database Scaling** - Upgrade MongoDB if needed
7. **Load Testing** - Test performance before launch

---

## ✨ Summary

All files are now ready for deployment to production:
- ✅ Frontend can be deployed to Vercel
- ✅ Backend can be deployed to Render
- ✅ Configuration files are in place
- ✅ Environment variables are documented
- ✅ Deployment guide is comprehensive
- ✅ Local development still works perfectly

Just follow the `DEPLOYMENT_GUIDE.md` for step-by-step instructions!

---

**Created:** March 19, 2026
**Status:** Ready for Production Deployment
