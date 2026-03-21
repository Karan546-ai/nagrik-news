import { useState, useEffect } from "react";
import axios from "axios";
import { PlusCircle, Edit3, Trash2, CheckCircle, Clock, Zap, MessageSquare, Newspaper, Users } from "lucide-react";
import { motion } from "framer-motion";
import FeedbackViewer from "../components/FeedbackViewer";
import UsersViewer from "../components/UsersViewer";
import API_BASE_URL from "../config/api";

export default function CMSDashboard() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [articles, setArticles] = useState([]);
  const [activeTab, setActiveTab] = useState("articles");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '', content: '', category: '', imageUrl: '', source: 'Nagrik Correspondent', status: 'published'
  });
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    if (isAdmin) fetchArticles();
  }, [isAdmin]);

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/admin/login`, { 
        email: email.trim(), 
        password: password 
      });

      if (res.data.token) {
        localStorage.setItem('adminToken', res.data.token);
        setIsAdmin(true);
        alert("✅ " + res.data.msg);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.msg || "Login failed. Check your email and password.";
      alert('❌ ' + errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white p-4 sm:p-6 md:p-10 w-[95vw] max-w-md mx-auto mt-10 rounded-3xl shadow-2xl border border-gray-100 flex flex-col items-center relative overflow-hidden">
        <div className="absolute top-0 w-full h-2 bg-gradient-to-r from-red-600 to-red-400"></div>
        
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-6 ring-4 ring-red-50">
          <Zap className="w-8 h-8 text-red-600" />
        </div>

        <h2 className="text-2xl font-black mb-2 text-gray-900 tracking-tight text-center px-4">🔐 Admin Panel</h2>
        <p className="text-gray-500 font-medium mb-8 text-center text-sm leading-relaxed px-4">
          अपना Email और Password दर्ज करें
        </p>

        <form className="w-full flex gap-4 flex-col px-4" onSubmit={handleAdminLogin}>
          <input 
            type="email" 
            placeholder="Admin Email" 
            required 
            className="w-full font-bold border-gray-200 border-2 rounded-xl px-5 py-4 focus:ring-4 focus:ring-red-100 focus:border-red-600 outline-none transition-all tracking-wide text-gray-800" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
          />
          
          <input 
            type="password" 
            placeholder="Password"
            required 
            className="w-full font-bold border-gray-200 border-2 rounded-xl px-5 py-4 focus:ring-4 focus:ring-red-100 focus:border-red-600 outline-none transition-all tracking-wide text-gray-800" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
          />

          <button 
            type="submit" 
            disabled={loading}
            className="bg-gray-900 hover:bg-black text-white px-6 py-4 rounded-xl font-black transition-all shadow-[0_4px_15px_rgba(0,0,0,0.3)] w-full uppercase tracking-wider text-sm mt-3 disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="text-xs text-gray-400 mt-6 text-center px-4">
          📧 Authorized Admin Email Required
        </p>
      </motion.div>
    );
  }

  const fetchArticles = () => {
    axios.get(`${API_BASE_URL}/api/news/cms/articles`)
      .then(res => setArticles(res.data))
      .catch(err => console.log("Demo mode"));
  };

  const handleDelete = async (id) => {
    if (!id || id.length < 5) { alert("आप डेमो आर्टिकल डिलीट नहीं कर सकते। (Demo article)"); return; }
    if(window.confirm('क्या आप इसे डिलीट करना चाहते हैं?')) {
      try {
        await axios.delete(`${API_BASE_URL}/api/news/cms/delete/${id}`);
        fetchArticles();
      } catch(err) {}
    }
  };

  const handleEdit = (article) => {
    if (!article._id || article._id.length < 5) { alert("आप डेमो आर्टिकल एडिट नहीं कर सकते। (Demo article)"); return; }
    setEditId(article._id);
    setFormData(article);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await axios.put(`${API_BASE_URL}/api/news/cms/update/${editId}`, formData);
        alert("Article updated successfully!");
      } else {
        await axios.post(`${API_BASE_URL}/api/news/create`, formData);
        alert("Article saved successfully! AI will generate a summary.");
      }
      setIsModalOpen(false);
      setEditId(null);
      fetchArticles();
      setFormData({ title: '', content: '', category: '', imageUrl: '', source: 'Nagrik Correspondent', status: 'published' });
    } catch(err) {
      alert("Error saving article in demo mode. Check backend server.");
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white dark:bg-gray-900 p-2 sm:p-4 md:p-8 rounded-2xl shadow-[0_4px_30px_rgba(0,0,0,0.03)] border border-gray-100 dark:border-gray-700 min-h-screen space-y-6">
      
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-8 pb-6 border-b border-gray-100 dark:border-gray-700">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white mb-2">संपादक पैनल (Editor Dashboard)</h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium text-sm md:text-base">यहाँ से अपनी न्यूज़ पोस्ट करें, मैनेज करें और फीडबैक देखें।</p>
        </div>
        {activeTab === "articles" && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-gray-900 dark:bg-gray-800 hover:bg-black dark:hover:bg-gray-700 text-white px-4 sm:px-6 py-3 rounded-xl font-bold transition-all shadow-md whitespace-nowrap flex-shrink-0"
          >
            <PlusCircle className="w-5 h-5"/> नई खबर लिखें
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 md:gap-4 mb-8 pb-6 border-b border-gray-200 dark:border-gray-700 -mx-2 sm:mx-0">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setActiveTab("articles")}
          className={`flex items-center gap-2 px-4 py-3 md:px-6 font-bold transition-all rounded-lg shadow-sm flex-1 min-w-[120px] justify-center text-sm md:text-base ${
            activeTab === "articles"
              ? "text-red-600 dark:text-red-500 bg-red-50 dark:bg-red-900/30 border-2 border-red-600 dark:border-red-500"
              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          }`}
        >
          <Newspaper className="w-4 h-4 md:w-5 md:h-5" /> खबरें ({articles.length})
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setActiveTab("users")}
          className={`flex items-center gap-2 px-4 py-3 md:px-6 font-bold transition-all rounded-lg shadow-sm flex-1 min-w-[120px] justify-center text-sm md:text-base ${
            activeTab === "users"
              ? "text-red-600 dark:text-red-500 bg-red-50 dark:bg-red-900/30 border-2 border-red-600 dark:border-red-500"
              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          }`}
        >
          <Users className="w-4 h-4 md:w-5 md:h-5" /> उपयोगकर्ता
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setActiveTab("feedback")}
          className={`flex items-center gap-2 px-4 py-3 md:px-6 font-bold transition-all rounded-lg shadow-sm flex-1 min-w-[120px] justify-center text-sm md:text-base ${
            activeTab === "feedback"
              ? "text-red-600 dark:text-red-500 bg-red-50 dark:bg-red-900/30 border-2 border-red-600 dark:border-red-500"
              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          }`}
        >
          <MessageSquare className="w-4 h-4 md:w-5 md:h-5" /> फीडबैक
        </motion.button>
      </div>

      {/* Articles Tab */}
      {activeTab === "articles" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="-mx-2 sm:mx-0"
        >
          <div className="overflow-x-auto rounded-2xl border border-gray-100 dark:border-gray-700 bg-white shadow-sm">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 text-xs sm:text-sm uppercase tracking-wider font-extrabold">
                  <th className="py-4 px-3 sm:px-6 border-b border-gray-100 dark:border-gray-700 font-black w-48 sm:w-auto">खबर का टाइटल</th>
                  <th className="py-4 px-3 sm:px-6 border-b border-gray-100 dark:border-gray-700 font-black text-center w-24">श्रेणी</th>
                  <th className="py-4 px-3 sm:px-6 border-b border-gray-100 dark:border-gray-700 font-black text-center w-28">स्थिति</th>
                  <th className="py-4 px-3 sm:px-6 border-b border-gray-100 dark:border-gray-700 font-black text-center w-24">एक्शन</th>
                </tr>
              </thead>
              <tbody>
                {(articles.length > 0 ? articles : [
                  { _id: "demo1", title: "एआई एक्ट पर नया ड्राफ्ट तैयार", category: "तकनीक", status: "draft" },
                  { _id: "demo2", title: "वर्ल्ड कप 2026 के फाइनल का वेन्यू घोषित", category: "खेल", status: "published" }
                ]).map((article, index) => (
                  <tr key={article._id || index} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group border-b border-gray-50 dark:border-gray-700/50">
                    <td className="py-4 px-3 sm:px-6 border-b border-gray-50 dark:border-gray-700 text-sm sm:text-base text-gray-800 dark:text-gray-200 font-bold max-w-xs truncate pr-2 group-hover:text-red-600 dark:group-hover:text-red-500 transition-colors">
                      <div className="truncate">{article.title}</div>
                    </td>
                    <td className="py-4 px-3 sm:px-6 border-b border-gray-50 dark:border-gray-700 text-center">
                      <span className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-bold rounded-full min-w-[60px]">
                        {article.category}
                      </span>
                    </td>
                    <td className="py-4 px-3 sm:px-6 border-b border-gray-50 dark:border-gray-700 text-center">
                      {article.status === 'published' ? (
                        <span className="flex items-center gap-1.5 text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-3 py-1 rounded-full text-xs font-bold w-max shadow-sm justify-center mx-auto">
                          <CheckCircle className="w-3.5 h-3.5"/> पब्लिश्ड
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/30 px-3 py-1 rounded-full text-xs font-bold w-max shadow-sm justify-center mx-auto">
                          <Clock className="w-3.5 h-3.5"/> ड्राफ्ट
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-3 sm:px-6 border-b border-gray-50 dark:border-gray-700 text-center">
                      <div className="flex gap-2 justify-center">
                        <button onClick={(e) => { e.stopPropagation(); handleEdit(article); }} className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg transition-colors shadow-sm" title="Edit">
                          <Edit3 className="w-4 h-4"/>
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); handleDelete(article._id || article.id); }} className="p-2 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-lg transition-colors shadow-sm" title="Delete">
                          <Trash2 className="w-4 h-4"/>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Feedback Tab */}
      {activeTab === "feedback" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <FeedbackViewer />
        </motion.div>
      )}

      {/* Users Tab */}
      {activeTab === "users" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <UsersViewer />
        </motion.div>
      )}

      {/* Article Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1000] flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }} 
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white dark:bg-gray-900 p-4 sm:p-6 md:p-8 lg:p-10 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-2xl max-h-[90vh] overflow-y-auto mx-4 sm:mx-auto relative"
          >
            <button 
              onClick={() => setIsModalOpen(false)} 
              className="absolute top-4 right-4 z-10 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white text-xl font-bold p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              ✕
            </button>
            <h2 className="text-xl sm:text-2xl font-black mb-6 text-gray-900 dark:text-white pb-4 border-b border-gray-100 dark:border-gray-700">
              {editId ? 'खबर एडिट करें' : 'नई खबर लिखें'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">हेडलाइन <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  placeholder="रोचक हेडलाइन लिखें" 
                  required 
                  className="w-full text-lg font-bold border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm" 
                  value={formData.title} 
                  onChange={e => setFormData({...formData, title: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">श्रेणी <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  placeholder="जैसे - राजनीति, व्यापार, खेल, तकनीक" 
                  required 
                  className="w-full font-semibold border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm" 
                  value={formData.category} 
                  onChange={e => setFormData({...formData, category: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">इमेज URL या अपलोड</label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input 
                    type="url" 
                    placeholder="https://example.com/image.jpg" 
                    className="flex-1 font-semibold border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm" 
                    value={formData.imageUrl} 
                    onChange={e => setFormData({...formData, imageUrl: e.target.value})}
                  />
                  <label className="bg-blue-500 hover:bg-blue-600 text-white w-full sm:w-auto px-6 py-3 rounded-xl font-bold cursor-pointer transition-colors text-center shadow-md whitespace-nowrap">
                    फाइल चुनें
                    <input 
                      type="file" 
                      accept="image/*,video/*" 
                      className="hidden" 
                      onChange={async (e) => {
                        const file = e.target.files[0];
                        if (!file) return;
                        const fileData = new FormData();
                        fileData.append("media", file);
                        try {
                          const res = await axios.post(`${API_BASE_URL}/api/news/upload`, fileData, {
                            headers: { 'Content-Type': 'multipart/form-data' }
                          });
                          setFormData({...formData, imageUrl: res.data.url});
                          alert("✅ फाइल अपलोड सफल!");
                        } catch (err) { 
                          alert("अपलोड विफल। सर्वर चेक करें।");
                        }
                      }} 
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">खबर का विवरण <span className="text-red-500">*</span></label>
                <textarea 
                  placeholder="पूरी खबर यहाँ लिखें..." 
                  required 
                  className="w-full h-32 md:h-40 font-medium border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-vertical shadow-sm" 
                  value={formData.content} 
                  onChange={e => setFormData({...formData, content: e.target.value})}
                />
              </div>

              <div className="flex flex-col-reverse gap-3 pt-4 border-t border-gray-100 dark:border-gray-700 sm:flex-row sm:justify-end">
                <button 
                  type="button" 
                  onClick={() => { setIsModalOpen(false); setEditId(null); }} 
                  className="px-6 py-3 rounded-xl font-bold text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors w-full sm:w-auto"
                >
                  रद्द करें
                </button>
                <button 
                  type="submit" 
                  className="px-6 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 shadow-lg transition-all w-full sm:w-auto flex items-center justify-center gap-2"
                >
                  <Zap className="w-4 h-4" />
                  {editId ? 'अपडेट करें' : 'पोस्ट करें'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

    </motion.div>
  );
}
