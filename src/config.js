// Smart Config
// If VITE_API_BASE_URL is set (like in Vercel), use it.
// If not (like on your laptop), use Localhost.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

export default API_BASE_URL;
