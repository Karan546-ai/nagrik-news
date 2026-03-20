const mongoose = require('mongoose');

const NewsSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    summary: { type: String, default: null },
    category: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    imageUrl: { type: String },
    source: { type: String, default: 'Nagrik News Exclusive' },
    status: { type: String, enum: ['draft', 'pending', 'published'], default: 'draft' },
    trendingScore: { type: Number, default: 0 },
    authenticityScore: { type: Number, default: 100 }
}, { timestamps: true });

module.exports = mongoose.model('News', NewsSchema);
