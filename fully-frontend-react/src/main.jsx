import React from 'react';
import ReactDOM from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import App from './App.jsx';
import ErrorBoundary from './components/ErrorBoundary';
import './styles/index.css'; // Globally applied styles
import './styles/mobile-responsive.css'; // Mobile responsive overrides

const redirect = sessionStorage.getItem('redirect');
if (redirect) {
    sessionStorage.removeItem('redirect');
    window.history.replaceState(null, null, redirect);
}

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js').catch(err => {
            console.log('SW registration failed: ', err);
        });
    });
}

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <HelmetProvider>
            <ErrorBoundary>
                <App />
            </ErrorBoundary>
        </HelmetProvider>
    </React.StrictMode>,
)
