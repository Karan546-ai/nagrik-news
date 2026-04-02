const express = require('express');
const router = express.Router();
const axios = require('axios');
const News = require('../models/News');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ========================
// FILE UPLOAD SETUP
// ========================
if (!fs.existsSync('uploads')) { fs.mkdirSync('uploads'); }
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

const BACKEND_URL = process.env.BACKEND_URL || 'https://nagrik-news-backend.onrender.com';
router.post('/upload', upload.single('media'), (req, res) => {
    if (!req.file) return res.status(400).json({ msg: "No file uploaded" });
    const fileUrl = `${BACKEND_URL}/uploads/${req.file.filename}`;
    res.json({ url: fileUrl });
});

// ========================
// NEWS CACHE (5 minute TTL to avoid repeated API calls)
// ========================
const newsCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getCachedNews(category) {
    const cached = newsCache.get(category);
    if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
        console.log(`📦 Serving cached news for ${category} (${cached.articles.length} articles)`);
        return cached.articles;
    }
    return null;
}

function setCachedNews(category, articles) {
    newsCache.set(category, { articles, timestamp: Date.now() });
}

// ========================
// HELPER UTILITIES
// ========================
function normalizeTitle(title) {
  return title
    ?.toLowerCase()
    .replace(/[^a-z0-9\u0900-\u097F ]/g, '')
    .trim()
    .substring(0, 80);
}

function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function isValidApiKey(key) {
    if (!key || typeof key !== 'string') return false;
    const lower = key.toLowerCase().trim();
    return lower.length > 10 &&
           !lower.includes('your') &&
           !lower.includes('_here') &&
           !lower.includes('put_') &&
           !lower.includes('change') &&
           !lower.includes('xxx') &&
           !lower.includes('placeholder') &&
           lower !== 'undefined' &&
           lower !== 'null';
}

// Quick axios instance with short timeouts for speed
const fastAxios = axios.create({ timeout: 4000 });

// ========================
// FREE PUBLIC NEWS APIs (No API key needed!)
// ========================

// 1. Google News RSS via rss2json (FREE, no key needed)
async function fetchGoogleNewsRSS(category) {
    const articles = [];
    const categoryMap = {
        general: 'https://news.google.com/rss?hl=hi&gl=IN&ceid=IN:hi',
        technology: 'https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRGRqTVhZU0FtVnVHZ0pKVGlnQVAB?hl=hi&gl=IN&ceid=IN:hi',
        business: 'https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRGx6TVdZU0FtVnVHZ0pKVGlnQVAB?hl=hi&gl=IN&ceid=IN:hi',
        sports: 'https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRFp1ZEdvU0FtVnVHZ0pKVGlnQVAB?hl=hi&gl=IN&ceid=IN:hi',
        entertainment: 'https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNREpxYW5RU0FtVnVHZ0pKVGlnQVAB?hl=hi&gl=IN&ceid=IN:hi',
        health: 'https://news.google.com/rss/topics/CAAqIQgKIhtDQkFTRGdvSUwyMHZNR3QwTlRFU0FtaHBLQUFQAQ?hl=hi&gl=IN&ceid=IN:hi',
        science: 'https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRFp0YlRJU0FtVnVHZ0pKVGlnQVAB?hl=hi&gl=IN&ceid=IN:hi',
    };
    
    const rssUrl = categoryMap[category] || categoryMap.general;
    
    try {
        const res = await fastAxios.get(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`);
        if (res.data?.status === 'ok' && res.data.items?.length > 0) {
            console.log(`✅ Google News RSS: ${res.data.items.length} articles for ${category}`);
            for (const item of res.data.items.slice(0, 15)) {
                articles.push({
                    title: item.title || '',
                    summary: (item.description || '').replace(/<[^>]*>/g, '').slice(0, 200) + '...',
                    category,
                    source: item.author || 'Google News',
                    imageUrl: item.thumbnail || item.enclosure?.link || `https://picsum.photos/seed/${Math.random().toString(36).slice(2)}/800/400`,
                    status: 'published',
                    publishedAt: item.pubDate || new Date().toISOString()
                });
            }
        }
    } catch (e) {
        console.log('❌ Google RSS failed:', e.message);
    }
    return articles;
}

// 2. Currents API (FREE, no key needed for basic usage)
async function fetchCurrentsAPI(category) {
    const articles = [];
    const catMap = {
        general: 'world',
        technology: 'technology',
        business: 'business',
        sports: 'sports',
        entertainment: 'entertainment',
        health: 'health',
        science: 'science'
    };
    
    try {
        const cat = catMap[category] || 'world';
        const res = await fastAxios.get(`https://api.currentsapi.services/v1/latest-news?language=hi&category=${cat}&apiKey=null`);
        if (res.data?.news?.length > 0) {
            console.log(`✅ Currents API: ${res.data.news.length} articles`);
            for (const item of res.data.news.slice(0, 10)) {
                articles.push({
                    title: item.title || '',
                    summary: (item.description || '').slice(0, 200) + '...',
                    category,
                    source: item.author || 'Currents',
                    imageUrl: item.image || `https://picsum.photos/seed/${Math.random().toString(36).slice(2)}/800/400`,
                    status: 'published',
                    publishedAt: item.published || new Date().toISOString()
                });
            }
        }
    } catch (e) {
        // Silently fail - this is a bonus source
    }
    return articles;
}

// 3. TheNewsAPI.com (FREE tier - 3 requests/day but good data)  
async function fetchTheNewsAPI(category) {
    const articles = [];
    try {
        const catMap = { general: '', technology: '&categories=tech', business: '&categories=business', sports: '&categories=sports' };
        const catParam = catMap[category] || '';
        const res = await fastAxios.get(`https://www.theNewsApi.com/api/v1/news/top?api_token=public&locale=in&language=hi${catParam}`);
        if (res.data?.data?.length > 0) {
            for (const item of res.data.data.slice(0, 10)) {
                articles.push({
                    title: item.title, summary: item.description?.slice(0, 200) + '...',
                    category, source: item.source || 'TheNewsAPI',
                    imageUrl: item.image_url || `https://picsum.photos/seed/${Math.random().toString(36).slice(2)}/800/400`,
                    status: 'published'
                });
            }
        }
    } catch (e) { /* silent */ }
    return articles;
}

// 4. NewsAPI.org (if user has key)
async function fetchNewsAPI(category) {
    if (!isValidApiKey(process.env.NEWS_API_KEY)) return [];
    const articles = [];
    try {
        const gCat = category === 'general' ? '' : `&category=${category}`;
        const res = await fastAxios.get(`https://newsapi.org/v2/top-headlines?country=in${gCat}&pageSize=15&apiKey=${process.env.NEWS_API_KEY}`);
        if (res.data?.articles?.length > 0) {
            console.log(`✅ NewsAPI.org: ${res.data.articles.length} articles`);
            for (const a of res.data.articles.slice(0, 15)) {
                if (a.title && a.title !== '[Removed]') {
                    articles.push({
                        title: a.title, summary: a.description || a.content?.slice(0, 200) || '',
                        category, source: a.source?.name || 'NewsAPI',
                        imageUrl: a.urlToImage || `https://picsum.photos/seed/${Math.random().toString(36).slice(2)}/800/400`,
                        status: 'published',
                        publishedAt: a.publishedAt
                    });
                }
            }
        }
    } catch (e) {
        console.log('❌ NewsAPI.org failed:', e.response?.status || '', e.message);
    }
    return articles;
}

// 5. GNews.io (if user has key)
async function fetchGNews(category) {
    if (!isValidApiKey(process.env.GNEWS_API_KEY)) return [];
    const articles = [];
    try {
        const gCat = category === 'general' ? 'breaking-news' : category;
        const res = await fastAxios.get(`https://gnews.io/api/v4/top-headlines?country=in&lang=hi&topic=${gCat}&max=15&apikey=${process.env.GNEWS_API_KEY}`);
        if (res.data?.articles?.length > 0) {
            console.log(`✅ GNews.io: ${res.data.articles.length} articles`);
            for (const a of res.data.articles.slice(0, 15)) {
                articles.push({
                    title: a.title, summary: a.description || '',
                    category, source: a.source?.name || 'GNews',
                    imageUrl: a.image || `https://picsum.photos/seed/${Math.random().toString(36).slice(2)}/800/400`,
                    status: 'published',
                    publishedAt: a.publishedAt
                });
            }
        }
    } catch (e) {
        console.log('❌ GNews.io failed:', e.response?.status || '', e.message);
    }
    return articles;
}

// 6. Mediastack (if user has key)
async function fetchMediastack(category) {
    if (!isValidApiKey(process.env.MEDIASTACK_API_KEY)) return [];
    const articles = [];
    try {
        const catParam = category === 'general' ? '' : `&categories=${category}`;
        const res = await fastAxios.get(`http://api.mediastack.com/v1/news?access_key=${process.env.MEDIASTACK_API_KEY}&countries=in&languages=hi${catParam}&limit=15`);
        if (res.data?.data?.length > 0) {
            console.log(`✅ Mediastack: ${res.data.data.length} articles`);
            for (const a of res.data.data.slice(0, 15)) {
                articles.push({
                    title: a.title, summary: a.description || '',
                    category, source: a.source || 'Mediastack',
                    imageUrl: a.image || `https://picsum.photos/seed/${Math.random().toString(36).slice(2)}/800/400`,
                    status: 'published',
                    publishedAt: a.published_at
                });
            }
        }
    } catch (e) {
        console.log('❌ Mediastack failed:', e.response?.status || '', e.message);
    }
    return articles;
}

// ========================
// RICH HINDI FALLBACK DATA (Always available, per-category)
// ========================
function getHindiFallback(category) {
    const fallbacks = {
        general: [
            { title: 'ब्रेकिंग: भारत की जीडीपी 7.2% बढ़ी, अर्थव्यवस्था में तेजी', summary: 'सरकार की नई नीतियों से तेज विकास। निवेशक उत्साहित। IMF ने भी सराहा। विदेशी निवेश में 30% की बढ़ोतरी।', imageUrl: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800', source: 'नागरिक न्यूज़', category: 'general', status: 'published' },
            { title: 'मानसून अलर्ट: अगले 48 घंटे में भारी बारिश की चेतावनी', summary: 'IMD ने रेड अलर्ट जारी किया। बिहार और UP में बाढ़ का खतरा। NDRF की 15 टीमें तैनात।', imageUrl: 'https://images.unsplash.com/photo-1570912542615-179087d7c635?w=800', source: 'मौसम विभाग', category: 'general', status: 'published' },
            { title: 'लोकसभा में नया कृषि सुधार बिल पेश, विपक्ष ने किया वॉकआउट', summary: 'MSP गारंटी पर फिर बहस छिड़ी। सरकार का दावा- किसानों को मिलेगा सीधा लाभ।', imageUrl: 'https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?w=800', source: 'संसद लाइव', category: 'general', status: 'published' },
            { title: 'रेलवे ने 100 नई वंदे भारत ट्रेनें शुरू कीं', summary: 'बुलेट ट्रेन प्रोजेक्ट तेजी से आगे बढ़ रहा। जनता को सस्ती और आरामदायक यात्रा का वादा।', imageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800', source: 'रेल मंत्रालय', category: 'general', status: 'published' },
            { title: 'प्रधानमंत्री ने नई शिक्षा योजना की घोषणा की', summary: 'हर जिले में AI लैब, डिजिटल क्लासरूम और फ्री टैबलेट। 10 करोड़ छात्रों को होगा फायदा।', imageUrl: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800', source: 'शिक्षा मंत्रालय', category: 'general', status: 'published' },
            { title: 'भारत-जापान के बीच नई व्यापार संधि पर हस्ताक्षर', summary: 'दोनों देशों के बीच $50 बिलियन का व्यापार लक्ष्य। IT और ऑटोमोबाइल सेक्टर को सबसे ज्यादा फायदा।', imageUrl: 'https://images.unsplash.com/photo-1521295121783-8a321d551ad2?w=800', source: 'विदेश मंत्रालय', category: 'general', status: 'published' },
            { title: 'दिल्ली मेट्रो का नया कॉरिडोर शुरू, यात्रियों में उत्साह', summary: 'नोएडा से गुरुग्राम सीधी कनेक्टिविटी। रोजाना 5 लाख यात्रियों को होगा फायदा।', imageUrl: 'https://images.unsplash.com/photo-1556388158-158ea5ccacbd?w=800', source: 'DMRC', category: 'general', status: 'published' },
        ],
        technology: [
            { title: 'इसरो का नया 5G सैटेलाइट लॉन्च सफल रहा', summary: 'ग्रामीण क्षेत्रों में तेज इंटरनेट पहुंचेगा। Jio और AirTel को मिलेगा सीधा फायदा।', imageUrl: 'https://images.unsplash.com/photo-1558618047-3c8c76fdd9e4?w=800', source: 'ISRO', category: 'technology', status: 'published' },
            { title: 'AI ने कोविड का नया वैरिएंट 72 घंटे में पकड़ा', summary: 'गूगल AI की मदद से जल्दी पता चला। वैक्सीन की तैयारी शुरू हो गई है।', imageUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800', source: 'AI लैब', category: 'technology', status: 'published' },
            { title: 'भारत का पहला क्वांटम कंप्यूटर IIT मद्रास ने बनाया', summary: 'साइबर सिक्योरिटी में क्रांति आएगी। 1000 क्यूबिट्स की क्षमता।', imageUrl: 'https://images.unsplash.com/photo-1632798735800-b96a456e8d44?w=800', source: 'IIT Madras', category: 'technology', status: 'published' },
            { title: 'ChatGPT-5 लॉन्च: अब हिंदी में भी बात करेगा AI', summary: 'OpenAI ने बड़ा अपडेट जारी किया। भारतीय भाषाओं में बेहतर सपोर्ट।', imageUrl: 'https://images.unsplash.com/photo-1655720828018-edd2daec9349?w=800', source: 'OpenAI', category: 'technology', status: 'published' },
            { title: 'UPI ने तोड़ा रिकॉर्ड: एक महीने में 20 अरब ट्रांजैक्शन', summary: 'डिजिटल पेमेंट में भारत दुनिया में नंबर 1। विदेशी कंपनियां भी अपना रही हैं UPI।', imageUrl: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800', source: 'NPCI', category: 'technology', status: 'published' },
            { title: '5G स्पीड टेस्ट: भारत में अब 1Gbps इंटरनेट संभव', summary: 'मुंबई और दिल्ली में सबसे तेज स्पीड। Jio और Airtel में कड़ी टक्कर।', imageUrl: 'https://images.unsplash.com/photo-1613878801497-3f1569cd8b82?w=800', source: 'TRAI', category: 'technology', status: 'published' },
        ],
        business: [
            { title: 'सेंसेक्स 82,000 पार, नई रिकॉर्ड ऊंचाई पर', summary: 'IT शेयरों में जबरदस्त तेजी। FII ने 20,000 करोड़ रुपये लगाए।', imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800', source: 'BSE/NSE', category: 'business', status: 'published' },
            { title: 'टाटा का EV प्लांट गुजरात में ₹5000 करोड़ का निवेश', summary: '2 लाख नई नौकरियां मिलेंगी। 2026 तक 1 लाख Nexon EV का उत्पादन।', imageUrl: 'https://images.unsplash.com/photo-1494905998402-395d579af36f?w=800', source: 'टाटा मोटर्स', category: 'business', status: 'published' },
            { title: 'अंबानी की Jio Financial Services का शेयर 50% उछला', summary: 'डिजिटल बैंकिंग में नई क्रांति। 10 करोड़ ग्राहकों का टारगेट।', imageUrl: 'https://images.unsplash.com/photo-1613878801497-3f1569cd8b82?w=800', source: 'Jio', category: 'business', status: 'published' },
            { title: 'रुपया डॉलर के मुकाबले मजबूत: 82 पर आया', summary: 'FII निवेश बढ़ने से रुपये को मिली ताकत। तेल कीमतों में गिरावट से भी राहत।', imageUrl: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=800', source: 'RBI', category: 'business', status: 'published' },
            { title: 'Zomato-Swiggy मर्जर की खबर: $20 बिलियन की डील संभव', summary: 'फूड डिलीवरी मार्केट में बड़ा बदलाव आ सकता है। CCI की मंजूरी का इंतजार।', imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800', source: 'इकोनॉमिक टाइम्स', category: 'business', status: 'published' },
            { title: 'भारतीय स्टार्टअप्स ने 2026 में $10B फंडिंग जुटाई', summary: 'AI और फिनटेक सेक्टर में सबसे ज्यादा निवेश। 15 नए यूनिकॉर्न बने।', imageUrl: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800', source: 'VCCircle', category: 'business', status: 'published' },
        ],
        sports: [
            { title: 'IND vs AUS T20: भारत ने 8 विकेट से धमाकेदार जीत दर्ज की', summary: 'रोहित शर्मा ने खेली शानदार 80* रनों की पारी। बुमराह ने 4/20 से की तबाही।', imageUrl: 'https://images.unsplash.com/photo-1553778263-73a71fd1a330?w=800', source: 'BCCI', category: 'sports', status: 'published' },
            { title: 'IPL 2026 मेगा ऑक्शन: कोहली ₹18 करोड़ में RCB के साथ', summary: 'हार्दिक पांड्या को मिली MI की कप्तानी। 5 नए अनकैप्ड सितारों पर लगी बड़ी बोली।', imageUrl: 'https://images.unsplash.com/photo-1535374146908-c0a8f7a34147?w=800', source: 'IPL', category: 'sports', status: 'published' },
            { title: 'साइना नेहवाल का शानदार कमबैक, ऑल इंग्लैंड जीता', summary: 'बैडमिंटन क्वीन की जबरदस्त वापसी। अब ओलंपिक गोल्ड पर है निशाना।', imageUrl: 'https://images.unsplash.com/photo-1596201952372-708fb6ca584f?w=800', source: 'BAI', category: 'sports', status: 'published' },
            { title: 'नीरज चोपड़ा ने एशियन गेम्स में गोल्ड जीता', summary: '90 मीटर से ज्यादा का थ्रो। भारत को एथलेटिक्स में एक और गोल्ड मेडल दिलाया।', imageUrl: 'https://images.unsplash.com/photo-1461896836934-bd45ba8fcf9b?w=800', source: 'AFI', category: 'sports', status: 'published' },
            { title: 'भारतीय हॉकी टीम ने ऑस्ट्रेलिया को 3-1 से हराया', summary: 'प्रो हॉकी लीग में शानदार प्रदर्शन। गोलकीपर श्रीजेश ने बचाए 10 शॉट्स।', imageUrl: 'https://images.unsplash.com/photo-1580748142319-e28e1e02c9bc?w=800', source: 'Hockey India', category: 'sports', status: 'published' },
            { title: 'FIFA U-20 वर्ल्ड कप में भारत का पहली बार प्रवेश', summary: 'ऐतिहासिक क्षण! एशियाई क्वालीफाइंग में जापान को हराकर जगह पक्की की।', imageUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800', source: 'AIFF', category: 'sports', status: 'published' },
        ],
        entertainment: [
            { title: 'शाहरुख खान की नई फिल्म ने तोड़े बॉक्स ऑफिस रिकॉर्ड', summary: 'पहले हफ्ते में ₹300 करोड़ की कमाई। दुनिया भर में बॉलीवुड का जलवा।', imageUrl: 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=800', source: 'बॉलीवुड न्यूज़', category: 'entertainment', status: 'published' },
            { title: 'AR रहमान ने ग्रैमी अवार्ड्स में तीसरा अवार्ड जीता', summary: 'भारतीय संगीत दुनिया भर में गूंजा। "जय हो 2.0" गाने को मिला बेस्ट वर्ल्ड म्यूजिक अवार्ड।', imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800', source: 'म्यूजिक टाइम्स', category: 'entertainment', status: 'published' },
            { title: 'OTT प्लेटफॉर्म्स पर हिंदी कंटेंट की डिमांड 200% बढ़ी', summary: 'Netflix, Amazon Prime और JioCinema पर भारतीय शो दुनिया भर में देखे जा रहे हैं।', imageUrl: 'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=800', source: 'OTT इंडिया', category: 'entertainment', status: 'published' },
        ],
        health: [
            { title: 'आयुष्मान भारत योजना का विस्तार: अब 70 साल तक के बुजुर्गों को कवर', summary: '₹5 लाख तक का मुफ्त इलाज। 50 करोड़ नए लाभार्थी जुड़ेंगे। PM ने की घोषणा।', imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800', source: 'स्वास्थ्य मंत्रालय', category: 'health', status: 'published' },
            { title: 'AIIMS में रोबोटिक सर्जरी शुरू, मरीजों को मिलेगी बेहतर सुविधा', summary: 'अमेरिका से आए एडवांस रोबोट से होगी सर्जरी। लागत में 40% की कमी का अनुमान।', imageUrl: 'https://images.unsplash.com/photo-1551190822-a9333d879b1f?w=800', source: 'AIIMS', category: 'health', status: 'published' },
            { title: 'योग दिवस 2026: UN ने भारत की पहल को सराहा', summary: '180 देशों में योग दिवस मनाया गया। PM ने कहा- योग दुनिया को भारत का सबसे बड़ा तोहफा।', imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800', source: 'PIB', category: 'health', status: 'published' },
        ],
        science: [
            { title: 'चंद्रयान-4 मिशन की तैयारी पूरी, अगले साल लॉन्च', summary: 'इस बार चांद से मिट्टी के सैंपल लाएगा भारत। बजट ₹2000 करोड़ मंजूर।', imageUrl: 'https://images.unsplash.com/photo-1614642264762-d0a3b8bf3700?w=800', source: 'ISRO', category: 'science', status: 'published' },
            { title: 'IISc बेंगलुरु ने कैंसर की नई दवा खोजी', summary: 'क्लीनिकल ट्रायल में 80% सफलता दर। 2027 तक बाजार में आ सकती है।', imageUrl: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=800', source: 'IISc', category: 'science', status: 'published' },
            { title: 'मंगल ग्रह पर पानी मिलने के नए सबूत: NASA', summary: 'Mars Rover ने भेजे नए डेटा। वैज्ञानिकों का मानना - जीवन की संभावना बढ़ी।', imageUrl: 'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?w=800', source: 'NASA', category: 'science', status: 'published' },
        ]
    };

    return shuffleArray(fallbacks[category] || fallbacks.general);
}

// ========================
// MAIN: FETCH ALL NEWS (PARALLEL + FAST)
// ========================
async function fetchExternalNews(category) {
    // Check cache first
    const cached = getCachedNews(category);
    if (cached) return cached;

    const startTime = Date.now();
    
    // Always start with Hindi fallback data (immediately available)
    let allNews = [...getHindiFallback(category)];

    // Log which API keys are configured
    console.log(`\n🔍 Fetching news for "${category}"...`);
    console.log(`  NewsAPI key: ${isValidApiKey(process.env.NEWS_API_KEY) ? '✅ configured' : '⏭️ not set'}`);
    console.log(`  GNews key: ${isValidApiKey(process.env.GNEWS_API_KEY) ? '✅ configured' : '⏭️ not set'}`);
    console.log(`  Mediastack key: ${isValidApiKey(process.env.MEDIASTACK_API_KEY) ? '✅ configured' : '⏭️ not set'}`);

    // Fire ALL API calls in parallel (fastest possible)
    const results = await Promise.allSettled([
        fetchGoogleNewsRSS(category),
        fetchNewsAPI(category),
        fetchGNews(category),
        fetchMediastack(category),
        fetchCurrentsAPI(category),
    ]);

    // Collect all results
    for (const result of results) {
        if (result.status === 'fulfilled' && result.value?.length > 0) {
            allNews.push(...result.value);
        }
    }

    // Deduplicate by normalized title
    const titleSet = new Set();
    const uniqueNews = [];
    for (const article of allNews) {
        if (!article.title) continue;
        const key = normalizeTitle(article.title);
        if (key && !titleSet.has(key)) {
            titleSet.add(key);
            uniqueNews.push(article);
        }
    }

    const finalNews = shuffleArray(uniqueNews).slice(0, 50);
    
    // Cache the results
    setCachedNews(category, finalNews);
    
    const elapsed = Date.now() - startTime;
    console.log(`⚡ Fetched ${finalNews.length} unique articles in ${elapsed}ms\n`);

    return finalNews;
}

// ========================
// SEARCH ROUTE (for search functionality)
// ========================
router.get('/search', async (req, res) => {
    try {
        const { q = '' } = req.query;
        if (!q.trim()) return res.json({ articles: [] });
        
        // Search in DB first
        let dbResults = [];
        try {
            dbResults = await News.find({
                $or: [
                    { title: { $regex: q, $options: 'i' } },
                    { summary: { $regex: q, $options: 'i' } },
                    { content: { $regex: q, $options: 'i' } }
                ],
                status: 'published'
            }).sort({ createdAt: -1 }).limit(20);
        } catch(e) {}

        // Also search in cached/fallback news
        const allCats = ['general', 'technology', 'business', 'sports', 'entertainment', 'health', 'science'];
        const allFallback = allCats.flatMap(cat => getHindiFallback(cat));
        const matched = allFallback.filter(a => 
            a.title?.toLowerCase().includes(q.toLowerCase()) ||
            a.summary?.toLowerCase().includes(q.toLowerCase())
        );

        const combined = shuffleArray([...dbResults, ...matched]).slice(0, 30);
        res.json({ articles: combined });
    } catch (error) {
        console.error('Search error:', error);
        res.json({ articles: [] });
    }
});

// ========================
// TRENDING ROUTE  
// ========================
router.get('/trending', async (req, res) => {
    try {
        const news = await fetchExternalNews('general');
        res.json({ articles: news.slice(0, 20) });
    } catch (error) {
        res.json({ articles: getHindiFallback('general') });
    }
});

// ========================
// MAIN FEED ROUTE
// ========================
router.get('/feed', async (req, res) => {
    try {
        const { category = 'general' } = req.query;
        
        res.set('Cache-Control', 'public, max-age=300'); // 5 min browser cache
        
        const news = await fetchExternalNews(category);
        
        // Also fetch from MongoDB if available
        let internalNews = [];
        try {
            internalNews = await News.find({ status: 'published' }).sort({ createdAt: -1 }).limit(10);
        } catch(e) {}

        const feed = shuffleArray([...internalNews, ...news]);
        
        console.log(`📢 Serving ${feed.length} articles for "${category}"`);
        res.json({ articles: feed });
    } catch (error) {
        console.error('Feed error:', error.message);
        res.json({ articles: getHindiFallback('general') });
    }
});

// ========================
// CMS ROUTES
// ========================
let inMemoryArticles = [];

router.post('/create', async (req, res) => {
    try {
        const { title, content, category, imageUrl, source, status } = req.body;
        const summary = content.substring(0, 100) + '...';
        const article = new News({ title, content, summary, category, imageUrl, source, status });
        inMemoryArticles.unshift({ ...article.toObject(), _id: Date.now().toString(), createdAt: new Date() });
        try { await article.save(); } catch(e) {}
        // Clear cache so new articles appear immediately
        newsCache.clear();
        res.status(201).json({ msg: "Article saved", article });
    } catch (err) {
        res.status(500).json({ msg: "Server Error" });
    }
});

router.get('/cms/articles', async (req, res) => {
    try {
        const articles = await News.find().sort({ createdAt: -1 });
        res.json(articles.length > 0 ? articles : inMemoryArticles.length > 0 ? inMemoryArticles : []);
    } catch (err) {
        res.json(inMemoryArticles);
    }
});

router.delete('/cms/delete/:id', async (req, res) => {
    const id = req.params.id;
    inMemoryArticles = inMemoryArticles.filter(a => a._id !== id);
    try { await News.findByIdAndDelete(id); } catch(e) {}
    newsCache.clear();
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
        newsCache.clear();
        res.json({ msg: "Updated", article: dbArticle || inMemoryArticles[memoryIndex] });
    } catch(e) {
        res.json({ msg: "Updated", article: inMemoryArticles[memoryIndex] });
    }
});

module.exports = router;
