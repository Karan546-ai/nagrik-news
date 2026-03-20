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

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';
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

    // NewsAPI
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

    // GNews
    if (process.env.GNEWS_API_KEY && process.env.GNEWS_API_KEY !== 'YOUR_GNEWS_API_KEY_HERE') {
        const gCat = category === 'general' ? 'breaking-news' : category;
        promises.push(axios.get(`https://gnews.io/api/v4/top-headlines?country=in&lang=hi&topic=${gCat}&apikey=${process.env.GNEWS_API_KEY}`, { timeout: 4000 })
            .then(res => {
                if (res.data.articles) {
                    allNews.push(...res.data.articles.map(a => ({
                        title: a.title, summary: a.description, category,
                        source: a.source?.name || 'GNews', imageUrl: a.image, status: 'published'
                    })));
                }
            }).catch(() => {})
        );
    }

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

    // Public API
    const publicCat = category === 'general' ? 'general' : category;
    promises.push(axios.get(`https://saurav.tech/NewsAPI/top-headlines/category/${publicCat}/in.json`, { timeout: 4000 })
        .then(async (res) => {
            if (res.data.articles) {
                const titles = res.data.articles.map(a => a.title || '');
                const translatedTitles = await translateToHindi(titles);
                allNews.push(...res.data.articles.map((a, i) => ({
                    title: translatedTitles[i] || a.title, summary: a.description, category,
                    source: 'Public News', imageUrl: a.urlToImage, status: 'published'
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
        const externalNews = await fetchExternalNews(category);
        let internalNews = [];
        try {
            internalNews = await News.find({ status: 'published', category: new RegExp(category, 'i') }).sort({ createdAt: -1 });
        } catch(e) {}
        const feed = [...internalNews, ...externalNews];
        res.json({ articles: feed });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch feed" });
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
