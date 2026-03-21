import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, Clock, MessageCircle, Share2, BotMessageSquare, ThumbsUp } from "lucide-react";
import { motion } from "framer-motion";
import API_BASE_URL from "../config/api";

export default function ArticleDetail() {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch article by ID from /feed (filter by _id)
    axios.get(`${API_BASE_URL}/api/news/feed`)
      .then(res => {
        const found = res.data.articles.find(a => a._id === id || a.id === id);
        if (found) {
          setArticle(found);
        } else {
          // Fallback demo
          setArticle({
            title: 'नागरिक न्यूज - विविध समाचार',
            content: 'यह एक डेमो आर्टिकल है। सभी श्रेणियों से ताज़ा ख़बरें। नागरिक न्यूज आपके लिए हमेशा लाता रहेगा विश्वसनीय समाचार।',
            summary: 'डेमो सारांश - विविध समाचार अपडेट्स।',
            category: 'general',
            imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&q=80',
            source: 'नागरिक न्यूज'
          });
        }
        setLoading(false);
      })
      .catch(() => {
        setArticle({
          title: 'कनेक्शन त्रुटि',
          content: 'समाचार लोड करने में समस्या। कृपया पुनः प्रयास करें।',
          summary: 'त्रुटि',
          category: 'general',
          imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&q=80',
          source: 'नागरिक न्यूज'
        });
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl mx-auto bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-gray-100 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-500 font-semibold">खबर लोड हो रही है...</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto bg-white dark:bg-gray-900 p-4 sm:p-8 md:p-12 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 mb-16">
      <Link to="/" className="text-gray-500 hover:text-red-600 font-bold flex items-center gap-2 mb-8 text-sm transition-colors inline-block">
        <ArrowLeft className="w-4 h-4" /> वापस होम पर
      </Link>
      
      <div className="flex flex-wrap items-center gap-3 mb-6 pb-6 border-b border-gray-100 dark:border-gray-700">
        <span className="bg-red-600 text-white text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-wider shadow-md">
          {article.category}
        </span>
        <span className="text-gray-400 text-sm font-semibold flex items-center gap-1">
          <Clock className="w-4 h-4" /> २ घंटे पहले प्रकाशित
        </span>
      </div>

      <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 dark:text-white leading-[1.1] mb-8 tracking-tight">
        {article.title}
      </h1>

      {/* AI Summary Banner */}
      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 to-blue-900/20 border border-indigo-100 dark:border-indigo-800 rounded-2xl p-6 mb-10 flex gap-4 shadow-sm">
        <div className="flex-shrink-0 mt-1">
          <BotMessageSquare className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div>
          <h3 className="text-indigo-900 dark:text-indigo-100 font-bold mb-2 flex items-center gap-2 text-sm md:text-base">🤖 AI सारांश <span className="text-[10px] bg-indigo-600 dark:bg-indigo-400 text-white px-2 py-0.5 rounded-md uppercase tracking-wider shadow-sm">Beta</span></h3>
          <p className="text-indigo-800 dark:text-indigo-200 font-medium leading-loose text-sm md:text-base">{article.summary}</p>
        </div>
      </div>

      {/* Featured Image/Video */}
      <div className="mb-10 rounded-2xl overflow-hidden shadow-xl">
        {(article.imageUrl || '').match(/\.(mp4|webm|ogg)$/i) ? (
          <video 
            src={article.imageUrl} 
            controls 
            autoPlay 
            muted 
            loop 
            className="w-full aspect-video object-cover"
          />
        ) : (
          <img 
            src={article.imageUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&q=80'} 
            alt={article.title}
            className="w-full aspect-video object-cover"
          />
        )}
      </div>

      {/* Full Content */}
      <div className="prose prose-lg prose-slate dark:prose-invert max-w-none font-medium leading-loose mb-12">
        <div dangerouslySetInnerHTML={{ __html: article.content }} />
      </div>

      {/* Author & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pt-8 border-t border-gray-100 dark:border-gray-700 pb-12">
        <div className="flex items-center gap-3 flex-1">
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-red-600 to-orange-400 flex items-center justify-center text-white font-bold text-lg shadow-md ring-2 ring-white">
            NN
          </div>
          <div>
            <p className="font-bold text-gray-900 dark:text-white leading-tight text-sm md:text-base">{article.source || 'नागरिक संपादक'}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">प्रकाशित: आज</p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-gray-400 flex-wrap">
          <button className="flex items-center gap-2 font-bold hover:text-blue-600 transition-colors bg-gray-50 dark:bg-gray-800 px-4 py-2 rounded-xl" onClick={() => alert('लाइक सेव!')}>
            <ThumbsUp className="w-4 h-4" /> लाइक (12k)
          </button>
          <button className="flex items-center gap-2 font-bold hover:text-green-600 transition-colors bg-gray-50 dark:bg-gray-800 px-4 py-2 rounded-xl" onClick={() => navigator.share({title: article.title, url: window.location.href})}>
            <Share2 className="w-4 h-4" /> शेयर करें
          </button>
          <button className="flex items-center gap-2 font-bold hover:text-indigo-600 transition-colors bg-gray-50 dark:bg-gray-800 px-4 py-2 rounded-xl">
            <MessageCircle className="w-4 h-4" /> कमेंट (45)
          </button>
        </div>
      </div>

      <div className="text-center py-12 border-t border-gray-100 dark:border-gray-700">
        <p className="text-gray-500 dark:text-gray-400 text-sm">अधिक समाचार नागरिक न्यूज ऐप पर देखें</p>
      </div>
    </motion.div>
  );
}

