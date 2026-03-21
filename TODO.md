# Duplicate News Fix - Render Redeploy
## Status: In Progress

**Issue:** Same news showing everywhere - APIs failing, no fallback.

**Steps:**
1. [ ] Read backend/models/News.js (DB schema)
2. [ ] Update backend/routes/news_fixed.js : Add **category-specific Hindi mock data** + **cache-bust RSS** + **log which APIs work**
3. [ ] Clear inMemoryArticles cache
4. [ ] Test locally: cd backend && npm start ; cd ../frontend && npm run dev ; check localhost:5173 diverse news per category
5. [ ] git add . && git commit -m 'Fix: diverse news fallbacks no API key needed' && git push origin main
6. [ ] Render auto-deploys to https://nagrik-news-backend.onrender.com
7. [ ] Test production: frontend URL

**Status:** Fixed news_fixed.js with Hindi mocks + RSS + no-cache + shuffle. Step 2 ✅

