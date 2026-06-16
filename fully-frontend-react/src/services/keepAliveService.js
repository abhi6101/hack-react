// Server Keep-Alive Service
// This service pings the backend every 10 minutes to prevent Render free tier spin-down

import API_BASE_URL_RAW from '../config';

const API_BASE_URL = API_BASE_URL_RAW.replace('/api', '');
const PING_INTERVAL = 10 * 60 * 1000; // 10 minutes in milliseconds

class KeepAliveService {
    constructor() {
        this.intervalId = null;
        this.isActive = false;
    }

    async pingServer() {
        // BUG FIX #4: Only ping when a user is authenticated.
        // Previously this pinged for ALL visitors (including anonymous users on /home),
        // generating constant unnecessary bandwidth from every browser session.
        const token = localStorage.getItem('authToken');
        if (!token) {
            return false; // No logged-in user — skip this ping cycle
        }

        try {
            // API_BASE_URL already has /api stripped, so we add /api/health explicitly.
            // e.g., if config = "https://backend.render.com/api" → base = "https://backend.render.com"
            //        → ping URL = "https://backend.render.com/api/health" ✓
            const response = await fetch(`${API_BASE_URL}/api/health`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                console.log('✅ Server keep-alive ping successful:', data);
                return true;
            } else {
                console.warn('⚠️ Server ping returned non-OK status:', response.status);
                return false;
            }
        } catch (error) {
            console.error('❌ Server keep-alive ping failed:', error);
            return false;
        }
    }

    start() {
        if (this.isActive) {
            console.log('Keep-alive service is already running');
            return;
        }

        console.log('🚀 Starting server keep-alive service...');

        // Ping immediately on start
        this.pingServer();

        // Then ping every 10 minutes
        this.intervalId = setInterval(() => {
            this.pingServer();
        }, PING_INTERVAL);

        this.isActive = true;
        console.log(`✅ Keep-alive service started (pinging every ${PING_INTERVAL / 60000} minutes)`);
    }

    stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
            this.isActive = false;
            console.log('🛑 Keep-alive service stopped');
        }
    }

    getStatus() {
        return {
            isActive: this.isActive,
            pingInterval: PING_INTERVAL,
            nextPingIn: this.isActive ? PING_INTERVAL : null
        };
    }
}

// Create singleton instance
const keepAliveService = new KeepAliveService();

export default keepAliveService;
