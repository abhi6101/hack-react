// Smart Config
// If VITE_API_BASE_URL is set (like in Vercel), use it.
// If not (like on your laptop), use Localhost.
const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ||
    (isLocalhost ? "http://localhost:8080/api" : "https://placement-portal-backend-production.up.railway.app/api");

export default API_BASE_URL;
