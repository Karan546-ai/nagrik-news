import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Clock, MessageCircle, Share2, BotMessageSquare, ThumbsUp } from "lucide-react";
import { motion } from "framer-motion";

export default function ArticleDetail() {
  const { id } = useParams();

  // For demo, static content
  const article = {
    title: 'Sensex Hits All-Time High As AI Tech Companies Rally',
    content: 'Indian stock markets reached record levels today, primarily driven by IT and AI sector stocks. Investors are rushing to capitalize on the AI boom. Experts believe this trend could continue for the next decade, reshaping the entire economic landscape of the country. With companies integrating deep learning models into their daily workflows, productivity metrics are hitting unseen highs.',
    summary: 'Indian stock markets reached record levels today, primarily driven by IT and AI sector stocks. Investors are rushing to capitalize on the AI boom...',
    category: 'Business',
    imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3',
    source: 'Nagrik Business'
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl mx-auto bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-gray-100 mb-16">
      <Link to="/" className="text-gray-500 hover:text-nagrik-red font-bold flex items-center gap-2 mb-8 text-sm transition-colors">
        <ArrowLeft className="w-4 h-4" /> वापस होम पर
      </Link>
      
      <div className="flex items-center gap-3 mb-6">
        <span className="bg-nagrik-red text-white text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-md">
          {article.category}
        </span>
        <span className="text-gray-400 text-sm font-semibold flex items-center gap-1">
           <Clock className="w-4 h-4" /> २ घंटे पहले प्रकाशित
        </span>
      </div>

      <h1 className="text-4xl md:text-5xl font-black text-gray-900 leading-[1.1] mb-8 tracking-tight">
        {article.title}
      </h1>

      {/* AI Summary Banner */}
      <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 mb-10 flex gap-4">
        <div className="flex-shrink-0 mt-1">
          <BotMessageSquare className="w-8 h-8 text-indigo-600" />
        </div>
        <div>
          <h3 className="text-indigo-900 font-bold mb-2 flex items-center gap-2">AI शार्ट समरी (सारांश) <span className="text-[10px] bg-indigo-600 text-white px-2 py-0.5 rounded-md uppercase tracking-wider shadow-sm">Beta</span></h3>
          <p className="text-indigo-800/80 font-medium leading-loose text-sm">{article.summary}</p>
        </div>
      </div>

      {(article.imageUrl || '').match(/\.(mp4|webm|ogg)$/i) ? (
        <video 
          src={article.imageUrl} 
          controls autoPlay loop
          className="w-full h-[400px] object-cover rounded-2xl mb-10 shadow-md bg-black"
        />
      ) : (
        <img 
          src={article.imageUrl} 
          alt="Article banner"
          className="w-full h-[400px] object-cover rounded-2xl mb-10 shadow-md"
        />
      )}

      <div className="prose prose-lg prose-slate font-medium text-gray-700 leading-loose">
        <p>{article.content}</p>
        <p className="mt-6">इसके अलावा, बड़ी तकनीकी कंपनियां अपनी बाजार में अपनी मजबूत स्थिति बनाए रखने के लिए लगातार AI तकनीक पर काम कर रही हैं। नियामक संस्थाएं भी इन पर बारीकी से नजर गड़ाए हुए हैं ताकि सुरक्षा और निष्पक्षता बनी रहे।</p>
      </div>

      <div className="flex items-center justify-between border-t border-gray-100 mt-12 pt-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-nagrik-red to-orange-400 flex items-center justify-center text-white font-bold text-lg shadow-md">
            NN
          </div>
          <div>
            <p className="font-bold text-gray-900 leading-tight">संवाददाता</p>
            <p className="text-sm text-gray-500 font-semibold">{article.source}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-gray-400">
          <button onClick={() => alert('धन्यवाद! लाइक सेव कर लिया गया है।')} className="hover:text-blue-600 flex items-center gap-1 font-bold text-sm bg-gray-50 px-4 py-2 rounded-xl transition-all"><ThumbsUp className="w-4 h-4" /> लाइक</button>
          <button onClick={() => { navigator.clipboard.writeText(window.location.href); alert('लिंक कॉपी कर लिया गया है!'); }} className="hover:text-green-600 flex items-center gap-1 font-bold text-sm bg-gray-50 px-4 py-2 rounded-xl transition-all"><Share2 className="w-4 h-4" /> शेयर</button>
        </div>
      </div>
    </motion.div>
  );
}
