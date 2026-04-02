import { Link } from "react-router-dom";
import { Clock, ShieldCheck, Zap } from "lucide-react";
import { motion } from "framer-motion";

export default function NewsCard({ article, featured = false, index = 0 }) {
  // Generate a unique ID for the article using its title hash
  const articleId = article._id || btoa(encodeURIComponent(article.title || '')).slice(0, 20);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={`group bg-white dark:bg-gray-900 rounded-3xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl transition-all duration-300 ${featured ? 'md:flex md:col-span-2 shadow-md' : 'flex flex-col'}`}
    >
      <div className={`relative overflow-hidden ${featured ? 'w-full h-56 md:w-1/2 md:h-auto' : 'w-full h-56'}`}>
        {(article.imageUrl || '').match(/\.(mp4|webm|ogg)$/i) ? (
          <video 
            src={article.imageUrl} 
            autoPlay loop muted playsInline
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out"
          />
        ) : (
          <img 
            src={article.imageUrl || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'} 
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out"
            onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'; }}
          />
        )}
        <div className="absolute top-4 left-4 flex gap-2">
          <span className="bg-nagrik-red text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-lg">
            {article.category || 'समाचार'}
          </span>
          <span className="bg-indigo-600 flex items-center gap-1 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
            <Zap className="w-3 h-3" /> AI समरी 
          </span>
        </div>
      </div>
      
      <div className={`p-6 md:p-8 flex flex-col justify-between ${featured ? 'md:w-1/2' : 'flex-grow'}`}>
        <div>
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-3 font-medium">
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {article.publishedAt ? new Date(article.publishedAt).toLocaleDateString('hi-IN', { day: 'numeric', month: 'short' }) : '२ घंटे पहले'}</span>
            <span className="flex items-center gap-1 text-green-600 dark:text-green-400"><ShieldCheck className="w-3 h-3" /> AI प्रमाणित</span>
          </div>
          <Link 
            to={`/article/${articleId}`} 
            state={{ article }}
          >
            <h2 className={`font-black text-gray-900 dark:text-white group-hover:text-nagrik-red transition-colors leading-tight ${featured ? 'text-2xl sm:text-3xl md:text-4xl mb-4' : 'text-xl mb-3'}`}>
              {article.title}
            </h2>
          </Link>
          <p className="text-gray-600 dark:text-gray-400 line-clamp-3 text-sm leading-relaxed">
            {article.summary || article.content}
          </p>
        </div>
        
        <div className="mt-6 flex items-center mt-auto">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-nagrik-red to-orange-400 flex items-center justify-center text-white font-bold text-xs ring-2 ring-white dark:ring-gray-900">
            NN
          </div>
          <span className="ml-3 text-sm font-semibold text-gray-800 dark:text-gray-200">{article.source || 'संपादक'}</span>
        </div>
      </div>
    </motion.div>
  );
}
