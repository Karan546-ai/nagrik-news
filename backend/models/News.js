const express = require('express');
const router = express.Router();
const axios = require('axios');
const News = require('../models/News');

// 🔁 Shuffle function
function shuffleArray(array) {
    return array.sort(() => Math.random() - 0.5);
}

// 🧠 Better duplicate remover
function normalizeTitle(title) {
    return title
        ?.toLowerCase()
        .replace(/[^a-z0-9 ]/g, '')
        .trim()
        .substring(0, 80);
}

// 🌍 Fetch news from APIs
async function fetchExternalNews(category) {
    let allNews = [];
    const promises = [];

    // ✅ NEWS API
    if (process.env.NEWS_API_KEY) {
        const gCat = category === 'general' ? '' : `&category=${category}`;
        promises.push(
            axios.get(`https://newsapi.org/v2/top-headlines?country=in${gCat}&apiKey=${process.env.NEWS_API_KEY}`)
                .then(res => {
                    if (res.data.articles) {
                        allNews.push(...res.data.articles.map(a => ({
                            title: a.title,
                            summary: a.description,
                            category: a.category || category,
                            source: a.source?.name || 'NewsAPI',
                            imageUrl: a.urlToImage,
                            status: 'published'
                        })));
                    }
                }).catch(() => {})
        );
    }

    // ✅ GNEWS API
    if (process.env.GNEWS_API_KEY) {
        const gCat = category === 'general' ? 'breaking-news' : category;
        promises.push(
            axios.get(`https://gnews.io/api/v4/top-headlines?country=in&lang=hi&topic=${gCat}&apikey=${process.env.GNEWS_API_KEY}`)
                .then(res => {
                    if (res.data.articles) {
                        allNews.push(...res.data.articles.map(a => ({
                            title: a.title,
                            summary: a.description,
                            category: category,
                            source: a.source?.name || 'GNews',
                            imageUrl: a.image,
                            status: 'published'
                        })));
                    }
                }).catch(() => {})
        );
    }

    // ✅ GOOGLE NEWS RSS (BEST FREE SOURCE)
    const rssUrl = `https://news.google.com/rss?hl=hi&gl=IN&ceid=IN:hi`;
    promises.push(
        axios.get(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`)
            .then(res => {
                if (res.data.items) {
                    allNews.push(...res.data.items.map(a => ({
                        title: a.title,
                        summary: a.description.replace(/<[^>]*>?/gm, '').substring(0, 150),
                        category: category,
                        source: 'Google News',
                        imageUrl: a.thumbnail,
                        status: 'published'
                    })));
                }
            }).catch(() => {})
    );

    await Promise.allSettled(promises);

    // 🧹 REMOVE DUPLICATES
    const seen = new Set();
    const uniqueNews = [];

    for (let article of allNews) {
        const key = normalizeTitle(article.title);

        if (!seen.has(key) && key) {
            seen.add(key);
            uniqueNews.push(article);
        }
    }

    return shuffleArray(uniqueNews).slice(0, 30);
}

// 📰 MAIN FEED
router.get('/feed', async (req, res) => {
    try {
        res.set('Cache-Control', 'no-store'); // 🔥 IMPORTANT (Render fix)

        const { category = 'general' } = req.query;

        // External news
        const externalNews = await fetchExternalNews(category);

        // DB news
        let internalNews = [];
        try {
            internalNews = await News.find({
                status: 'published',
                category: new RegExp(category, 'i')
            }).sort({ createdAt: -1 });
        } catch (e) {}

        // Combine + shuffle
        const finalFeed = shuffleArray([...internalNews, ...externalNews]).slice(0, 30);

        res.json({ articles: finalFeed });

    } catch (err) {
        res.status(500).json({ message: "Failed to fetch news" });
    }
});

module.exports = router;