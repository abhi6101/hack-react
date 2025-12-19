// Smart Config
// If VITE_API_BASE_URL is set (in deployment), use it.
// Otherwise, default to Localhost for development.

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

export default API_BASE_URL;
