const express = require('express');
const router = express.Router();
const axios = require('axios');

// Cache for trending topics (refresh every 10 minutes)
let trendingCache = null;
let trendingCacheTime = 0;
const TRENDING_TTL = 10 * 60 * 1000;

// Default trending topics (always available)
const defaultTrending = [
    { topic: "Union Budget 2026", score: 95 },
    { topic: "AI Act Europe", score: 88 },
    { topic: "SpaceX Mars Mission", score: 82 },
    { topic: "T20 World Cup Final", score: 79 },
    { topic: "Chandrayaan-4 Launch", score: 76 },
    { topic: "UPI Record Transaction", score: 73 },
    { topic: "Electric Vehicle India", score: 70 },
    { topic: "Nagrik News Launch", score: 68 },
    { topic: "5G Rollout India", score: 65 },
    { topic: "Digital India 2026", score: 62 }
];

async function getTrendingTopics() {
    // Return cache if fresh
    if (trendingCache && (Date.now() - trendingCacheTime) < TRENDING_TTL) {
        return trendingCache;
    }

    try {
        // Try to get real trending from Google News RSS
        const res = await axios.get(
            `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent('https://news.google.com/rss?hl=hi&gl=IN&ceid=IN:hi')}`,
            { timeout: 4000 }
        );
        
        if (res.data?.status === 'ok' && res.data.items?.length > 0) {
            const topics = res.data.items.slice(0, 10).map((item, i) => ({
                topic: item.title.split(' - ')[0].slice(0, 60),
                score: 95 - (i * 5)
            }));
            
            trendingCache = topics;
            trendingCacheTime = Date.now();
            console.log('✅ Trending topics refreshed from Google News');
            return topics;
        }
    } catch (e) {
        console.log('⏭️ Trending fetch failed, using defaults');
    }

    // Fallback to defaults
    trendingCache = defaultTrending;
    trendingCacheTime = Date.now();
    return defaultTrending;
}

router.get('/', async (req, res) => {
    try {
        const trending = await getTrendingTopics();
        res.json(trending);
    } catch (err) {
        res.json(defaultTrending);
    }
});

module.exports = router;
