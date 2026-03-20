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

// Upload Media Route
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';
router.post('/upload', upload.single('media'), (req, res) => {
    if (!req.file) return res.status(400).json({ msg: "No file uploaded" });
    const fileUrl = `${BACKEND_URL}/uploads/${req.file.filename}`;
    res.json({ url: fileUrl });
});

// Helper AI Translation function connecting to Python MarianMT
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://127.0.0.1:5001';
async function translateToHindi(texts) {
    if (!texts || texts.length === 0) return texts;
    try {
        const res = await axios.post(`${AI_SERVICE_URL}/translate`, { texts }, { timeout: 15000 });
        if (res.data && res.data.translated) {
            return res.data.translated;
        }
    } catch (e) {
        // AI Translation failed, fallback to original\n    return texts;
}

// Helper function to try multiple APIs
async function fetchExternalNews(category) {
    let allNews = [];
    const promises = [];

    // 1. Queue NewsAPI
    if (process.env.NEWS_API_KEY && process.env.NEWS_API_KEY !== 'YOUR_NEWS_API_KEY_HERE') {
        const gCat = category === 'general' ? '' : `&category=${category}`;
        promises.push(
            axios.get(`https://newsapi.org/v2/top-headlines?country=in${gCat}&apiKey=${process.env.NEWS_API_KEY}`, { timeout: 4000 })
                .then(async (res) => {
                    if (res.data.articles) {
                        const englishArticles = res.data.articles;
                        // Batch AI Translation (English to Hindi)
                        const titles = englishArticles.map(a => a.title || '');
                        const translatedTitles = await translateToHindi(titles);
                        
                        // Fetched from NewsAPI (AI Translated)\n                        allNews.push(...englishArticles.map((a, i) => ({
                            title: translatedTitles[i] || a.title, summary: a.description, category, 
                            source: a.source?.name || 'NewsAPI', imageUrl: a.urlToImage, status: 'published'
                        })));
                    }
                }).catch(() => {}) // NewsAPI Failed
        );
    }

    // 2. Queue GNews (HINDI)
    if (process.env.GNEWS_API_KEY && process.env.GNEWS_API_KEY !== 'YOUR_GNEWS_API_KEY_HERE') {
        const gCat = category === 'general' ? 'breaking-news' : category;
        promises.push(
            axios.get(`https://gnews.io/api/v4/top-headlines?country=in&lang=hi&topic=${gCat}&apikey=${process.env.GNEWS_API_KEY}`, { timeout: 4000 })
                .then(res => {
                    if (res.data.articles) {
                        console.log("✅ Fetched from GNews (Hindi)");
                        allNews.push(...res.data.articles.map(a => ({
                            title: a.title, summary: a.description, category,
                            source: a.source?.name || 'GNews', imageUrl: a.image, status: 'published'
                        })));
                    }
                }).catch(() => console.log('⚠️ GNews Failed'))
        );
    }

    // 3. Queue MediaStack (HINDI)
    if (process.env.MEDIASTACK_API_KEY && process.env.MEDIASTACK_API_KEY !== 'YOUR_MEDIASTACK_API_KEY_HERE') {
        const gCat = category === 'general' ? 'general' : category;
        promises.push(
            axios.get(`http://api.mediastack.com/v1/news?countries=in&languages=hi&categories=${gCat}&access_key=${process.env.MEDIASTACK_API_KEY}`, { timeout: 4000 })
                .then(res => {
                    if (res.data.data) {
                        console.log("✅ Fetched from MediaStack (Hindi)");
                        allNews.push(...res.data.data.map(a => ({
                            title: a.title, summary: a.description, category,
                            source: a.source || 'MediaStack', imageUrl: a.image, status: 'published'
                        })));
                    }
                }).catch(() => console.log('⚠️ MediaStack Failed'))
        );
    }

    // 4. Always Queue Free Public API (Saurav.tech)
    const publicCat = category === 'general' ? 'general' : category;
    promises.push(
        axios.get(`https://saurav.tech/NewsAPI/top-headlines/category/${publicCat}/in.json`, { timeout: 4000 })
            .then(async (res) => {
                if (res.data.articles) {
                    const englishArticles = res.data.articles;
                    // Batch AI Translation
                    const titles = englishArticles.map(a => a.title || '');
                    const translatedTitles = await translateToHindi(titles);
                    
                    console.log("✅ Fetched from Public API (AI Translated)");
                    allNews.push(...englishArticles.map((a, i) => ({
                        title: translatedTitles[i] || a.title, summary: a.description, category,
                        source: a.source?.name || 'Public News', imageUrl: a.urlToImage, status: 'published'
                    })));
                }
            }).catch(() => console.log('⚠️ Public fallback failed'))
    );

    // Wait for all to finish, ignoring individual rejections
    await Promise.allSettled(promises);

    // Filter duplicates by Title
    const uniqueNews = [];
    const titles = new Set();
    for (let article of allNews) {
        if (!titles.has(article.title) && article.title) {
            titles.add(article.title);
            uniqueNews.push(article);
        }
    }

    return uniqueNews;
}

// Fetch external news (Advanced Multiple API Routing + Fallbacks)
router.get('/feed', async (req, res) => {
    try {
        const { category = 'general' } = req.query;
        
        // 1. Fetch live APIs using robust fallback
        const externalNews = await fetchExternalNews(category);

        // 2. Always keep minimal mock as last resort for absolute zero-downtime demo
        const mockNews = [
            {
                title: 'एआई (AI) तेजी से बदल रहा है आधुनिक तकनीक का स्वरूप',
                summary: 'एआई ने टेक इंडस्ट्री में क्रांति ला दी है। नई रिपोर्ट के अनुसार अब कंपनियों में एआई की मांग सबसे ज्यादा है...',
                category: 'technology',
                source: 'नागरिक टेक',
                imageUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995',
                status: 'published'
            },
            {
                title: 'ग्लोबल मार्केट में उछाल, नई आर्थिक नीतियों का असर',
                summary: 'शेयर बाज़ार ने आज नए रिकॉर्ड तोड़े। निवेशकों में दिखा भारी उत्साह, कई बड़ी कंपनियों के शेयर आसमान पर।',
                category: 'business',
                source: 'नागरिक व्यापार',
                imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3',
                status: 'published'
            },
            {
                title: 'आगामी चुनावों की घोषणा, चुनाव आयोग ने की तैयारियां पूरी',
                summary: 'आने वाले विधानसभा चुनावों के लिए तारीखों का ऐलान हो गया है। सभी बड़ी पार्टियों ने चुनाव प्रचार तेज कर दिया है।',
                category: 'politics',
                source: 'नागरिक विशेष',
                imageUrl: 'https://images.unsplash.com/photo-1540910419892-4a36d2c3266c',
                status: 'published'
            }
        ];

        // 3. Attempt to fetch internal CMS content
        let internalNews = [...inMemoryArticles];
        try {
            const dbNews = await News.find({ status: 'published', category: new RegExp(category, 'i') }).sort({ createdAt: -1 });
            internalNews = [...internalNews, ...dbNews];
        } catch(e) { /* silent fail for demo mode */ }

        // Combine everything: Internal CMS First > Live External Data > Mock Fallbacks
        const finalizedFeed = [...internalNews, ...externalNews];
        
        // Only append mocks if the feed feels very empty (e.g., API limits maxed out and no internal articles)
        if(finalizedFeed.length === 0) {
            finalizedFeed.push(...mockNews.filter(n => category === 'general' || n.category === category));
        }

        res.json({ articles: finalizedFeed });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch feed" });
    }
});

// In-Memory Database Fallback logic for pure zero-setup demonstrations
let inMemoryArticles = [];

// CMS: Create New Article (Reporter/Editor)
router.post('/create', async (req, res) => {
    try {
        const { title, content, category, imageUrl, source, status } = req.body;
        
        // AI Summarization placeholder (Simulated Hugging Face/OpenAI generation)
        let summary = "AI शार्ट समरी: " + content.substring(0, 100) + "...";

        const article = new News({
            title, content, summary, category, imageUrl, source, status
        });

        // Store aggressively in memory so frontend works immediately during demo
        inMemoryArticles.unshift({ ...article.toObject(), _id: Date.now().toString(), createdAt: new Date() });

        // if db connected, save
        try {
            await article.save();
        } catch(e) { } // if no DB, silent ignore for demo
        
        res.status(201).json({ msg: "Article saved", article });
    } catch (err) {
        res.status(500).json({ msg: "Server Error" });
    }
});

// CMS: Get All Articles (Dashboard)
router.get('/cms/articles', async (req, res) => {
    try {
        const articles = await News.find().sort({ createdAt: -1 });
        if(articles.length > 0) return res.json(articles);
        throw new Error("Empty DB");
    } catch (err) {
        // Return exactly what was created in this session, or a mock starter fallback
        if (inMemoryArticles.length > 0) return res.json(inMemoryArticles);
        res.json([
            { _id: '1', title: "एआई एक्ट पर नया ड्राफ्ट तैयार", category: "तकनीक", status: "draft" },
            { _id: '2', title: "वर्ल्ड कप 2026 के फाइनल का वेन्यू घोषित", category: "खेल", status: "published" }
        ]); 
    }
});

// CMS: Delete Article
router.delete('/cms/delete/:id', async (req, res) => {
    try {
        const id = req.params.id;
        inMemoryArticles = inMemoryArticles.filter(a => a._id !== id);
        try { await News.findByIdAndDelete(id); } catch(e) {}
        res.json({ msg: "Deleted successfully" });
    } catch(err) { res.status(500).json({ msg: "Delete Error" }); }
});

// CMS: Update Article
router.put('/cms/update/:id', async (req, res) => {
    try {
        const id = req.params.id;
        // Update inMemory
        const memoryIndex = inMemoryArticles.findIndex(a => a._id === id);
        if(memoryIndex !== -1) {
            inMemoryArticles[memoryIndex] = { ...inMemoryArticles[memoryIndex], ...req.body };
        }

        let dbArticle = null;
        try { dbArticle = await News.findByIdAndUpdate(id, req.body, {new: true}); } catch(e) {}
        
        res.json({ msg: "Updated successfully", article: dbArticle || (memoryIndex !== -1 ? inMemoryArticles[memoryIndex] : null) });
    } catch(err) { res.status(500).json({ msg: "Update Error" }); }
});

module.exports = router;
