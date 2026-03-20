const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['reader', 'reporter', 'editor', 'admin'], default: 'reader' },
    preferences: { type: [String], default: [] } // stored personalized categories
}, { timestamps: true });

// OTP Schema for Admin Access
const AdminOTPSchema = new mongoose.Schema({
    email: { type: String, required: true },
    phone: { type: String, required: true },
    otp: { type: String, required: true },
    createdAt: { type: Date, default: Date.now, expires: 600 } // OTP expires in 10 minutes
});

// Feedback Schema
const FeedbackSchema = new mongoose.Schema({
    email: { type: String, required: true },
    message: { type: String, required: true },
    rating: { type: Number, min: 1, max: 5, default: 5 },
    category: { type: String, enum: ['suggestion', 'bug', 'feature', 'other'], default: 'suggestion' },
    status: { type: String, enum: ['new', 'read', 'responded'], default: 'new' },
    createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = {
    User: mongoose.model('User', UserSchema),
    AdminOTP: mongoose.model('AdminOTP', AdminOTPSchema),
    Feedback: mongoose.model('Feedback', FeedbackSchema)
};
