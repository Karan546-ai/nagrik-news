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
  const [activeTab, setActiveTab] = useState("articles"); // "articles" or "feedback"
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '', content: '', category: '', imageUrl: '', source: 'Nagrik Correspondent', status: 'published'
  });
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    if (isAdmin) fetchArticles();
  }, [isAdmin]);

  // Admin Login (Email + Password)
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

  // Show Login Form
  if (!isAdmin) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white p-10 max-w-md mx-auto mt-20 rounded-3xl shadow-2xl border border-gray-100 flex flex-col items-center relative overflow-hidden">
        <div className="absolute top-0 w-full h-2 bg-gradient-to-r from-red-600 to-red-400"></div>
        
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-6 ring-4 ring-red-50">
          <Zap className="w-8 h-8 text-red-600" />
        </div>

        <h2 className="text-2xl font-black mb-2 text-gray-900 tracking-tight">🔐 Admin Panel</h2>
        <p className="text-gray-500 font-medium mb-8 text-center text-sm leading-relaxed">
          अपना Email और Password दर्ज करें
        </p>

        <form className="w-full flex gap-4 flex-col" onSubmit={handleAdminLogin}>
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

        <p className="text-xs text-gray-400 mt-6 text-center">
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
  };;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white dark:bg-gray-900 p-8 rounded-3xl shadow-[0_4px_30px_rgba(0,0,0,0.03)] border border-gray-100 dark:border-gray-700 min-h-[80vh]">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10 pb-6 border-b border-gray-100 dark:border-gray-700">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">संपादक पैनल (Editor Dashboard)</h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium">यहाँ से अपनी न्यूज़ पोस्ट करें, मैनेज करें और फीडबैक देखें।</p>
        </div>
        {activeTab === "articles" && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-gray-900 dark:bg-gray-800 hover:bg-black dark:hover:bg-gray-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-md"
          >
            <PlusCircle className="w-5 h-5"/> नई खबर लिखें
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 sm:gap-4 mb-8 border-b border-gray-200 dark:border-gray-700">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setActiveTab("articles")}
          className={`flex items-center gap-2 px-6 py-3 font-bold transition-all ${
            activeTab === "articles"
              ? "text-red-600 dark:text-red-500 border-b-4 border-red-600 dark:border-red-500"
              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300"
          }`}
        >
          <Newspaper className="w-5 h-5" /> खबरें ({articles.length})
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setActiveTab("users")}
          className={`flex items-center gap-2 px-6 py-3 font-bold transition-all ${
            activeTab === "users"
              ? "text-red-600 dark:text-red-500 border-b-4 border-red-600 dark:border-red-500"
              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300"
          }`}
        >
          <Users className="w-5 h-5" /> उपयोगकर्ता
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setActiveTab("feedback")}
          className={`flex items-center gap-2 px-6 py-3 font-bold transition-all ${
            activeTab === "feedback"
              ? "text-red-600 dark:text-red-500 border-b-4 border-red-600 dark:border-red-500"
              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300"
          }`}
        >
          <MessageSquare className="w-5 h-5" /> फीडबैक
        </motion.button>
      </div>

      {/* Articles Tab */}
      {activeTab === "articles" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <div className="overflow-x-auto rounded-2xl border border-gray-100 dark:border-gray-700">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-sm uppercase tracking-wider font-extrabold">
                  <th className="py-4 px-6 border-b border-gray-100 dark:border-gray-700">खबर का टाइटल</th>
                  <th className="py-4 px-6 border-b border-gray-100 dark:border-gray-700">श्रेणी (Category)</th>
                  <th className="py-4 px-6 border-b border-gray-100 dark:border-gray-700">स्थिति (Status)</th>
                  <th className="py-4 px-6 border-b border-gray-100 dark:border-gray-700">एक्शन</th>
                </tr>
              </thead>
              <tbody>
                {(articles.length > 0 ? articles : [
                  { title: "एआई एक्ट पर नया ड्राफ्ट तैयार", category: "तकनीक", status: "draft" },
                  { title: "वर्ल्ड कप 2026 के फाइनल का वेन्यू घोषित", category: "खेल", status: "published" }
                ]).map((article, index) => (
                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group">
                    <td className="py-5 px-6 border-b border-gray-50 dark:border-gray-700 text-gray-800 dark:text-gray-200 font-bold max-w-xs truncate group-hover:text-red-600 dark:group-hover:text-red-500 transition-colors">
                      {article.title}
                    </td>
                    <td className="py-5 px-6 border-b border-gray-50 dark:border-gray-700 text-gray-600 dark:text-gray-400 font-semibold">{article.category}</td>
                    <td className="py-5 px-6 border-b border-gray-50 dark:border-gray-700">
                      {article.status === 'published' ? (
                        <span className="flex items-center gap-1.5 text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-3 py-1 rounded-full text-xs font-bold w-max shadow-sm"><CheckCircle className="w-3.5 h-3.5"/> पब्लिश्ड</span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/30 px-3 py-1 rounded-full text-xs font-bold w-max shadow-sm"><Clock className="w-3.5 h-3.5"/> ड्राफ्ट</span>
                      )}
                    </td>
                    <td className="py-5 px-6 border-b border-gray-50 dark:border-gray-700 flex gap-3">
                      <button onClick={() => handleEdit(article)} className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg transition-colors"><Edit3 className="w-4 h-4"/></button>
                      <button onClick={() => handleDelete(article._id)} className="p-2 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-lg transition-colors"><Trash2 className="w-4 h-4"/></button>
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

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-white p-10 rounded-3xl w-[600px] max-w-full shadow-2xl relative">
            <h2 className="text-2xl font-black mb-6 text-gray-900 border-b border-gray-100 pb-4">नई खबर का ड्राफ्ट</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <input type="text" placeholder="रोचक हेडलाइन (Headline)" required className="w-full text-lg font-bold border-gray-200 border rounded-xl px-5 py-3 focus:ring-2 focus:ring-nagrik-red focus:border-transparent outline-none transition-all" onChange={e => setFormData({...formData, title: e.target.value})} />
              <input type="text" placeholder="श्रेणी (जैसे- राजनीति, व्यापार, खेल)" required className="w-full font-semibold border-gray-200 border rounded-xl px-5 py-3 focus:ring-2 focus:ring-nagrik-red outline-none transition-all" onChange={e => setFormData({...formData, category: e.target.value})} />
              
              <div className="flex gap-3 items-center">
                <input type="text" placeholder="कवर इमेज या वीडियो का लिंक (या फाइल चुनें)" className="w-full font-semibold border-gray-200 border rounded-xl px-5 py-3 focus:ring-2 focus:ring-nagrik-red outline-none transition-all" value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})} />
                <label className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-5 py-3 rounded-xl font-bold cursor-pointer transition-colors whitespace-nowrap shadow-sm">
                  फाइल अपलोड
                  <input type="file" accept="image/*,video/*" className="hidden" onChange={async (e) => {
                    const file = e.target.files[0];
                    if (!file) return;
                    const fileData = new FormData();
                    fileData.append("media", file);
                    try {
                      const res = await axios.post(`${API_BASE_URL}/api/news/upload`, fileData);
                      setFormData({...formData, imageUrl: res.data.url});
                      alert("फाइल सफलतापूर्वक अपलोड हो गई! (Uploaded successfully)");
                    } catch (err) { alert("Upload failed"); }
                  }} />
                </label>
              </div>

              <textarea placeholder="पूरी खबर यहाँ लिखें..." required className="w-full h-40 font-medium border-gray-200 border rounded-xl px-5 py-3 focus:ring-2 focus:ring-nagrik-red outline-none transition-all resize-none" onChange={e => setFormData({...formData, content: e.target.value})}></textarea>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-colors">रद्द करें</button>
                <button type="submit" className="px-6 py-2.5 rounded-xl font-bold text-white bg-nagrik-red hover:bg-[#c00024] shadow-md transition-colors flex items-center gap-2">पोस्ट करें और ऑटो-समरी बनाएँ <Zap className="w-4 h-4"/></button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
