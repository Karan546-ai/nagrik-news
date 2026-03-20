// API Base URL Configuration
// Uses environment variable if available, defaults to localhost for development

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export default API_BASE_URL;
