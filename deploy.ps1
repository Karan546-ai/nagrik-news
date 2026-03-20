# OneClick Deployment Script for Nagrik News
# बस यह script चलाओ और सब कुछ automatic हो जाएगा!

Write-Host "
╔════════════════════════════════════════════╗
║    NAGRIK NEWS - DEPLOYMENT WIZARD         ║
║    (OneClick Deploy to Vercel + Render)    ║
╚════════════════════════════════════════════╝
" -ForegroundColor Cyan

# Check Git installed
Write-Host "`n[CHECKING] Git installation..." -ForegroundColor Yellow
$gitCheck = git --version 2>$null
if (!$gitCheck) {
    Write-Host "❌ ERROR: Git installed nahi hai!" -ForegroundColor Red
    Write-Host "Download करो: https://git-scm.com" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Git found: $gitCheck" -ForegroundColor Green

# Setup Git if needed
Write-Host "`n[STEP 1/3] Setting up Git..." -ForegroundColor Yellow
git config --global user.email "karantiwari062@gmail.com" 2>$null
git config --global user.name "Nagrik News Admin" 2>$null

# Initialize git
if (!(Test-Path ".git")) {
    Write-Host "Initializing Git repository..." -ForegroundColor Gray
    git init
}

# Add and commit all changes
Write-Host "`n[STEP 2/3] Committing your code..." -ForegroundColor Yellow
git add .
git commit -m "Nagrik News - Production Ready Deployment"

# Get GitHub URL from user
Write-Host "`n[STEP 3/3] Pushing to GitHub..." -ForegroundColor Yellow
Write-Host "`nसबसे पहले GitHub पर empty repository बनाओ:" -ForegroundColor Cyan
Write-Host "  1. जाओ: https://github.com/new" -ForegroundColor Gray
Write-Host "  2. Repository Name: nagrik-news" -ForegroundColor Gray
Write-Host "  3. Public select करो" -ForegroundColor Gray
Write-Host "  4. Create करो" -ForegroundColor Gray
Write-Host "  5. नीचे दिया गया HTTPS URL copy करो" -ForegroundColor Gray

$githubUrl = Read-Host "`nअपना GitHub repository HTTPS URL enter करो (जैसे https://github.com/USERNAME/nagrik-news.git)"

if (!$githubUrl.Contains("github.com")) {
    Write-Host "❌ Invalid GitHub URL!" -ForegroundColor Red
    exit 1
}

# Set remote and push
try {
    git remote remove origin 2>$null
    git remote add origin $githubUrl
    git branch -M main
    Write-Host "`n⏳ Pushing code to GitHub (यह कुछ समय ले सकता है)..." -ForegroundColor Yellow
    git push -u origin main --force
    Write-Host "✅ Code successfully pushed to GitHub!" -ForegroundColor Green
} catch {
    Write-Host "❌ Git push failed. Check your GitHub URL and internet connection." -ForegroundColor Red
    exit 1
}

Write-Host "
╔════════════════════════════════════════════╗
║   ✅ CODE PUSHED TO GITHUB SUCCESSFULLY    ║
╚════════════════════════════════════════════╝
" -ForegroundColor Green

# Now show deployment instructions
Write-Host "`n" -NoNewline
Write-Host "
╔════════════════════════════════════════════════════════════╗
║              NEXT STEPS - BROWSER में करो               ║
║                  (20 मिनट का काम)                        ║
╚════════════════════════════════════════════════════════════╝
" -ForegroundColor Cyan

Write-Host "`n📌 STEP 1: MongoDB Database बनाओ (3 min)" -ForegroundColor Yellow
Write-Host "
1. जाओ: https://www.mongodb.com/cloud/atlas
2. 'Sign Up' → GitHub से register करो
3. Free Cluster बनाओ (nagrik-news)
4. Database user create करो:
   - Username: nagrik_admin
   - Password: कोई strong password
5. Connection String copy करो:
   mongodb+srv://nagrik_admin:PASSWORD@cluster.mongodb.net/nagrik_news
   (PASSWORD की जगह तुम्हारा password डालो)

💾 इस Connection String को save करो! (बाद में चाहिए)
" -ForegroundColor Gray

Write-Host "📌 STEP 2: Backend को Render पर Deploy करो (10 min)" -ForegroundColor Yellow
Write-Host "
1. जाओ: https://render.com/dashboard
2. 'Create' → 'Web Service' click करो
3. अपना GitHub repository select करो (nagrik-news)
4. Settings fill करो:
   - Name: nagrik-news-backend
   - Environment: Node
   - Build Command: npm install
   - Start Command: npm start
   - Root Directory: backend
   
5. Advanced → Environment Variables में यह add करो:
   NODE_ENV = production
   MONGODB_URI = (तुम्हारा MongoDB connection string)
   JWT_SECRET = abc123def456ghi789jkl012mno345pqr
   EMAIL_USER = karantiwari062@gmail.com
   EMAIL_PASS = Karantiwari292929
   CORS_ORIGIN = (अभी blank रखो, बाद में update करेंगे)

6. 'Create Web Service' click करो
7. Deploy complete होने का इंतज़ार करो (5-10 min)
8. Backend URL copy करो (कुछ यूं: https://nagrik-news-backend.onrender.com)

💾 Backend URL save करो!
" -ForegroundColor Gray

Write-Host "📌 STEP 3: Frontend को Vercel पर Deploy करो (5 min)" -ForegroundColor Yellow
Write-Host "
1. जाओ: https://vercel.com/dashboard
2. 'Add New' → 'Project' click करो
3. अपना GitHub repository select करो
4. Settings:
   - Framework: Vite
   - Root Directory: frontend
   
5. Environment Variables में यह add करो:
   VITE_API_BASE_URL = (Step 2 से तुम्हारा Backend URL)
   
6. 'Deploy' click करो
7. Deployment complete होने का wait करो (2-3 min)
8. तुम्हें Vercel URL मिलेगा (जैसे nagrik-news.vercel.app)

🎉 यह तुम्हारा LIVE WEBSITE है!
" -ForegroundColor Gray

Write-Host "📌 STEP 4: Backend CORS Update करो (1 min)" -ForegroundColor Yellow
Write-Host "
1. Render dashboard खोलो
2. nagrik-news-backend service select करो
3. Environment variables में जाओ
4. CORS_ORIGIN को update करो:
   CORS_ORIGIN = (तुम्हारा Vercel URL)
   
5. Save करो और backend auto-restart होगा
" -ForegroundColor Gray

Write-Host "`n" -NoNewline
Write-Host "
╔════════════════════════════════════════════════════════════╗
║                  🎉 SUCCESS! 🎉                           ║
║                                                            ║
║  तुम्हारा Application अब तैयार है deployment के लिए!      ║
║  Browser खोलो और ऊपर दिए हुए steps follow करो           ║
║  कुल समय: ~20 मिनट                                       ║
╚════════════════════════════════════════════════════════════╝
" -ForegroundColor Green

Write-Host "`n✅ तुम्हारा Code यहाँ है: $githubUrl`n" -ForegroundColor Cyan

$openGit = Read-Host "क्या GitHub repository browser में खोलना है? (Y/n)"
if ($openGit -ne "n") {
    Start-Process $githubUrl
}

Write-Host "`n✨ Happy Deploying! ✨`n" -ForegroundColor Cyan
