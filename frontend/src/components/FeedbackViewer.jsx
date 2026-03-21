import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Star, TrendingUp, AlertCircle, CheckCircle, Clock, Trash2, Mail } from 'lucide-react';
import API_BASE_URL from '../config/api';

export default function FeedbackViewer() {
  const [feedback, setFeedback] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, new, bug, suggestion, feature
  const [selectedFeedback, setSelectedFeedback] = useState(null);

  useEffect(() => {
    fetchFeedbackAndStats();
  }, []);

  const fetchFeedbackAndStats = async () => {
    setLoading(true);
    try {
      const [feedbackRes, statsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/auth/feedback/all`),
        axios.get(`${API_BASE_URL}/api/auth/feedback/stats`)
      ]);

      setFeedback(feedbackRes.data.feedback || []);
      setStats(statsRes.data);
    } catch (err) {
      console.error('Error fetching feedback:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredFeedback = feedback.filter(item => {
    if (filter === 'all') return true;
    if (filter === 'new') return item.status === 'new';
    return item.category === filter;
  });

  const getCategoryColor = (category) => {
    const colors = {
      suggestion: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
      bug: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
      feature: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
      other: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400'
    };
    return colors[category] || colors.other;
  };

  const getCategoryIcon = (category) => {
    const icons = {
      suggestion: '💡',
      bug: '🐛',
      feature: '⭐',
      other: '📝'
    };
    return icons[category] || '📝';
  };

  const getStatusColor = (status) => {
    const colors = {
      new: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
      read: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
      responded: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
    };
    return colors[status] || colors.new;
  };

  const getStatusIcon = (status) => {
    if (status === 'new') return <AlertCircle className="w-4 h-4" />;
    if (status === 'read') return <Clock className="w-4 h-4" />;
    return <CheckCircle className="w-4 h-4" />;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 p-6 rounded-2xl border border-purple-200 dark:border-purple-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-semibold mb-1">कुल फीडबैक</p>
                <p className="text-3xl font-black text-gray-900 dark:text-white">{stats.total}</p>
              </div>
              <MessageCircle className="w-10 h-10 text-purple-600 dark:text-purple-400 opacity-20" />
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/30 dark:to-yellow-800/30 p-6 rounded-2xl border border-yellow-200 dark:border-yellow-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-semibold mb-1">नए फीडबैक</p>
                <p className="text-3xl font-black text-gray-900 dark:text-white">{stats.newCount}</p>
              </div>
              <AlertCircle className="w-10 h-10 text-yellow-600 dark:text-yellow-400 opacity-20" />
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/30 p-6 rounded-2xl border border-orange-200 dark:border-orange-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-semibold mb-1">औसत रेटिंग</p>
                <div className="flex items-center gap-1">
                  <p className="text-3xl font-black text-gray-900 dark:text-white">{stats.avgRating.toFixed(1)}</p>
                  <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                </div>
              </div>
              <TrendingUp className="w-10 h-10 text-orange-600 dark:text-orange-400 opacity-20" />
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 p-6 rounded-2xl border border-green-200 dark:border-green-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-semibold mb-1">संतुष्टि दर</p>
                <p className="text-3xl font-black text-gray-900 dark:text-white">
                  {Math.round((stats.avgRating / 5) * 100)}%
                </p>
              </div>
              <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400 opacity-20" />
            </div>
          </motion.div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        {['all', 'new', 'suggestion', 'bug', 'feature'].map(category => (
          <motion.button
            key={category}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setFilter(category)}
            className={`px-4 py-2 rounded-full font-semibold transition-all ${
              filter === category
                ? 'bg-red-600 text-white shadow-md'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {category === 'all' && '📋 सभी'}
            {category === 'new' && '🆕 नए'}
            {category === 'suggestion' && '💡 सुझाव'}
            {category === 'bug' && '🐛 बग'}
            {category === 'feature' && '⭐ फीचर'}
          </motion.button>
        ))}
      </div>

      {/* Feedback List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div
              key={i}
              className="h-32 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-xl"
            ></div>
          ))}
        </div>
      ) : filteredFeedback.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-600"
        >
          <MessageCircle className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4 opacity-50" />
          <p className="text-gray-600 dark:text-gray-400 text-lg font-semibold">कोई फीडबैक नहीं मिला</p>
        </motion.div>
      ) : (
        <motion.div
          layout
          className="space-y-4"
        >
          <AnimatePresence>
            {filteredFeedback.map((item, idx) => (
              <motion.div
                key={item._id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => setSelectedFeedback(item)}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg dark:hover:shadow-lg/20 transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="text-3xl">{getCategoryIcon(item.category)}</div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                        {item.email}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${getCategoryColor(item.category)}`}>
                          {item.category}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${getStatusColor(item.status)}`}>
                          {getStatusIcon(item.status)}
                          {item.status === 'new' && 'नया'}
                          {item.status === 'read' && 'पढ़ा गया'}
                          {item.status === 'responded' && 'उत्तर दिया गया'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < item.rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300 dark:text-gray-600'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <p className="text-gray-700 dark:text-gray-300 text-sm mb-3 line-clamp-2">
                  {item.message}
                </p>

                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>{new Date(item.createdAt).toLocaleDateString('hi-IN')}</span>
                  <span>{new Date(item.createdAt).toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Detailed View Modal */}
      <AnimatePresence>
        {selectedFeedback && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedFeedback(null)}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-900 rounded-2xl sm:rounded-3xl p-5 sm:p-8 max-w-2xl w-[95%] sm:w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-black text-gray-900 dark:text-white">फीडबैक विस्तार</h2>
                <button
                  onClick={() => setSelectedFeedback(null)}
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">ईमेल</p>
                  <div className="flex items-center gap-2 text-gray-900 dark:text-white font-semibold">
                    <Mail className="w-5 h-5" />
                    {selectedFeedback.email}
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">संदेश</p>
                  <p className="text-gray-900 dark:text-white leading-relaxed bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    {selectedFeedback.message}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">श्रेणी</p>
                    <span className={`inline-block px-4 py-2 rounded-lg text-sm font-bold ${getCategoryColor(selectedFeedback.category)}`}>
                      {getCategoryIcon(selectedFeedback.category)} {selectedFeedback.category}
                    </span>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">रेटिंग</p>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${
                            i < selectedFeedback.rating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300 dark:text-gray-600'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">स्थिति</p>
                    <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold ${getStatusColor(selectedFeedback.status)}`}>
                      {getStatusIcon(selectedFeedback.status)}
                      {selectedFeedback.status === 'new' && 'नया'}
                      {selectedFeedback.status === 'read' && 'पढ़ा गया'}
                      {selectedFeedback.status === 'responded' && 'उत्तर दिया गया'}
                    </span>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">तारीख & समय</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {new Date(selectedFeedback.createdAt).toLocaleDateString('hi-IN')}
                      <br />
                      {new Date(selectedFeedback.createdAt).toLocaleTimeString('hi-IN')}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 sm:py-2 px-4 rounded-lg transition-colors">
                    उत्तर दें
                  </button>
                  <button className="flex-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-bold py-2 px-4 rounded-lg transition-colors">
                    चिह्नित करें
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
