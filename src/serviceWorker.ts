/// <reference lib="webworker" />

declare const self: ServiceWorkerGlobalScope

// Service Worker for caching audio and images
const CACHE_NAME = 'wedding-cache-v1'
const STATIC_ASSETS = ['/weddingmusic.mp3']

// Install event - cache static assets
self.addEventListener('install', (event: ExtendableEvent) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch(() => {
        console.log('Some static assets failed to cache')
      })
    }),
  )
  self.skipWaiting()
})

// Activate event - clean up old caches
self.addEventListener('activate', (event: ExtendableEvent) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName)
          }
        }),
      )
    }),
  )
  self.clients.claim()
})

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event: FetchEvent) => {
  const url = new URL(event.request.url)

  // Cache-first strategy for images and audio
  if (
    event.request.method === 'GET' &&
    (event.request.url.includes('.jpg') ||
      event.request.url.includes('.jpeg') ||
      event.request.url.includes('.png') ||
      event.request.url.includes('.webp') ||
      event.request.url.includes('.gif') ||
      event.request.url.includes('.mp3') ||
      event.request.url.includes('.wav') ||
      event.request.url.includes('cloudinary.com') ||
      url.pathname.startsWith('/weddingmusic'))
  ) {
    event.respondWith(
      caches
        .match(event.request)
        .then((cachedResponse) => {
          if (cachedResponse) {
            // Serve from cache and update in background
            return cachedResponse
          }

          // Not in cache, fetch from network
          return fetch(event.request).then((response) => {
            // Only cache successful responses
            if (!response || response.status !== 200 || response.type === 'error') {
              return response
            }

            // Clone the response
            const responseToCache = response.clone()

            // Add to cache asynchronously
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache)
            })

            return response
          })
        })
        .catch(() => {
          // If offline and not in cache, return offline response
          return new Response('Offline - resource not in cache', { status: 503 })
        }),
    )
  }
})

export {}
