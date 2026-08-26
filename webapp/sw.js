const CACHE_NAME = 'hve-register-v9';
const urlsToCache = [
  '/webapp/',
  '/webapp/index.html',
  '/webapp/manifest.json',
  '/webapp/icon-192.png',
  '/webapp/icon-512.png',
  '/webapp/icon-maskable-512.png'
];

self.addEventListener('install', event => {
  // Skip waiting: activate new SW immediately without waiting for old tabs to close
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('activate', event => {
  // Take control of all open tabs immediately
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      // Delete ALL old caches
      caches.keys().then(cacheNames =>
        Promise.all(
          cacheNames
            .filter(name => name !== CACHE_NAME)
            .map(name => caches.delete(name))
        )
      )
    ])
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  // Always refresh navigations and PWA metadata; fall back to the app shell offline.
  const url = new URL(event.request.url);
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match('/webapp/'))
    );
  } else if (url.origin === self.location.origin && url.pathname === '/webapp/manifest.json') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match('/webapp/manifest.json'))
    );
  } else if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(event.request).then(response => response || fetch(event.request))
    );
  }
});
