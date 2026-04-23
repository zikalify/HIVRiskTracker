const CACHE_NAME = 'hiv-risk-tracker-v62';
const ASSETS = [
  '/HIVRiskTracker/',
  '/HIVRiskTracker/?source=pwa',
  '/HIVRiskTracker/?action=new-encounter',
  '/HIVRiskTracker/index.html',
  '/HIVRiskTracker/style.css',
  '/HIVRiskTracker/app.js',
  '/HIVRiskTracker/manifest.json',
  '/HIVRiskTracker/icons/icon.svg',
  '/HIVRiskTracker/icons/icon-192.png',
  '/HIVRiskTracker/icons/icon-512.png',
  '/HIVRiskTracker/icons/icon-maskable-192.png',
  '/HIVRiskTracker/icons/icon-maskable-512.png',
  '/HIVRiskTracker/icons/apple-touch-icon.png',
  '/HIVRiskTracker/icons/favicon-32.png',
  '/HIVRiskTracker/icons/notification-badge.png'
];

// External assets that should also be cached
const EXTERNAL_ASSETS = [
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
  'https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200'
];

// Install Event
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('SW: Pre-caching assets');
        return cache.addAll([...ASSETS, ...EXTERNAL_ASSETS]);
      })
  );
  self.skipWaiting();
});

// Activate Event
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(name => {
          if (name !== CACHE_NAME) {
            console.log('SW: Clearing old cache', name);
            return caches.delete(name);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('notificationclick', event => {
  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
      for (const client of windowClients) {
        if ('focus' in client) {
          return client.focus();
        }
      }

      if (clients.openWindow) {
        return clients.openWindow('./?source=notification');
      }
    })
  );
});

// Fetch Event
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }

        return fetch(event.request).then(
          response => {
            if (!response || response.status !== 200 || response.type !== 'basic') {
              // For external assets like fonts, type will be 'cors' or 'opaque'
              if (event.request.url.includes('fonts.googleapis.com') || event.request.url.includes('fonts.gstatic.com')) {
                const responseToCache = response.clone();
                caches.open(CACHE_NAME).then(cache => {
                  cache.put(event.request, responseToCache);
                });
              }
              return response;
            }

            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseToCache);
            });

            return response;
          }
        ).catch(() => {
          if (event.request.mode === 'navigate') {
            return caches.match('/HIVRiskTracker/index.html') || caches.match('/HIVRiskTracker/');
          }
        });
      })
  );
});

