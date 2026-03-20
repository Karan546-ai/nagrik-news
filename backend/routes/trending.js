const express = require('express');
const router = express.Router();
// const googleTrends = require('google-trends-api');

router.get('/', async (req, res) => {
    try {
        // Mock trending tags for reliable demonstration
        const mockTrending = [
            
            { topic: "Union Budget 2026", score: 95 },
            { topic: "AI Act Europe", score: 88 },
            { topic: "SpaceX Mars Mission", score: 82 },
            { topic: "T20 World Cup Final", score: 79 },
            { topic: "Nagrik News Launch", score: 75 }
        ];

        /*
        // Actual implementation using google-trends-api
        const result = await googleTrends.realTimeTrends({
             geo: 'IN',
             category: 'all',
        });
        */

        res.json(mockTrending);
    } catch (err) {
        res.status(500).json([]);
    }
});

module.exports = router;
