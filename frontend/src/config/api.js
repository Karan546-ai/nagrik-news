// API Base URL Configuration
// In development: uses VITE_API_BASE_URL from .env.local (http://localhost:5000)
// In production: uses VITE_API_BASE_URL from .env.production or falls back to render URL

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export default API_BASE_URL;
