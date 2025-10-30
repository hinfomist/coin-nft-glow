// Service Worker for CryptoFlash PWA
const CACHE_NAME = 'cryptoflash-v1';
const STATIC_CACHE = 'cryptoflash-static-v1';
const DYNAMIC_CACHE = 'cryptoflash-dynamic-v1';

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/placeholder.svg',
  '/robots.txt',
  '/sitemap.xml'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .catch((error) => {
        console.error('Service Worker: Failed to cache static assets:', error);
      })
  );
  // Force activation
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            console.log('Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Take control of all clients
  self.clients.claim();
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip external requests (API calls, etc.)
  if (!url.origin.includes(self.location.origin)) return;

  // Handle API requests differently
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful API responses for a short time
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(DYNAMIC_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Return cached API response if available
          return caches.match(request);
        })
    );
    return;
  }

  // Cache-first strategy for static assets
  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        // Network-first for HTML pages
        return fetch(request)
          .then((response) => {
            // Don't cache non-successful responses
            if (!response.ok) return response;

            const responseClone = response.clone();

            // Cache the response
            caches.open(DYNAMIC_CACHE)
              .then((cache) => {
                cache.put(request, responseClone);
              })
              .catch((error) => {
                console.error('Service Worker: Failed to cache response:', error);
              });

            return response;
          })
          .catch((error) => {
            console.error('Service Worker: Fetch failed:', error);

            // Return offline fallback for HTML pages
            if (request.headers.get('accept').includes('text/html')) {
              return caches.match('/index.html');
            }

            // Return cached response if available
            return caches.match(request);
          });
      })
  );
});

// Background sync for offline actions (if supported)
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync triggered:', event.tag);

  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Handle offline actions here
      // For example: sync portfolio data, alerts, etc.
      Promise.resolve()
    );
  }
});

// Push notifications (if implemented)
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push received:', event);

  if (event.data) {
    const data = event.data.json();

    const options = {
      body: data.body,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: data.primaryKey
      }
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked:', event);

  event.notification.close();

  event.waitUntil(
    clients.openWindow('/')
  );
});

// Periodic background sync (if supported)
self.addEventListener('periodicsync', (event) => {
  console.log('Service Worker: Periodic sync triggered:', event.tag);

  if (event.tag === 'update-crypto-prices') {
    event.waitUntil(
      // Update crypto prices in background
      fetch('/api/crypto/prices')
        .then((response) => response.json())
        .then((data) => {
          // Store updated prices
          return self.clients.matchAll().then((clients) => {
            clients.forEach((client) => {
              client.postMessage({
                type: 'CRYPTO_PRICES_UPDATED',
                data: data
              });
            });
          });
        })
        .catch((error) => {
          console.error('Service Worker: Failed to update crypto prices:', error);
        })
    );
  }
});
