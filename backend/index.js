const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth_fixed');
const newsRoutes = require('./routes/news_fixed_fixed');
const trendingRoutes = require('./routes/trending');

const app = express();

// Middleware
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:3000', 'https://nagrik-news.vercel.app', 'https://nagrik-news-frontend.vercel.app'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database connection (non-blocking - app works even without DB)
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ MongoDB Connected'))
    .catch((err) => console.warn('⚠️ MongoDB not connected (app will still work):', err.message));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/trending', trendingRoutes);

// Health check
app.get('/', (req, res) => {
    res.json({
        status: 'running',
        message: 'Nagrik News API is running successfully 🚀',
        timestamp: new Date().toISOString(),
        endpoints: {
            news: '/api/news/feed?category=general',
            trending: '/api/trending',
            search: '/api/news/search?q=india'
        }
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`\n🚀 Nagrik News Backend running on port ${PORT}`);
    console.log(`   📰 News Feed: http://localhost:${PORT}/api/news/feed`);
    console.log(`   🔥 Trending:  http://localhost:${PORT}/api/trending`);
    console.log(`   🔍 Search:    http://localhost:${PORT}/api/news/search?q=india\n`);
});
