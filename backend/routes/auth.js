const express = require('express');
const router = express.Router();
const { User, Feedback } = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// ========================
// 🔐 ENV CHECK
// ========================
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error('❌ Admin credentials missing in .env');
}

if (!process.env.JWT_SECRET) {
    console.error('❌ JWT_SECRET missing in .env');
}

const ADMIN_EMAIL = process.env.EMAIL_USER;
const ADMIN_PASSWORD = process.env.EMAIL_PASS; // hashed password

// ========================
// 🔐 AUTH MIDDLEWARE
// ========================
const authMiddleware = (req, res, next) => {
    const token = req.header('Authorization');

    if (!token) {
        return res.status(401).json({ msg: '❌ No token, access denied' });
    }

    try {
        const decoded = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ msg: '❌ Invalid token' });
    }
};

// ========================
// 🔐 ADMIN MIDDLEWARE
// ========================
const adminMiddleware = (req, res, next) => {
    if (req.user.role !== 'super-admin') {
        return res.status(403).json({ msg: '❌ Admin access required' });
    }
    next();
};

// ========================
// 🔐 ADMIN LOGIN
// ========================
router.post('/admin/login', async (req, res) => {
    try {
        let { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ msg: 'Email & Password required' });
        }

        email = email.toLowerCase().trim();

        if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
            return res.status(500).json({ msg: 'Admin not configured' });
        }

        if (email !== ADMIN_EMAIL.toLowerCase().trim()) {
            return res.status(401).json({ msg: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, ADMIN_PASSWORD);
        if (!isMatch) {
            return res.status(401).json({ msg: 'Invalid credentials' });
        }

        const token = jwt.sign(
            {
                email,
                role: 'super-admin',
                name: 'Admin'
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            success: true,
            msg: '✅ Admin login successful',
            token,
            admin: {
                email,
                role: 'super-admin',
                name: 'Admin'
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server Error' });
    }
});

// ========================
// 📝 USER REGISTER
// ========================
router.post('/register', async (req, res) => {
    try {
        let { name, email, password, role } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ msg: 'All fields required' });
        }

        email = email.toLowerCase().trim();

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            role: role || 'reader'
        });

        await newUser.save();

        res.status(201).json({ msg: '✅ Registration successful' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server Error' });
    }
});

// ========================
// 🔑 USER LOGIN
// ========================
router.post('/login', async (req, res) => {
    try {
        let { email, password } = req.body;

        email = email.toLowerCase().trim();

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        const token = jwt.sign(
            {
                id: user._id,
                role: user.role,
                name: user.name
            },
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
        );

        res.json({
            token,
            user: {
                id: user._id,
                name: user.name,
                role: user.role
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server Error' });
    }
});

// ========================
// 💬 FEEDBACK SUBMIT
// ========================
router.post('/feedback', async (req, res) => {
    try {
        const { email, message, rating, category } = req.body;

        if (!message || message.trim().length < 5) {
            return res.status(400).json({ msg: 'Message too short' });
        }

        const newFeedback = new Feedback({
            email: email?.trim() || 'anonymous@nagriknews.com',
            message: message.trim(),
            rating: rating || 5,
            category: category || 'suggestion'
        });

        await newFeedback.save();

        res.json({
            success: true,
            msg: '✅ Feedback submitted',
            feedbackId: newFeedback._id
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server Error' });
    }
});

// ========================
// 📊 GET ALL FEEDBACK (ADMIN)
// ========================
router.get('/feedback/all', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const feedbackList = await Feedback.find()
            .sort({ createdAt: -1 })
            .limit(100);

        res.json({
            success: true,
            total: feedbackList.length,
            feedback: feedbackList
        });

    } catch (err) {
        res.status(500).json({ msg: 'Error fetching feedback' });
    }
});

// ========================
// 📊 FEEDBACK STATS
// ========================
router.get('/feedback/stats', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const total = await Feedback.countDocuments();

        const byCategory = await Feedback.aggregate([
            { $group: { _id: '$category', count: { $sum: 1 } } }
        ]);

        const avgRating = await Feedback.aggregate([
            { $group: { _id: null, avgRating: { $avg: '$rating' } } }
        ]);

        res.json({
            success: true,
            total,
            avgRating: avgRating[0]?.avgRating || 0,
            byCategory
        });

    } catch (err) {
        res.status(500).json({ msg: 'Error fetching stats' });
    }
});

// ========================
// 👥 GET USERS (ADMIN)
// ========================
router.get('/users/all', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const users = await User.find({ role: { $in: ['reader', 'reporter'] } })
            .select('-password')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            total: users.length,
            users
        });

    } catch (err) {
        res.status(500).json({ msg: 'Error fetching users' });
    }
});

// ========================
// 📊 USER STATS
// ========================
router.get('/users/stats', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();

        const last7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

        const lastWeekUsers = await User.countDocuments({
            createdAt: { $gte: last7Days }
        });

        res.json({
            success: true,
            totalUsers,
            lastWeekUsers
        });

    } catch (err) {
        res.status(500).json({ msg: 'Error fetching stats' });
    }
});

module.exports = router;