import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import NewsCard from "../components/NewsCard";
import { Sparkles, Zap, ChevronRight, Activity, Search } from "lucide-react";
import API_BASE_URL from "../config/api";

export default function Home() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const category = searchParams.get('category') || 'general';
  const searchQuery = searchParams.get('search') || '';
  const sortBy = searchParams.get('sort') || '';

  useEffect(() => {
    setLoading(true);
    
    let apiUrl = `${API_BASE_URL}/api/news/feed`;
    if (searchQuery) {
      apiUrl = `${API_BASE_URL}/api/news/search?q=${encodeURIComponent(searchQuery)}`;
    } else if (sortBy === 'trending') {
      apiUrl = `${API_BASE_URL}/api/news/trending`;
    } else {
      apiUrl = `${API_BASE_URL}/api/news/feed?category=${category}`;
    }

    axios.get(apiUrl)
      .then(res => {
        setArticles(res.data.articles || []);
      })
      .catch(err => {
        // Fallback demo data
        setArticles([
          {
            _id: '1',
            title: 'Sensex Hits All-Time High As AI Tech Companies Rally',
            summary: 'Indian stock markets reached record levels today, primarily driven by IT and AI sector stocks. Investors are rushing to capitalize on the AI boom...',
            category: 'business',
            imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3',
            source: 'Nagrik Business'
          },
          {
            _id: '2',
            title: 'Election Commission Announces New Digital Voting Pilot for 2026',
            summary: 'In a historic move, the EC will test blockchain-based voting systems in select tier-1 cities to improve transparency.',
            category: 'politics',
            imageUrl: 'https://images.unsplash.com/photo-1540910419892-4a36d2c3266c',
            source: 'Nagrik Politics'
          },
          {
            _id: '3',
            title: 'Deepmind Breakthrough: Solving Quantum Error Correction',
            summary: 'Google Deepmind researchers have published a paper detailing a novel approach to quantum error correction, a major hurdle for Q-computing.',
            category: 'technology',
            imageUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995',
            source: 'Tech Insider'
          }
        ]);
      })
      .finally(() => setLoading(false));
  }, [category, searchQuery, sortBy]);

  const featured = articles[0];
  const restArticles = articles.slice(1);

  // Determine the heading based on current view
  let headingText = '';
  let headingIcon = null;
  
  if (searchQuery) {
    headingText = `"${searchQuery}" की खोज परिणाम`;
    headingIcon = <Search className="text-orange-600 w-8 h-8" />;
  } else if (sortBy === 'trending') {
    headingText = 'ट्रेंडिंग अभी (Trending Now)';
    headingIcon = <Activity className="text-red-600 w-8 h-8" />;
  } else {
    headingText = category === 'general' ? 'मुख्य खबरें (Headlines)' : `${category.charAt(0).toUpperCase() + category.slice(1)} समाचार`;
    headingIcon = category === 'general' ? <Activity className="text-red-600 w-8 h-8" /> : null;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="animate-in fade-in duration-500"
    >
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
          {headingIcon}
          {headingText}
        </h1>
        {!searchQuery && (
          <button className="flex items-center gap-2 text-sm font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-4 py-2 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors">
            <Sparkles className="w-4 h-4" /> अपनी फीड चुनें
          </button>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1,2,3].map(i => <div key={i} className="h-80 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-3xl w-full"></div>)}
        </div>
      ) : articles.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16"
        >
          <Search className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-600 dark:text-gray-300 mb-2">कोई परिणाम नहीं मिला</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">क्षमा करें, हम कोई समाचार नहीं खोज सके।</p>
          <Link to="/" className="inline-block px-6 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-colors">
            होम पर लौटें
          </Link>
        </motion.div>
      ) : (
        <div className="space-y-12">
          {featured && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 mb-8"
            >
              <NewsCard article={featured} featured={true} />
            </motion.div>
          )}
          
          {restArticles.length > 0 && (
            <>
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-black text-gray-800 dark:text-white flex items-center gap-2">
                   <Zap className="w-5 h-5 text-yellow-500"/> आपके लिए सुझाव (Recommended)
                </h2>
                <Link to="#" className="text-sm font-semibold text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-500 flex items-center transition-colors">
                  सभी देखें <ChevronRight className="w-4 h-4"/>
                </Link>
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ staggerChildren: 0.1 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-12 pb-16"
              >
                {restArticles.map((article, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <NewsCard article={article} />
                  </motion.div>
                ))}
              </motion.div>
            </>
          )}
        </div>
      )}
    </motion.div>
  );
}
