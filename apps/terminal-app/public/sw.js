// LocQar Kiosk Service Worker — network-first, only cache successful responses
const CACHE_NAME = 'locqar-kiosk-v2';

self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  // Clear old caches
  e.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n)))
    ).then(() => clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  // Skip non-GET and API calls
  if (e.request.method !== 'GET' || e.request.url.includes('/api/')) {
    return;
  }

  // Network-first: try network, cache successful responses, fall back to cache
  e.respondWith(
    fetch(e.request)
      .then((response) => {
        // Only cache successful responses (not 404s, 500s, etc.)
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(e.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(e.request))
  );
});
