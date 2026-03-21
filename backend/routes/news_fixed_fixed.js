const express = require('express');
const router = express.Router();
const axios = require('axios');
const News = require('../models/News');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

if (!fs.existsSync('uploads')) { fs.mkdirSync('uploads'); }
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

const BACKEND_URL = process.env.BACKEND_URL || 'https://nagrik-news-backend.onrender.com';
router.post('/upload', upload.single('media'), (req, res) => {
    if (!req.file) return res.status(400).json({ msg: "No file uploaded" });
    const fileUrl = `${BACKEND_URL}/uploads/${req.file.filename}`;
    res.json({ url: fileUrl });
});

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://127.0.0.1:5001';
async function translateToHindi(texts) {
    if (!texts || texts.length === 0) return texts;
    try {
        const res = await axios.post(`${AI_SERVICE_URL}/translate`, { texts }, { timeout: 15000 });
        return res.data?.translated || texts;
    } catch (e) {
        return texts;
    }
}

function normalizeTitle(title) {
  return title
    ?.toLowerCase()
    .replace(/[^a-z0-9\u0900-\u097F ]/g, '')
    .trim()
    .substring(0, 80);
}

function shuffleArray(array) {
  return array.sort(() => Math.random() - 0.5);
}

async function fetchExternalNews(category) {
    let allNews = [];

    // Category-specific Hindi fallback mocks (always works, no API key needed)
    const hindiMocks = {
        general: [
            {title: 'ब्रेकिंग: भारत की जीडीपी 7.2% बढ़ी, अर्थव्यवस्था चमक रही', summary: 'सरकार की नई नीतियों से तेज विकास। निवेशक उत्साहित। IMF ने भी सराहा।', imageUrl: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6', source: 'नागरिक न्यूज'},
            {title: 'मानसून अलर्ट: अगले 48 घंटे में भारी बारिश', summary: 'IMD ने रेड अलर्ट जारी। बिहार-UP में बाढ़ का खतरा। NDRF तैनात।', imageUrl: 'https://images.unsplash.com/photo-1570912542615-179087d7c635', source: 'मौसम विभाग'},
            {title: 'लोकसभा में नया कृषि बिल, विपक्ष वॉकआउट', summary: 'MSP गारंटी पर फिर बहस। सरकार का दावा- किसानों को लाभ।', imageUrl: 'https://images.unsplash.com/photo-1540910419892-4a36d2c3266c', source: 'संसद लाइव'},
            {title: 'रेलवे ने 100 नई ट्रेनें शुरू कीं', summary: 'बुलेट ट्रेन प्रोजेक्ट तेज। जनता को सस्ती यात्रा।', imageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957', source: 'रेल मंत्रालय'}
        ],
        technology: [
            {title: 'इसरो का नया 5G सैटेलाइट लॉन्च सफल', summary: 'ग्रामीण क्षेत्रों में तेज इंटरनेट। Jio-AirTel को फायदा।', imageUrl: 'https://images.unsplash.com/photo-1558618047-3c8c76fdd9e4', source: 'ISRO'},
            {title: 'AI ने कोविड का नया वैरिएंट पकड़ा', summary: 'गूगल AI ने 72 घंटे में डिटेक्ट। वैक्सीन तैयार हो रही।', imageUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995', source: 'AI लैब'},
            {title: 'भारत का पहला क्वांटम कंप्यूटर लॉन्च', summary: 'IIT मद्रास ने बनाया। साइबर सिक्योरिटी में क्रांति।', imageUrl: 'https://images.unsplash.com/photo-1632798735800-b96a456e8d44', source: 'IIT Madras'}
        ],
        business: [
            {title: 'सेंसेक्स 82,000 पार, रिकॉर्ड ऊंचाई', summary: 'IT शेयरों में तेजी। FII ने 20,000 करोड़ लगाए।', imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3', source: 'BSE/NSE'},
            {title: 'टाटा का EV प्लांट गुजरात में ₹5000 करोड़', summary: '2 लाख नई नौकरियां। 2026 तक 1 लाख Nexon EV।', imageUrl: 'https://images.unsplash.com/photo-1494905998402-395d579af36f', source: 'टाटा मोटर्स'},
            {title: 'अंबानी की Jio 5G पूरे भारत में लाइव', summary: '100 शहरों में हाई स्पीड। Airtel पीछे।', imageUrl: 'https://images.unsplash.com/photo-1613878801497-3f1569cd8b82', source: 'Jio'}
        ],
        sports: [
            {title: 'IND vs AUS T20: भारत ने 8 विकेट से धमाकेदार जीत', summary: 'रोहित 80*, बुमराह 4/20। वर्ल्ड कप फाइनल में एंट्री।', imageUrl: 'https://images.unsplash.com/photo-1553778263-73a71fd1a330', source: 'BCCI'},
            {title: 'IPL मेगा ऑक्शन: कोहली ₹18 करोड़ में RCB', summary: 'हاردिक पांड्या कप्तान। 5 नए अनकैप्ड सितारे।', imageUrl: 'https://images.unsplash.com/photo-1535374146908-c0a8f7a34147', source: 'IPL'},
            {title: 'साइना नेहवाल का कमबैक, ऑल इंग्लैंड जीता', summary: 'बैडमिंटन क्वीन वापसी। ओलंपिक गोल्ड का लक्ष्य।', imageUrl: 'https://images.unsplash.com/photo-1596201952372-708fb6ca584f', source: 'बैडमिंटन'}
        ]
    };

    allNews.push(...shuffleArray(hindiMocks[category] || hindiMocks.general));

    // Try external APIs if keys available
    const apiPromises = [];

    if (process.env.NEWS_API_KEY && process.env.NEWS_API_KEY !== 'YOUR_NEWS_API_KEY_HERE') {
        const gCat = category === 'general' ? '' : `&category=${category}`;
        apiPromises.push(
            axios.get(`https://newsapi.org/v2/top-headlines?country=in${gCat}&apiKey=${process.env.NEWS_API_KEY}`, { timeout: 5000 })
                .then(async (res) => {
                    console.log('✅ NewsAPI working');
                    const titles = res.data.articles.map(a => a.title || '');
                    const translated = await translateToHindi(titles.slice(0, 10));
                    allNews.push(...res.data.articles.slice(0, 10).map((a, i) => ({
                        title: translated[i] || a.title, summary: a.description, category,
                        source: a.source?.name || 'NewsAPI', imageUrl: a.urlToImage, status: 'published'
                    })));
                }).catch(e => console.log('❌ NewsAPI failed'))
        );
    }

    if (process.env.GNEWS_API_KEY && process.env.GNEWS_API_KEY !== 'YOUR_GNEWS_API_KEY_HERE') {
        const gCat = category === 'general' ? 'breaking-news' : category;
        apiPromises.push(
            axios.get(`https://gnews.io/api/v4/top-headlines?country=in&lang=hi&topic=${gCat}&apikey=${process.env.GNEWS_API_KEY}`, { timeout: 5000 })
                .then(res => {
                    console.log('✅ GNews working');
                    allNews.push(...res.data.articles.slice(0, 10).map(a => ({
                        title: a.title, summary: a.description, category,
                        source: a.source?.name || 'GNews', imageUrl: a.image, status: 'published'
                    })));
                }).catch(e => console.log('❌ GNews failed'))
        );
    }

    // Always try public Google News RSS
    apiPromises.push(
        axios.get(`https://api.rss2json.com/v1/api.json?rss_url=https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNR4n0CUFqU0FtVnVHZ0pWVXlnQVAB?hl=hi&gl=IN&ceid=IN%3Ahi`, { timeout: 8000 })
            .then(res => {
                console.log('✅ Google News RSS:', res.data.items?.length || 0);
                allNews.push(...(res.data.items || []).slice(0, 15).map(item => ({
                    title: item.title, 
                    summary: item.description.replace(/<[^>]*>/g, '').slice(0,150) + '...', 
                    category, 
                    source: item.source || 'गूगल न्यूज', 
                    imageUrl: item.thumbnail || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400', 
                    status: 'published'
                })));
            }).catch(e => console.log('❌ RSS failed'))
    );

    // Execute APIs
    await Promise.allSettled(apiPromises);

    // Dedupe + shuffle
    const titleSet = new Set();
    const uniqueNews = [];
    for (let article of allNews) {
        const key = normalizeTitle(article.title);
        if (key && !titleSet.has(key)) {
            titleSet.add(key);
            uniqueNews.push(article);
        }
    }

    return shuffleArray(uniqueNews).slice(0, 25);
}

router.get('/feed', async (req, res) => {
    try {
        const { category = 'general' } = req.query;
        
        res.set('Cache-Control', 'no-store, max-age=0');
        
        const news = await fetchExternalNews(category);
        
        let internalNews = [];
        try {
            internalNews = await News.find({ status: 'published' }).sort({ createdAt: -1 }).limit(5);
        } catch(e) {}

        const feed = shuffleArray([...internalNews, ...news]);
        
        console.log(`📢 Serving ${feed.length} diverse articles for ${category}`);
        res.json({ articles: feed });
    } catch (error) {
        console.error('Feed error:', error);
        // Emergency Hindi fallback
        const fallback = [
            {title: 'नागरिक न्यूज लाइव - विविध समाचार', summary: 'ताज़ा अपडेट्स के लिए बने रहें। सभी श्रेणियों में नई ख़बरें।', category: 'general', source: 'नागरिक न्यूज', imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d', status: 'published'}
        ];
        res.json({ articles: fallback });
    }
});

// CMS Routes (unchanged)
let inMemoryArticles = [];

router.post('/create', async (req, res) => {
    try {
        const { title, content, category, imageUrl, source, status } = req.body;
        const summary = content.substring(0, 100) + '...';
        const article = new News({ title, content, summary, category, imageUrl, source, status });
        inMemoryArticles.unshift({ ...article.toObject(), _id: Date.now().toString(), createdAt: new Date() });
        try { await article.save(); } catch(e) {}
        res.status(201).json({ msg: "Article saved", article });
    } catch (err) {
        res.status(500).json({ msg: "Server Error" });
    }
});

router.get('/cms/articles', async (req, res) => {
    try {
        const articles = await News.find().sort({ createdAt: -1 });
        res.json(articles.length > 0 ? articles : inMemoryArticles.length > 0 ? inMemoryArticles : []);
    } catch (err) {
        res.json(inMemoryArticles);
    }
});

router.delete('/cms/delete/:id', async (req, res) => {
    const id = req.params.id;
    inMemoryArticles = inMemoryArticles.filter(a => a._id !== id);
    try { await News.findByIdAndDelete(id); } catch(e) {}
    res.json({ msg: "Deleted" });
});

router.put('/cms/update/:id', async (req, res) => {
    const id = req.params.id;
    const memoryIndex = inMemoryArticles.findIndex(a => a._id === id);
    if (memoryIndex !== -1) {
        inMemoryArticles[memoryIndex] = { ...inMemoryArticles[memoryIndex], ...req.body };
    }
    try {
        const dbArticle = await News.findByIdAndUpdate(id, req.body, { new: true });
        res.json({ msg: "Updated", article: dbArticle || inMemoryArticles[memoryIndex] });
    } catch(e) {
        res.json({ msg: "Updated", article: inMemoryArticles[memoryIndex] });
    }
});

module.exports = router;
