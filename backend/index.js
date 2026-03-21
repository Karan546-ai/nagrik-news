const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth_fixed');
const newsRoutes = require('./routes/news_fixed_fixed');
const trendingRoutes = require('./routes/trending');

const app = express();

const path = require('path');

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database connection
mongoose.connect(process.env.MONGODB_URI).then(() => {
console.log('✅ MongoDB Connected');
}).catch((err) => console.error('MongoDB Connection Error:', err.message));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/trending', trendingRoutes);

app.get('/', (req, res) => {
    res.send('Nagrik News API is running successfully 🚀');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
