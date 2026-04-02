import { useEffect, useState } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, Clock, MessageCircle, Share2, BotMessageSquare, ThumbsUp, Bookmark, ExternalLink, Newspaper, TrendingUp, Eye } from "lucide-react";
import { motion } from "framer-motion";
import API_BASE_URL from "../config/api";

// Generate detailed content paragraphs from summary and title
function generateDetailedContent(article) {
  const title = article.title || '';
  const summary = article.summary || article.content || '';
  const source = article.source || 'नागरिक न्यूज़';
  const category = article.category || 'general';
  
  // If there's already detailed content (from DB articles), use it
  if (article.content && article.content.length > 300) {
    return article.content;
  }

  // Generate rich, newspaper-style paragraphs from the summary
  const cleanSummary = summary.replace(/<[^>]*>/g, '').replace(/\.\.\.$/, '').trim();
  
  // Category-specific contextual additions
  const categoryContext = {
    general: {
      context: 'यह ख़बर आज की प्रमुख खबरों में शामिल है। विशेषज्ञों का मानना है कि इस घटनाक्रम का आने वाले दिनों में व्यापक प्रभाव पड़ सकता है।',
      analysis: 'राजनीतिक विश्लेषकों और सामाजिक विशेषज्ञों ने इस विषय पर अपने विचार व्यक्त किए हैं। उनका मानना है कि यह भारत के भविष्य के लिए एक महत्वपूर्ण मोड़ साबित हो सकता है।',
      impact: 'इस घटना का प्रभाव पूरे देश में महसूस किया जा रहा है। सोशल मीडिया पर भी यह ख़बर तेजी से वायरल हो रही है और लोग अपनी राय साझा कर रहे हैं।'
    },
    technology: {
      context: 'तकनीकी क्षेत्र में यह एक बड़ी खबर है। भारत के IT सेक्टर और स्टार्टअप इकोसिस्टम पर इसका सीधा असर पड़ सकता है।',
      analysis: 'टेक्नोलॉजी विशेषज्ञों का कहना है कि यह विकास डिजिटल इंडिया मिशन को और मजबूत करेगा। AI, ML और क्लाउड कंप्यूटिंग के क्षेत्र में भारत तेजी से आगे बढ़ रहा है।',
      impact: 'इस तकनीकी प्रगति से करोड़ों भारतीयों को लाभ मिलने की उम्मीद है। विशेषकर ग्रामीण क्षेत्रों में डिजिटल सेवाओं तक पहुंच बेहतर होगी।'
    },
    business: {
      context: 'बाजार विशेषज्ञों ने इस खबर पर तत्काल प्रतिक्रिया दी है। सेंसेक्स और निफ्टी दोनों ने इस खबर के बाद तेजी दर्ज की।',
      analysis: 'आर्थिक विश्लेषकों का मानना है कि भारत की अर्थव्यवस्था मजबूत दौर से गुज़र रही है। FDI और FII दोनों में लगातार वृद्धि हो रही है।',
      impact: 'व्यापार जगत में इस खबर का व्यापक प्रभाव पड़ा है। MSME और स्टार्टअप सेक्टर को भी इससे फायदा होने की उम्मीद है।'
    },
    sports: {
      context: 'खेल जगत में यह खबर तहलका मचा रही है। पूरे देश के क्रिकेट और खेल प्रेमी इस पर चर्चा कर रहे हैं।',
      analysis: 'खेल विशेषज्ञों का मानना है कि भारतीय खिलाड़ियों का यह प्रदर्शन अंतरराष्ट्रीय स्तर पर भारत की साख को और मज़बूत करेगा।',
      impact: 'इस सफलता से युवा खिलाड़ियों को प्रेरणा मिलेगी। सरकार ने भी खेल बजट बढ़ाने की घोषणा की है जिससे भविष्य में और बेहतर प्रदर्शन की उम्मीद है।'
    },
    entertainment: {
      context: 'मनोरंजन जगत में यह खबर तेजी से फैल रही है। सोशल मीडिया पर फैंस जमकर अपनी प्रतिक्रियाएं दे रहे हैं।',
      analysis: 'बॉलीवुड एक्सपर्ट्स का मानना है कि यह भारतीय सिनेमा और कलाकारों के लिए गर्व का क्षण है।',
      impact: 'इस घटना का भारतीय मनोरंजन उद्योग पर गहरा प्रभाव पड़ेगा। OTT प्लेटफॉर्म्स और बॉक्स ऑफिस दोनों में बदलाव देखने को मिल सकता है।'
    },
    health: {
      context: 'स्वास्थ्य क्षेत्र के विशेषज्ञों ने इस खबर को बहुत महत्वपूर्ण बताया है। WHO ने भी भारत की इस पहल की सराहना की है।',
      analysis: 'डॉक्टरों और सार्वजनिक स्वास्थ्य विशेषज्ञों का मानना है कि इससे भारत की स्वास्थ्य व्यवस्था में सुधार आएगा।',
      impact: 'गांवों और छोटे शहरों तक इसका फायदा पहुंचेगा। आयुष्मान भारत जैसी योजनाओं के साथ मिलकर यह और प्रभावी होगा।'
    },
    science: {
      context: 'वैज्ञानिक समुदाय में यह खबर उत्साह पैदा कर रही है। ISRO, DRDO और अन्य संस्थानों ने इस उपलब्धि पर बधाई दी है।',
      analysis: 'विज्ञान विशेषज्ञों का कहना है कि यह खोज/विकास भारत को विज्ञान और अनुसंधान के क्षेत्र में वैश्विक नेता बनाने की दिशा में एक और कदम है।',
      impact: 'भविष्य में इस शोध के आधार पर और भी महत्वपूर्ण खोजें हो सकती हैं। सरकार ने R&D बजट बढ़ाने का संकेत दिया है।'
    }
  };

  const ctx = categoryContext[category] || categoryContext.general;

  // Build rich content
  const paragraphs = [
    `<p class="text-lg font-semibold text-gray-800 dark:text-gray-200 leading-relaxed mb-6">${cleanSummary}</p>`,
    
    `<h2 class="text-2xl font-black text-gray-900 dark:text-white mt-8 mb-4 flex items-center gap-2">📋 विस्तृत विवरण</h2>`,
    `<p class="text-gray-700 dark:text-gray-300 leading-loose mb-6">${ctx.context}</p>`,
    
    `<h2 class="text-2xl font-black text-gray-900 dark:text-white mt-8 mb-4 flex items-center gap-2">🔍 विशेषज्ञ विश्लेषण</h2>`,
    `<p class="text-gray-700 dark:text-gray-300 leading-loose mb-6">${ctx.analysis}</p>`,
    
    `<div class="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 p-4 rounded-r-xl my-8">
      <p class="text-amber-800 dark:text-amber-200 font-semibold italic">"${title}" - इस खबर पर सभी की नज़र बनी हुई है।</p>
      <p class="text-amber-600 dark:text-amber-300 text-sm mt-2">— ${source}</p>
    </div>`,
    
    `<h2 class="text-2xl font-black text-gray-900 dark:text-white mt-8 mb-4 flex items-center gap-2">📊 प्रभाव और आगे की राह</h2>`,
    `<p class="text-gray-700 dark:text-gray-300 leading-loose mb-6">${ctx.impact}</p>`,
    
    `<div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6 my-8">
      <h3 class="text-blue-900 dark:text-blue-200 font-bold mb-3">📰 मुख्य बातें:</h3>
      <ul class="list-disc list-inside text-blue-800 dark:text-blue-300 space-y-2">
        <li>${cleanSummary.split(/।|\./).filter(s => s.trim().length > 5).slice(0, 3).join('</li><li>') || cleanSummary}</li>
        <li>विशेषज्ञों ने दी अपनी राय</li>
        <li>आने वाले दिनों में और अपडेट्स संभावित</li>
      </ul>
    </div>`,
    
    `<p class="text-gray-600 dark:text-gray-400 leading-loose mb-6 italic">नागरिक न्यूज़ इस खबर पर नज़र रख रहा है और आने वाले समय में और जानकारी उपलब्ध होने पर अपडेट करेगा। बने रहिए हमारे साथ।</p>`
  ];

  return paragraphs.join('\n');
}

// Calculate reading time
function getReadingTime(text) {
  const words = (text || '').replace(/<[^>]*>/g, '').split(/\s+/).length;
  const minutes = Math.max(2, Math.ceil(words / 200));
  return `${minutes} मिनट पढ़ने का समय`;
}

export default function ArticleDetail() {
  const { id } = useParams();
  const location = useLocation();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedArticles, setRelatedArticles] = useState([]);
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  const [extractedContent, setExtractedContent] = useState(null);
  const [extracting, setExtracting] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    
    // First: try to get article from router state (passed from NewsCard)
    if (location.state?.article) {
      setArticle(location.state.article);
      setLoading(false);
      fetchRelated(location.state.article.category);
      return;
    }

    // Fallback: fetch from API
    axios.get(`${API_BASE_URL}/api/news/feed`)
      .then(res => {
        const articles = res.data.articles || [];
        // Try to find by _id or generated id
        const found = articles.find(a => {
          const genId = btoa(encodeURIComponent(a.title || '')).slice(0, 20);
          return a._id === id || genId === id;
        });
        
        if (found) {
          setArticle(found);
          fetchRelated(found.category);
        } else if (articles.length > 0) {
          // Use first article as fallback
          setArticle(articles[0]);
          fetchRelated(articles[0].category);
        } else {
          setArticle({
            title: 'ख़बर उपलब्ध नहीं',
            summary: 'यह ख़बर अभी उपलब्ध नहीं है। कृपया होम पेज पर जाएं और कोई अन्य ख़बर चुनें।',
            category: 'general',
            imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&q=80',
            source: 'नागरिक न्यूज़'
          });
        }
        setLoading(false);
      })
      .catch(() => {
        setArticle({
          title: 'कनेक्शन में समस्या',
          summary: 'समाचार सर्वर से कनेक्ट नहीं हो पा रहा। कृपया इंटरनेट कनेक्शन जांचें और पुनः प्रयास करें।',
          category: 'general',
          imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&q=80',
          source: 'नागरिक न्यूज़'
        });
        setLoading(false);
      });
  }, [id, location.state]);

  // Try to extract content if we have an original URL
  useEffect(() => {
    if (article?.originalUrl) {
      setExtracting(true);
      axios.get(`${API_BASE_URL}/api/news/extract?url=${encodeURIComponent(article.originalUrl)}`)
        .then(res => {
          if (res.data?.content) {
            setExtractedContent(res.data.content);
          }
        })
        .catch(err => {
          console.log("Could not extract full content", err);
        })
        .finally(() => setExtracting(false));
    }
  }, [article?.originalUrl]);

  const fetchRelated = (category) => {
    axios.get(`${API_BASE_URL}/api/news/feed?category=${category || 'general'}`)
      .then(res => {
        const articles = (res.data.articles || []).filter(a => a.title !== article?.title);
        setRelatedArticles(articles.slice(0, 4));
      })
      .catch(() => {});
  };

  if (loading) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-red-200 border-t-red-600 mx-auto mb-4"></div>
          <p className="text-gray-500 dark:text-gray-400 font-semibold">ख़बर लोड हो रही है...</p>
        </div>
      </motion.div>
    );
  }

  const detailedContent = generateDetailedContent(article);
  const readingTime = getReadingTime(detailedContent);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto mb-16">
      {/* Back Button */}
      <Link to="/" className="text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-500 font-bold flex items-center gap-2 mb-6 text-sm transition-colors">
        <ArrowLeft className="w-4 h-4" /> वापस होम पर
      </Link>

      {/* Main Article Card */}
      <article className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-lg overflow-hidden">
        
        {/* Featured Image */}
        <div className="relative">
          {(article.imageUrl || '').match(/\.(mp4|webm|ogg)$/i) ? (
            <video src={article.imageUrl} controls autoPlay muted loop className="w-full aspect-video object-cover" />
          ) : (
            <img 
              src={article.imageUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&q=80'} 
              alt={article.title}
              className="w-full aspect-[21/9] object-cover"
              onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&q=80'; }}
            />
          )}
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          
          {/* Category Badge on Image */}
          <div className="absolute top-6 left-6 flex gap-2">
            <span className="bg-red-600 text-white text-xs font-black px-4 py-2 rounded-full uppercase tracking-wider shadow-lg">
              {article.category}
            </span>
            <span className="bg-indigo-600/90 backdrop-blur-sm text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg flex items-center gap-1">
              <BotMessageSquare className="w-3 h-3" /> AI विश्लेषण
            </span>
          </div>

          {/* Source on Image */}
          <div className="absolute bottom-6 left-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-red-600 to-orange-400 flex items-center justify-center text-white font-bold text-sm shadow-lg ring-2 ring-white/30">
                NN
              </div>
              <div>
                <p className="text-white font-bold text-sm">{article.source || 'नागरिक न्यूज़'}</p>
                <p className="text-white/70 text-xs">{article.publishedAt ? new Date(article.publishedAt).toLocaleDateString('hi-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : 'आज प्रकाशित'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6 sm:p-8 md:p-12">
          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-4 mb-6 text-sm text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1.5 font-medium">
              <Clock className="w-4 h-4" /> {readingTime}
            </span>
            <span className="flex items-center gap-1.5 font-medium text-green-600 dark:text-green-400">
              <Eye className="w-4 h-4" /> {Math.floor(Math.random() * 50 + 10)}K+ पाठक
            </span>
            <span className="flex items-center gap-1.5 font-medium text-blue-600 dark:text-blue-400">
              <TrendingUp className="w-4 h-4" /> ट्रेंडिंग
            </span>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 dark:text-white leading-[1.15] mb-8 tracking-tight">
            {article.title}
          </h1>

          {/* AI Summary Box */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-950/40 dark:to-blue-950/40 border border-indigo-200 dark:border-indigo-800 rounded-2xl p-6 mb-10 shadow-sm"
          >
            <div className="flex gap-4">
              <div className="flex-shrink-0 mt-0.5">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-md">
                  <BotMessageSquare className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-indigo-900 dark:text-indigo-200 font-bold mb-2 flex items-center gap-2">
                  🤖 AI सारांश 
                  <span className="text-[10px] bg-indigo-600 text-white px-2 py-0.5 rounded-md uppercase tracking-wider">Beta</span>
                </h3>
                <p className="text-indigo-800 dark:text-indigo-200 font-medium leading-relaxed">
                  {(article.summary || article.content || '').replace(/<[^>]*>/g, '').replace(/\.\.\.$/, '').trim()}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Divider */}
          <div className="border-t border-gray-200 dark:border-gray-700 mb-10"></div>

          {/* Full Detailed Content */}
          {extracting ? (
            <div className="flex justify-center items-center py-12 mb-12">
               <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
               <span className="ml-4 text-gray-500 font-bold">पूरी ख़बर लोड हो रही है...</span>
            </div>
          ) : extractedContent ? (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="article-content prose prose-lg prose-slate dark:prose-invert max-w-none mb-12"
            >
               <h2 className="text-2xl font-black text-gray-900 dark:text-white mt-8 mb-4 flex items-center gap-2">📋 विस्तृत रिपोर्ट</h2>
               {extractedContent.split('\n\n').map((para, i) => (
                  <p key={i} className="mb-6 leading-loose text-gray-800 dark:text-gray-200">{para}</p>
               ))}
               <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 p-4 rounded-r-xl my-8">
                <p className="text-amber-800 dark:text-amber-200 font-semibold italic">यह पूरी ख़बर स्रोत <a href={article.originalUrl} target="_blank" rel="noreferrer" className="underline">{article.source || 'मूल साइट'}</a> से ली गई है।</p>
               </div>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              transition={{ delay: 0.3 }}
              className="article-content prose prose-lg prose-slate dark:prose-invert max-w-none mb-12"
            >
              <div 
                dangerouslySetInnerHTML={{ __html: detailedContent }} 
                className="leading-loose text-gray-800 dark:text-gray-200 [&>h2]:text-gray-900 dark:[&>h2]:text-white [&>p]:mb-6 [&>p]:leading-loose"
              />
            </motion.div>
          )}

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-8">
            {[article.category, 'भारत', 'ताज़ा ख़बर', 'नागरिक न्यूज़'].filter(Boolean).map((tag, i) => (
              <span key={i} className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-xs font-bold px-4 py-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer">
                #{tag}
              </span>
            ))}
          </div>

          {/* Actions Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-6 border-t border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-red-600 to-orange-400 flex items-center justify-center text-white font-bold text-lg shadow-md ring-2 ring-white dark:ring-gray-900">
                NN
              </div>
              <div>
                <p className="font-bold text-gray-900 dark:text-white">{article.source || 'नागरिक संपादक'}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {article.publishedAt ? new Date(article.publishedAt).toLocaleDateString('hi-IN', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'आज प्रकाशित'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <button 
                onClick={() => setLiked(!liked)}
                className={`flex items-center gap-2 font-bold px-5 py-2.5 rounded-xl transition-all ${liked ? 'bg-red-600 text-white shadow-lg' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600'}`}
              >
                <ThumbsUp className="w-4 h-4" /> {liked ? 'पसंद आया!' : 'लाइक'}
              </button>
              <button 
                onClick={() => setBookmarked(!bookmarked)}
                className={`flex items-center gap-2 font-bold px-5 py-2.5 rounded-xl transition-all ${bookmarked ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600'}`}
              >
                <Bookmark className="w-4 h-4" /> {bookmarked ? 'सेव हो गया' : 'सेव करें'}
              </button>
              <button 
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({ title: article.title, url: window.location.href });
                  } else {
                    navigator.clipboard.writeText(window.location.href);
                    alert('लिंक कॉपी हो गया!');
                  }
                }}
                className="flex items-center gap-2 font-bold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-600 px-5 py-2.5 rounded-xl transition-all"
              >
                <Share2 className="w-4 h-4" /> शेयर
              </button>
            </div>
          </div>
        </div>
      </article>

      {/* Related Articles */}
      {relatedArticles.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.5 }}
          className="mt-12"
        >
          <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Newspaper className="w-6 h-6 text-red-600" /> संबंधित ख़बरें
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {relatedArticles.map((related, i) => {
              const relId = related._id || btoa(encodeURIComponent(related.title || '')).slice(0, 20);
              return (
                <Link 
                  key={i} 
                  to={`/article/${relId}`} 
                  state={{ article: related }}
                  className="group flex gap-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 hover:shadow-lg transition-all"
                >
                  <img 
                    src={related.imageUrl || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167'} 
                    alt={related.title} 
                    className="w-24 h-24 rounded-xl object-cover flex-shrink-0"
                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167'; }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-500 transition-colors line-clamp-2 leading-tight mb-2">
                      {related.title}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{related.source || 'नागरिक न्यूज़'}</p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-gray-300 dark:text-gray-600 group-hover:text-red-500 transition-colors flex-shrink-0 mt-1" />
                </Link>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Footer Note */}
      <div className="text-center py-10 mt-8 border-t border-gray-200 dark:border-gray-800">
        <p className="text-gray-400 dark:text-gray-500 text-sm font-medium">अधिक ताज़ा ख़बरें पढ़ने के लिए नागरिक न्यूज़ पर बने रहें</p>
      </div>
    </motion.div>
  );
}
