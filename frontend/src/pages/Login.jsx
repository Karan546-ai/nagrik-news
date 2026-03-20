import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react';
import API_BASE_URL from '../config/api';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        email: email.trim(),
        password
      });

      if (res.data.token) {
        localStorage.setItem('userToken', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        navigate('/');
        window.location.reload();
      }
    } catch (err) {
      setError(err.response?.data?.msg || 'लॉगिन विफल रहा');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/register`, {
        name: name.trim(),
        email: email.trim(),
        password,
        role: 'reader'
      });

      if (res.status === 201) {
        setError('');
        setIsRegister(false);
        setEmail('');
        setPassword('');
        setName('');
        alert('✅ पंजीकरण सफल! अब लॉगिन करें');
      }
    } catch (err) {
      setError(err.response?.data?.msg || 'पंजीकरण विफल रहा');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="min-h-screen flex items-center justify-center px-4 py-8"
    >
      <motion.div
        className="w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-8 border border-gray-200 dark:border-gray-700"
        initial={{ y: 20 }}
        animate={{ y: 0 }}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
            <LogIn className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">
            {isRegister ? 'नया खाता बनाएं' : 'लॉगिन करें'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {isRegister
              ? 'NAGRIK NEWS समुदाय में शामिल हों'
              : 'अपना खाता खोलने के लिए लॉगिन करें'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={isRegister ? handleRegisterSubmit : handleLoginSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                नाम
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="आपका नाम दर्ज करें"
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:border-red-600 focus:ring-2 focus:ring-red-100 dark:focus:ring-red-900 outline-none transition-all font-semibold"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
              ईमेल
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="आपका ईमेल दर्ज करें"
                className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:border-red-600 focus:ring-2 focus:ring-red-100 dark:focus:ring-red-900 outline-none transition-all font-semibold"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
              पासवर्ड
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="पासवर्ड दर्ज करें"
                className="w-full pl-12 pr-12 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:border-red-600 focus:ring-2 focus:ring-red-100 dark:focus:ring-red-900 outline-none transition-all font-semibold"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-3.5"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                ) : (
                  <Eye className="w-5 h-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                )}
              </button>
            </div>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-xl bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-400 text-sm font-semibold"
            >
              ❌ {error}
            </motion.div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-black py-3 rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50 uppercase tracking-wider text-sm"
          >
            {loading ? 'प्रसंस्करण...' : isRegister ? 'पंजीकरण करें' : 'लॉगिन करें'}
          </button>
        </form>

        {/* Toggle to Register/Login */}
        <div className="mt-6 text-center border-t border-gray-200 dark:border-gray-700 pt-6">
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
            {isRegister ? 'पहले से खाता है?' : 'खाता नहीं है?'}
          </p>
          <button
            onClick={() => {
              setIsRegister(!isRegister);
              setError('');
              setEmail('');
              setPassword('');
              setName('');
            }}
            className="text-red-600 dark:text-red-400 font-bold hover:underline transition-all"
          >
            {isRegister ? 'लॉगिन करें' : 'नया खाता बनाएं'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
