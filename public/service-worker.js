const CACHE_NAME = 'healthtrack-cache-v1';
const OFFLINE_URL = '/offline.html';

// Resources to pre-cache. Add any additional static files you want cached at install.
// Prefer a build-time injected precache manifest (Workbox injectManifest will replace
// `self.__WB_MANIFEST` with an array of {url, revision} entries). When that's not
// available (dev / manual usage), fall back to a small static list that exists in
// the production `dist/` output.
const PRECACHE_URLS = (self.__WB_MANIFEST && Array.isArray(self.__WB_MANIFEST)
  ? self.__WB_MANIFEST.map((entry) => entry.url || entry)
  : [
      '/',
      '/index.html',
      OFFLINE_URL,
      '/icons/icon-192.svg',
      '/icons/icon-512.svg',
    ]);

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Basic network-first strategy with offline fallback for navigation requests
self.addEventListener('fetch', (event) => {
  // Only handle navigation requests (HTML pages)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // If we got a response, put a copy in the cache
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          return response;
        })
        .catch(() => caches.match(event.request).then((cached) => cached || caches.match(OFFLINE_URL)))
    );
    return;
  }

  // For other requests, try cache first, then network
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;
      return fetch(event.request)
        .then((networkResponse) => {
          // Optionally cache fetched assets
          return networkResponse;
        })
        .catch(() => {
          // If request is for an image, you could return a placeholder here
          return;
        });
    })
  );
});
