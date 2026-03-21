import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, TrendingUp, UserPlus, Calendar, Mail, BarChart3 } from 'lucide-react';
import API_BASE_URL from '../config/api';

export default function UsersViewer() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterTimeframe, setFilterTimeframe] = useState('all');

  useEffect(() => {
    fetchUsersData();
  }, []);

  const fetchUsersData = async () => {
    try {
      setLoading(true);

      // Fetch user statistics
      const statsRes = await fetch(`${API_BASE_URL}/api/auth/users/stats`);
      const statsData = await statsRes.json();

      // Fetch all users
      const usersRes = await fetch(`${API_BASE_URL}/api/auth/users/all`);
      const usersData = await usersRes.json();

      if (statsData.success && usersData.success) {
        setStats(statsData);
        setUsers(usersData.users || []);
      } else {
        setError('डेटा लोड करने में विफल');
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('उपयोगकर्ता डेटा लोड नहीं हो सका');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('hi-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
          <Users className="w-12 h-12 text-gray-400 dark:text-gray-600" />
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400">
        {error}
      </div>
    );
  }

  // Filter users based on timeframe
  const filteredUsers = (() => {
    if (!Array.isArray(users)) return [];
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    return users.filter(user => {
      const userDate = new Date(user.createdAt);
      
      switch (filterTimeframe) {
        case 'today':
          return userDate >= today;
        case 'week':
          const weekAgo = new Date(today);
          weekAgo.setDate(weekAgo.getDate() - 7);
          return userDate >= weekAgo;
        case 'month':
          const monthAgo = new Date(today);
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          return userDate >= monthAgo;
        default:
          return true;
      }
    });
  })();

  return (
    <div className="space-y-8">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Total Users */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 p-6 rounded-2xl border border-blue-200 dark:border-blue-700 shadow-lg"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-600 dark:text-gray-400 font-bold text-sm uppercase">कुल उपयोगकर्ता</h3>
            <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <p className="text-4xl font-black text-blue-600 dark:text-blue-400">{stats?.totalUsers || 0}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">सभी पंजीकृत उपयोगकर्ता</p>
        </motion.div>

        {/* This Week */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 p-6 rounded-2xl border border-green-200 dark:border-green-700 shadow-lg"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-600 dark:text-gray-400 font-bold text-sm uppercase">इस सप्ताह</h3>
            <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <p className="text-4xl font-black text-green-600 dark:text-green-400">{stats?.lastWeekUsers || 0}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">नए लोग शामिल हुए</p>
        </motion.div>

        {/* Today */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/30 p-6 rounded-2xl border border-orange-200 dark:border-orange-700 shadow-lg"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-600 dark:text-gray-400 font-bold text-sm uppercase">आज</h3>
            <UserPlus className="w-6 h-6 text-orange-600 dark:text-orange-400" />
          </div>
          <p className="text-4xl font-black text-orange-600 dark:text-orange-400">{stats?.todayUsers || 0}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">नई साइन अप</p>
        </motion.div>

        {/* Growth Percentage */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 p-6 rounded-2xl border border-purple-200 dark:border-purple-700 shadow-lg"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-600 dark:text-gray-400 font-bold text-sm uppercase">सप्ताह की वृद्धि</h3>
            <BarChart3 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <p className="text-4xl font-black text-purple-600 dark:text-purple-400">
            {stats?.totalUsers > 0 ? ((stats?.lastWeekUsers / stats?.totalUsers) * 100).toFixed(1) : 0}%
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">कुल का हिस्सा</p>
        </motion.div>
      </div>

      {/* Signup Trend Chart */}
      {stats?.signupTrend && stats.signupTrend.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg"
        >
          <h2 className="text-xl font-black text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-red-600 dark:text-red-500" />
            पिछले 7 दिनों की साइन अप ट्रेंड
          </h2>
          
          <div className="flex items-end justify-between h-64 gap-3 p-6 bg-gray-50 dark:bg-gray-700/30 rounded-xl">
            {stats.signupTrend.map((day, idx) => (
              <motion.div
                key={idx}
                initial={{ height: 0 }}
                animate={{ height: `${(day.count / Math.max(...stats.signupTrend.map(d => d.count), 5)) * 100}%` }}
                transition={{ delay: idx * 0.1, duration: 0.5 }}
                className="flex-1 bg-gradient-to-t from-red-500 to-red-400 dark:from-red-600 dark:to-red-500 rounded-t-lg group hover:shadow-lg transition-all relative min-h-12"
                title={`${day.date}: ${day.count} नई साइन अप`}
              >
                <div className="opacity-0 group-hover:opacity-100 transition-all absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap z-10">
                  {day.count}
                </div>
              </motion.div>
            ))}
          </div>
          
          <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mt-4 px-6">
            {stats.signupTrend.map((day, idx) => (
              <span key={idx} className="text-xs">
                {new Date(day.date).toLocaleDateString('hi-IN', { month: 'short', day: 'numeric' })}
              </span>
            ))}
          </div>
        </motion.div>
      )}

      {/* Users List */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-red-600 dark:text-red-500" />
            पंजीकृत उपयोगकर्ता ({filteredUsers.length})
          </h2>
          
          <div className="flex flex-wrap gap-2">
            {['all', 'today', 'week', 'month'].map((time) => (
              <button
                key={time}
                onClick={() => setFilterTimeframe(time)}
                className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                  filterTimeframe === time
                    ? 'bg-red-600 dark:bg-red-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {time === 'all' && 'सभी'}
                {time === 'today' && 'आज'}
                {time === 'week' && 'सप्ताह'}
                {time === 'month' && 'महीना'}
              </button>
            ))}
          </div>
        </div>

        {filteredUsers.length > 0 ? (
className="overflow-x-auto -mx-4 sm:mx-0"
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr className="text-left text-sm font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  <th className="px-6 py-4 border-b border-gray-200 dark:border-gray-600">#</th>
                  <th className="px-6 py-4 border-b border-gray-200 dark:border-gray-600">ईमेल</th>
                  <th className="px-6 py-4 border-b border-gray-200 dark:border-gray-600">नाम</th>
                  <th className="px-6 py-4 border-b border-gray-200 dark:border-gray-600">पंजीकृत तारीख</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user, idx) => (
                  <motion.tr
                    key={user._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
                  >
                    <td className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 text-gray-500 dark:text-gray-400 font-bold">
                      {idx + 1}
                    </td>
                    <td className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                        <span className="text-gray-800 dark:text-gray-200 font-semibold group-hover:text-red-600 dark:group-hover:text-red-500 transition-colors">
                          {user.email}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold">
                      {user.name || '—'}
                    </td>
                    <td className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 text-gray-600 dark:text-gray-400 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                        {formatDate(user.createdAt)}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <Users className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 font-semibold">
              {filterTimeframe === 'today' && 'आज कोई नई साइन अप नहीं हुई'}
              {filterTimeframe === 'week' && 'इस सप्ताह कोई नई साइन अप नहीं हुई'}
              {filterTimeframe === 'month' && 'इस महीने कोई नई साइन अप नहीं हुई'}
              {filterTimeframe === 'all' && 'कोई उपयोगकर्ता नहीं पाया गया'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
