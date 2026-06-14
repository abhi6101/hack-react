const CACHE_NAME = 'hack2hired-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request).then(response => {
        if (response) {
          return response;
        }
        // If not in cache and network fails, return cached index.html for SPA routing
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html').then(htmlResponse => {
            return htmlResponse || new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
          });
        }
        // Prevent TypeError by always returning a Response
        return new Response('', { status: 503, statusText: 'Service Unavailable' });
      });
    })
  );
});
