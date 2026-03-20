import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, MessageSquare, Star } from 'lucide-react';
import axios from 'axios';
import API_BASE_URL from '../config/api';

export default function FeedbackModal({ isOpen, onClose }) {
  const [feedback, setFeedback] = useState('');
  const [email, setEmail] = useState('');
  const [rating, setRating] = useState(5);
  const [category, setCategory] = useState('suggestion');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/feedback`, {
        email: email.trim() || 'anonymous@nagriknews.com',
        message: feedback.trim(),
        rating,
        category,
        timestamp: new Date().toISOString()
      });

      setSuccess(true);
      setTimeout(() => {
        setFeedback('');
        setEmail('');
        setRating(5);
        setCategory('suggestion');
        setSuccess(false);
        onClose();
      }, 2000);
    } catch (err) {
      alert('फीडबैक भेजने में समस्या हुई।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 dark:bg-black/70 z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
          >
            <motion.div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-8 max-w-md w-full border border-gray-200 dark:border-gray-700">
              
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <X className="w-6 h-6" />
              </button>

              {/* Header */}
              <div className="flex items-center gap-3 mb-6">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/30">
                  <MessageSquare className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <h2 className="text-2xl font-black text-gray-900 dark:text-white">
                  अपना विचार साझा करें
                </h2>
              </div>

              {success ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-8"
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
                    <span className="text-4xl">✅</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    धन्यवाद!
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    आपका फीडबैक हमें मिल गया। हम इसे ध्यान में रखेंगे।
                  </p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Category */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                      विषय
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:border-orange-600 outline-none font-semibold"
                    >
                      <option value="suggestion">सुझाव</option>
                      <option value="bug">बग रिपोर्ट</option>
                      <option value="feature">नई विशेषता</option>
                      <option value="other">अन्य</option>
                    </select>
                  </div>

                  {/* Rating */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                      रेटिंग
                    </label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className="transition-transform hover:scale-110"
                        >
                          <Star
                            className={`w-8 h-8 ${
                              star <= rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300 dark:text-gray-600'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Email (Optional) */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                      ईमेल (वैकल्पिक)
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:border-orange-600 outline-none font-semibold"
                    />
                  </div>

                  {/* Feedback Text */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                      आपका सुझाव / टिप्पणी
                    </label>
                    <textarea
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      required
                      placeholder="कृपया अपनी टिप्पणी या सुझाव यहाँ लिखें..."
                      rows="4"
                      className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:border-orange-600 outline-none font-semibold resize-none"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading || !feedback.trim()}
                    className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <Send className="w-5 h-5" />
                    {loading ? 'भेज रहे हैं...' : 'भेजें'}
                  </button>
                </form>
              )}
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
