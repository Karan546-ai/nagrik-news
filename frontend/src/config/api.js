// API Base URL Configuration
// Uses environment variable if available, defaults to localhost for development

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://nagrik-news-backend.onrender.com';

export default API_BASE_URL;
