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

async function fetchExternalNews(category) {
    let allNews = [];
    const promises = [];

    // Category-specific Hindi fallback mocks (no API needed)
    const hindiMocks = {
        general: [
            {title: 'ब्रेकिंग: भारत की जीडीपी 7.2% बढ़ी', summary: 'सरकार की नई आर्थिक नीतियों से अर्थव्यवस्था में तेजी। निवेशकों का भरोसा बढ़ा।', imageUrl: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6', source: 'नागरिक न्यूज'},
            {title: 'मानसून अपडेट: अगले 48 घंटे भारी बारिश', summary: 'आईएमडी ने अलर्ट जारी किया। निचले इलाकों में बाढ़ का खतरा।', imageUrl: 'https://images.unsplash.com/photo-1570912542615-179087d7c635', source: 'मौसम विभाग'},
            {title: 'लोकसभा में नया बिल पेश, विपक्ष ने किया वॉकआउट', summary: 'कृषि सुधार विधेयक पर फिर गरमाई। विपक्ष ने सदन से वोटबंदी की।', imageUrl: 'https://images.unsplash.com/photo-1540910419892-4a36d2c3266c', source: 'संसद'}
        ],
        technology: [
            {title: 'इसरो का नया सैटेलाइट लॉन्च सफल, 5G सेवाओं को बूस्ट', summary: 'चंद्रयान के बाद अब कम्युनिकेशन सैटेलाइट। पूरे देश में तेज इंटरनेट।', imageUrl: 'https://images.unsplash.com/photo-1558618047-3c8c76fdd9e4', source: 'इसरो'},
            {title: 'AI ने पहचाना नया कोविड वैरिएंट', summary: 'गूगल के AI ने सिर्फ 72 घंटे में पहचाना। नया वैक्सीन बनाने की तैयारी।', imageUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995', source: 'AI लैब'}
        ],
        business: [
            {title: 'सेंसेक्स 500 अंक उछला, रिलायंस शेयरों में तेजी', summary: 'मुंबई स्टॉक एक्सचेंज पर भारी उछाल। फॉरेन निवेशकों ने की खरीदारी।', imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3', source: 'BSE'},
            {title: 'टाटा का EV प्लांट गुजरात में 5000 करोड़ निवेश', summary: '2026 तक 1 लाख इलेक्ट्रिक कारें। नई जॉब्स का सृजन होगा।', imageUrl: 'https://images.unsplash.com/photo-1494905998402-395d579af36f', source: 'टाटा मोटर्स'}
        ],
        sports: [
            {title: 'टी20 वर्ल्ड कप: भारत ने दक्षिण अफ्रीका को 8 विकेट से हराया', summary: 'रोहित शर्मा अर्धशतकीय, जसप्रीत ने 4 विकेट। फाइनल में एंट्री।', imageUrl: 'https://images.unsplash.com/photo-1553778263-73a71fd1a330', source: 'BCCI'},
            {title: 'IPL नीलामी: विराट कोहली सबसे महंगे खिलाड़ी', summary: '10 करोड़ रुपये में RCB को मिले। युवा तेज गेंदबाजों पर भी बोली।', imageUrl: 'https://images.unsplash.com/photo-1535374146908-c0a8f7a34147', source: 'IPL'}
        ]
    };

    allNews.push(...(hindiMocks[category] || hindiMocks.general || []));

    // External APIs (bonus)
    if (process.env.NEWS_API_KEY && process.env.NEWS_API_KEY !== 'YOUR_NEWS_API_KEY_HERE') {
        const gCat = category === 'general' ? '' : `&category=${category}`;
        promises.push(axios.get(`https://newsapi.org/v2/top-headlines?country=in${gCat}&apiKey=${process.env.NEWS_API_KEY}`, { timeout: 4000 })
            .then(async (res) => {
                if (res.data.articles) {
                    const titles = res.data.articles.map(a => a.title || '');
                    const translatedTitles = await translateToHindi(titles);
                    allNews.push(...res.data.articles.map((a, i) => ({
                        title: translatedTitles[i] || a.title, 
                        summary: a.description, 
                        category, 
                        source: a.source?.name || 'NewsAPI', 
                        imageUrl: a.urlToImage, 
                        status: 'published'
                    })));
                }
            }).catch(() => {})
        );
    }

// GNews (bonus)
    if (process.env.GNEWS_API_KEY && process.env.GNEWS_API_KEY !== 'YOUR_GNEWS_API_KEY_HERE') {
        const gCat = category === 'general' ? 'breaking-news' : category;
        promises.push(axios.get(`https://gnews.io/api/v4/top-headlines?country=in&lang=hi&topic=${gCat}&apikey=${process.env.GNEWS_API_KEY}`, { timeout: 4000 })
            .then(res => {
                if (res.data.articles) {
                    allNews.push(...res.data.articles.map(a => ({
                        title: a.title, summary: a.description, category,
                        source: a.source?.name || 'GNews', imageUrl: a.image, status: 'published'
                    })));
                    console.log(`✅ GNews OK: ${res.data.articles.length} articles`);
                }
            }).catch(() => console.log('❌ GNews failed'))
        );
    }

    // Public RSS always
    promises.push(
        axios.get(`https://api.rss2json.com/v1/api.json?rss_url=https://news.google.com/rss/headlines/section/topic/${category.toUpperCase()}?hl=hi&gl=IN&ceid=IN:hi`, { timeout: 5000 })
            .then(res => {
                if (res.data.items) {
                    allNews.push(...res.data.items.slice(0, 10).map(item => ({
                        title: item.title, 
                        summary: item.description.replace(/<[^>]*>/g, '').slice(0,150)+'..', 
                        category, 
                        source: 'गूगल न्यूज', 
                        imageUrl: item.thumbnail || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
                        status: 'published'
                    })));
                    console.log(`✅ Google RSS: ${res.data.items.length} items`);
                }
            }).catch(() => {})
    );

    await Promise.allSettled(promises);

    // Dedupe by normalized title
    const titleMap = new Map();
    allNews.forEach(article => {
        const normTitle = normalizeTitle(article.title);
        if (normTitle && !titleMap.has(normTitle)) {
            titleMap.set(normTitle, article);
        }
    });

    const uniqueNews = Array.from(titleMap.values());
    return shuffleArray(uniqueNews.slice(0, 20));

    // MediaStack
    if (process.env.MEDIASTACK_API_KEY && process.env.MEDIASTACK_API_KEY !== 'YOUR_MEDIASTACK_API_KEY_HERE') {
        const gCat = category === 'general' ? 'general' : category;
        promises.push(axios.get(`http://api.mediastack.com/v1/news?countries=in&languages=hi&categories=${gCat}&access_key=${process.env.MEDIASTACK_API_KEY}`, { timeout: 4000 })
            .then(res => {
                if (res.data.data) {
                    allNews.push(...res.data.data.map(a => ({
                        title: a.title, summary: a.description, category,
                        source: a.source || 'MediaStack', imageUrl: a.image, status: 'published'
                    })));
                }
            }).catch(() => {})
        );
    }

    // Public API Fallback (Fresh News via Google News RSS)
    const rssTopic = category.toLowerCase() === 'technology' ? 'TECHNOLOGY' : category.toLowerCase() === 'sports' ? 'SPORTS' : category.toLowerCase() === 'entertainment' ? 'ENTERTAINMENT' : category.toLowerCase() === 'business' ? 'BUSINESS' : 'NATION';
    const rssUrl = `https://news.google.com/rss/headlines/section/topic/${rssTopic}?hl=hi&gl=IN&ceid=IN:hi`;
    promises.push(axios.get(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`, { timeout: 4000 })
        .then(async (res) => {
            if (res.data.items) {
                allNews.push(...res.data.items.slice(0, 15).map((a, i) => ({
                    title: a.title, summary: a.description.replace(/<[^>]*>?/gm, '').substring(0, 150) + '...', category,
                    source: a.source || 'Google News', imageUrl: a.thumbnail || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&q=80', status: 'published'
                })));
            }
        }).catch(() => {})
    );

    await Promise.allSettled(promises);

    // Dedupe
    const titles = new Set();
    const uniqueNews = allNews.filter(article => article.title && !titles.has(article.title) && titles.add(article.title));

    return uniqueNews;
}

router.get('/feed', async (req, res) => {
    try {
        const { category = 'general' } = req.query;
        
        // No cache for fresh news
        res.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
        
        const externalNews = await fetchExternalNews(category);
        
        let internalNews = [];
        try {
            internalNews = await News.find({ status: 'published' }).sort({ createdAt: -1 }).limit(5);
        } catch(e) {
            console.log('DB unavailable, using external only');
        }
        
        // Always 12+ diverse articles
        let feed = [...internalNews, ...externalNews];
        feed = shuffleArray(feed).slice(0, 25);
        
        // Emergency Hindi fallback if empty
        if (feed.length === 0) {
            feed = [
                {title: 'ताजा खबरें लोड हो रही हैं...', summary: 'देखते ही आ रही हैं। कृपया पेज रिफ्रेश करें।', category, source: 'नागरिक न्यूज', imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d', status: 'published'}
            ];
        }
        
        console.log(`📊 Feed served: ${feed.length} articles (cat: ${category})`);
        res.json({ articles: feed });
    } catch (error) {
        console.error('Feed error:', error);
        res.status(500).json({ message: "News service temporarily unavailable. Trying fallback data." });
    }
});

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
        res.json(articles.length > 0 ? articles : inMemoryArticles.length > 0 ? inMemoryArticles : [
            { _id: '1', title: "Sample Draft", category: "technology", status: "draft" }
        ]);
    } catch (err) {
        res.json(inMemoryArticles.length > 0 ? inMemoryArticles : []);
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
