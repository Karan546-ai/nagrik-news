import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { TrendingUp, Activity } from "lucide-react";
import { motion } from "framer-motion";
import API_BASE_URL from '../config/api';

export default function TrendingSidebar() {
  const navigate = useNavigate();
  const [trends, setTrends] = useState([]);

  useEffect(() => {
    // using mock backend or direct data
    axios.get(`${API_BASE_URL}/api/trending`)
      .then(res => setTrends(res.data))
      .catch(err => {
        // Fallback for UI if backend is not started
        setTrends([
            { topic: "Union Budget 2026", score: 95 },
            { topic: "AI Act Europe", score: 88 },
            { topic: "SpaceX Mars Mission", score: 82 },
            { topic: "T20 World Cup Final", score: 79 },
            { topic: "Nagrik News Launch", score: 75 }
        ]);
      });
  }, []);

  const handleTrendClick = (topic) => {
    navigate(`/?search=${encodeURIComponent(topic)}`);
  };

  const handleViewAll = () => {
    navigate('/?sort=trending');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 sticky top-24 transition-colors"
    >
      <div className="flex items-center gap-2 mb-6 text-red-600 dark:text-red-500">
        <TrendingUp className="w-5 h-5" />
        <h3 className="font-bold text-lg text-gray-900 dark:text-white">ट्रेंडिंग मुद्दे</h3>
      </div>
      
      <div className="space-y-5">
        {trends.map((trend, idx) => (
          <motion.div
            key={idx}
            whileHover={{ x: 4 }}
            onClick={() => handleTrendClick(trend.topic)}
            className="flex items-start gap-4 group cursor-pointer rounded-lg p-2 -m-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
          >
            <div className="font-black text-2xl text-gray-300 dark:text-gray-600 group-hover:text-red-600 dark:group-hover:text-red-500 transition-colors">
              0{idx + 1}
            </div>
            <div className="flex-1">
              <p className="font-bold text-gray-800 dark:text-gray-200 group-hover:text-red-600 dark:group-hover:text-red-500 transition-colors leading-tight">
                {trend.topic}
              </p>
              <div className="flex items-center gap-1 mt-1 text-xs text-gray-500 dark:text-gray-400 font-medium">
                <Activity className="w-3 h-3 text-green-500" /> 
                {trend.score}K खोजें
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleViewAll}
        className="w-full mt-6 py-2 text-sm font-semibold text-red-600 dark:text-red-500 border-2 border-red-600/30 dark:border-red-500/30 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
      >
        सभी देखें
      </motion.button>
    </motion.div>
  );
}
