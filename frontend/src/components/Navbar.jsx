import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Menu, User, Sparkles, Moon, Sun, HelpCircle, MessageSquare, LogOut, Settings } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useDarkMode } from "../context/DarkModeContext";
import FeedbackModal from "./FeedbackModal";

export default function Navbar() {
  const navigate = useNavigate();
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const [searchQuery, setSearchQuery] = useState("");
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
  const token = localStorage.getItem('userToken');

  const handleLogout = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('user');
    setIsProfileOpen(false);
    navigate('/');
    window.location.reload();
  };

  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
    }
  };
  return (
    <>
      <nav className="glass-header dark:bg-gray-900 dark:border-gray-700 border-b border-gray-100 py-3 px-6 fixed top-0 w-full z-40 transition-colors duration-300">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-700 dark:text-gray-300 cursor-pointer lg:hidden hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
            <Link to="/" className="text-2xl sm:text-3xl font-black text-red-600 dark:text-red-500 tracking-tighter flex items-center gap-2 hover:opacity-80 transition-opacity">
              NAGRIK <span className="text-gray-900 dark:text-white">NEWS</span>
              <Sparkles className="w-5 h-5 text-yellow-500 dark:text-yellow-400 animate-pulse" />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8 font-semibold text-sm text-gray-600 dark:text-gray-400">
            <Link to="/" className="hover:text-red-600 dark:hover:text-red-400 transition-colors">🔥 ताज़ा खबरें</Link>
            <Link to="/?category=politics" className="hover:text-red-600 dark:hover:text-red-400 transition-colors">राजनीति</Link>
            <Link to="/?category=business" className="hover:text-red-600 dark:hover:text-red-400 transition-colors">व्यापार</Link>
            <Link to="/?category=technology" className="hover:text-red-600 dark:hover:text-red-400 transition-colors">तकनीक</Link>
            <Link to="/faqs" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1">
              <HelpCircle className="w-4 h-4" /> FAQs
            </Link>
            <Link to="/cms" className="border-l-2 pl-8 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors border-gray-300 dark:border-gray-600 px-3 py-1 rounded-full shadow-sm hover:shadow bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400">
              संपादक पैनल
            </Link>
          </div>

          {/* Right Side Icons */}
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative hidden md:block">
              <input 
                type="text" 
                placeholder="खोजें..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleSearch}
                className="pl-10 pr-4 py-2 rounded-full bg-gray-100 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-600 focus:bg-white dark:focus:bg-gray-700 transition-all text-sm w-40 sm:w-56 md:w-64"
              />
              <Search className="w-4 h-4 absolute left-4 top-3 text-gray-500 dark:text-gray-400" />
            </div>

            {/* Dark Mode Toggle */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleDarkMode}
              className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-yellow-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              title={isDarkMode ? 'लाइट मोड' : 'डार्क मोड'}
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </motion.button>

            {/* Feedback Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsFeedbackOpen(true)}
              className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-orange-100 dark:hover:bg-orange-900/30 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
              title="फीडबैक भेजें"
            >
              <MessageSquare className="w-5 h-5" />
            </motion.button>

            {/* Profile Button */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="p-2 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                title={user ? 'प्रोफाइल' : 'लॉगिन'}
              >
                <User className="w-5 h-5" />
              </motion.button>

              {/* Profile Dropdown */}
              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden"
                  >
                    {user ? (
                      <>
                        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                          <p className="font-bold text-gray-900 dark:text-white">{user.name}</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">{user.email}</p>
                        </div>
                        <button className="w-full text-left px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-2 text-sm font-semibold">
                          <Settings className="w-4 h-4" /> प्रोफाइल सेटिंग्स
                        </button>
                        <button 
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors flex items-center gap-2 text-sm font-semibold border-t border-gray-200 dark:border-gray-700"
                        >
                          <LogOut className="w-4 h-4" /> लॉगआउट करें
                        </button>
                      </>
                    ) : (
                      <>
                        <Link
                          to="/login"
                          onClick={() => setIsProfileOpen(false)}
                          className="block px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors font-semibold text-sm"
                        >
                          लॉगिन करें
                        </Link>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="fixed top-16 left-0 right-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 lg:hidden z-40 p-4 space-y-3"
          >
            <div className="relative mb-4">
              <input 
                type="text" 
                placeholder="खोजें..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleSearch}
                className="w-full pl-10 pr-4 py-2 rounded-full bg-gray-100 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-600 transition-all text-sm"
              />
              <Search className="w-4 h-4 absolute left-4 top-3 text-gray-500" />
            </div>
            
            <Link to="/" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-700 dark:text-gray-300">🔥 ताज़ा खबरें</Link>
            <Link to="/?category=politics" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-700 dark:text-gray-300">राजनीति</Link>
            <Link to="/?category=business" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-700 dark:text-gray-300">व्यापार</Link>
            <Link to="/?category=technology" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-700 dark:text-gray-300">तकनीक</Link>
            <Link to="/faqs" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-700 dark:text-gray-300 flex items-center gap-2"><HelpCircle className="w-4 h-4" /> FAQs</Link>
            <Link to="/cms" className="block px-4 py-2 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 rounded-lg text-indigo-700 dark:text-indigo-400 font-semibold">संपादक पैनल</Link>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Feedback Modal */}
      <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} />
    </>
  );
}
