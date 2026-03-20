const express = require('express');
const router = express.Router();
const { User, Feedback } = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Authorized Admin Credentials - MUST be set via environment variables
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error('WARNING: EMAIL_USER/PASS missing. Admin login disabled.');
}
const ADMIN_EMAIL = process.env.EMAIL_USER || '';
const ADMIN_PASSWORD = process.env.EMAIL_PASS || '';

if (!process.env.JWT_SECRET) {
    console.error('WARNING: JWT_SECRET missing. Token generation will fail.');
}

// ========================
router.post('/admin/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({ 
                success: false, 
                msg: 'Email and password required',
                message: 'Email and password are required' 
            });
        }

        // Check credentials
        if (email.toLowerCase().trim() !== ADMIN_EMAIL.toLowerCase().trim() || 
            password !== ADMIN_PASSWORD) {
            return res.status(401).json({ 
                success: false, 
                msg: 'Invalid credentials',
                message: 'Invalid email or password' 
            });
        }

        const token = jwt.sign(
            { 
                email: email.toLowerCase(),
                role: 'super-admin',
                name: 'Admin',
                loginTime: new Date()
            },
            process.env.JWT_SECRET || 'fallback-secret',
            { expiresIn: '24h' }
        );

        res.json({
            success: true,
            msg: 'Login successful',
            message: 'Admin authenticated successfully',
            token: token,
            admin: {
                email: email.toLowerCase(),
                role: 'super-admin',
                name: 'Admin'
            }
        });

    } catch (err) {
        console.error('Admin Login Error:', err.message);
        res.status(500).json({ 
            success: false, 
            msg: 'Server Error',
            error: err.message 
        });
    }
});

// User registration
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password) return res.status(400).json({ msg: "All fields required" });

        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ msg: "User exists" });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            name, email, password: hashedPassword, role: role || 'reader'
        });

        await newUser.save();

        res.status(201).json({ msg: "Registration successful" });
    } catch (err) {
        console.error('Register error:', err);
        res.status(500).json({ msg: "Server Error" });
    }
});

// User login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ msg: "Invalid credentials" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

        const token = jwt.sign(
            { id: user._id, role: user.role, name: user.name },
            process.env.JWT_SECRET || 'fallback-secret',
            { expiresIn: '30d' }
        );

        res.json({ token, user: { id: user._id, name: user.name, role: user.role, preferences: user.preferences } });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ msg: "Server Error" });
    }
});

// Feedback endpoint
router.post('/feedback', async (req, res) => {
    try {
        const { email, message, rating, category } = req.body;

        if (!message || message.trim().length < 5) {
            return res.status(400).json({ success: false, msg: 'Feedback too short.' });
        }

        const newFeedback = new Feedback({
            email: email || 'anonymous@nagriknews.com',
            message: message.trim(),
            rating: rating || 5,
            category: category || 'suggestion',
            status: 'new'
        });

        await newFeedback.save();

        res.json({
            success: true,
            msg: 'Feedback saved.',
            feedbackId: newFeedback._id
        });
    } catch (err) {
        console.error('Feedback error:', err.message);
        res.status(500).json({ success: false, msg: 'Server error' });
    }
});

// Get feedback
router.get('/feedback/all', async (req, res) => {
    try {
        const feedbackList = await Feedback.find().sort({ createdAt: -1 }).limit(100);
        res.json({ success: true, total: feedbackList.length, feedback: feedbackList });
    } catch (err) {
        console.error('Feedback fetch error:', err.message);
        res.status(500).json({ success: false, msg: 'Server error' });
    }
});

router.get('/feedback/stats', async (req, res) => {
    try {
        const total = await Feedback.countDocuments();
        const newCount = await Feedback.countDocuments({ status: 'new' });
        const avgRating = await Feedback.aggregate([{ $group: { _id: null, avgRating: { $avg: '$rating' } } }]);
        res.json({
            success: true,
            total, newCount, avgRating: avgRating[0]?.avgRating || 0
        });
    } catch (err) {
        console.error('Stats error:', err);
        res.status(500).json({ success: false, msg: 'Server error' });
    }
});

// Users
router.get('/users/all', async (req, res) => {
    try {
        const users = await User.find({ role: { $in: ['reader', 'reporter'] } })
.select('email name createdAt')
            .sort({ createdAt: -1 })
            .limit(1000);
        res.json({ success: true, total: users.length, users });
    } catch (err) {
        console.error('Users error:', err);
        res.status(500).json({ success: false, msg: 'Server error' });
    }
});

router.get('/users/stats', async (req, res) => {
    try {
        const totalUsers = await User.countDocuments({ role: { $in: ['reader', 'reporter'] } });
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const lastWeekUsers = await User.countDocuments({ role: { $in: ['reader', 'reporter'] }, createdAt: { $gte: sevenDaysAgo } });
        res.json({ success: true, totalUsers, lastWeekUsers });
    } catch (err) {
        console.error('User stats error:', err);
        res.status(500).json({ success: false, msg: 'Server error' });
    }
});

module.exports = router;
