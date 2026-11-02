// Service Worker for Caching Cloudinary & Media Images
// Strategy: Cache-First for images (User visits a page -> image loads once -> saved in CacheStorage)
// Next time the user visits or navigates, the image is served instantly from CacheStorage without hitting Cloudinary.

const CACHE_NAME = 'divine-images-cache-v1';

// Max items to keep in cache so device storage is kept reasonable
const MAX_CACHE_ENTRIES = 500;

self.addEventListener('install', (event) => {
  // Activate worker immediately once installed
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            return caches.delete(name);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Helper to check if request is an image from Cloudinary or media assets
function isCachableImage(request) {
  if (request.method !== 'GET') return false;
  const url = request.url;
  
  // Cloudinary image assets
  if (url.includes('cloudinary.com') || url.includes('res.cloudinary.com')) {
    return true;
  }

  // Common image extensions and destination
  if (request.destination === 'image') {
    return true;
  }

  return /\.(png|jpg|jpeg|webp|svg|gif|avif)($|\?)/i.test(url);
}

self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (isCachableImage(request)) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        // 1. Check if we already have the image cached in CacheStorage / local device
        const cachedResponse = await cache.match(request);
        if (cachedResponse) {
          return cachedResponse;
        }

        // 2. If not cached, fetch from network (Cloudinary)
        try {
          const networkResponse = await fetch(request);

          // Only cache valid OK responses
          if (networkResponse && (networkResponse.status === 200 || networkResponse.type === 'opaque')) {
            // Clone the response because the stream can only be consumed once
            cache.put(request, networkResponse.clone());

            // Optional cleanup if cache gets too large
            trimCache(cache, MAX_CACHE_ENTRIES);
          }

          return networkResponse;
        } catch (error) {
          // If network failed and nothing in cache, return what we can
          return cachedResponse || Response.error();
        }
      })
    );
  }
});

// Trim cache if entries exceed max allowed
async function trimCache(cache, maxItems) {
  try {
    const keys = await cache.keys();
    if (keys.length > maxItems) {
      await cache.delete(keys[0]);
    }
  } catch (err) {
    // Non-critical, ignore
  }
}
