const CACHE_NAME = 'cqufic-static-v20260522-3';

const CORE_ASSETS = [
  './',
  'index.html',
  'admission-process.html',
  'info-library.html',
  'info-detail.html',
  'map.html',
  'shared.css',
  'mobile.css',
  'glass.css',
  'shared.js',
  'map-data.js',
  'manifest.json',
  'CQUS.svg',
  'assets/fontawesome/css/all.min.css',
  'assets/fontawesome/webfonts/fa-brands-400.woff2',
  'assets/fontawesome/webfonts/fa-regular-400.woff2',
  'assets/fontawesome/webfonts/fa-solid-900.woff2',
  'assets/fontawesome/webfonts/fa-v4compatibility.woff2',
  'assets/icons/icon-192.png',
  'assets/icons/icon-512.png'
];

const MAP_ASSETS = [
  'assets/maps/a-960.webp',
  'assets/maps/a-1920.webp',
  'assets/maps/b-960.webp',
  'assets/maps/b-1920.webp',
  'assets/maps/c-960.webp',
  'assets/maps/c-1920.webp',
  'assets/maps/huxi-960.webp',
  'assets/maps/huxi-1920.webp',
  'assets/maps/liangjiang-960.webp',
  'assets/maps/liangjiang-1920.webp'
];

const PRECACHE_ASSETS = [...CORE_ASSETS, ...MAP_ASSETS];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys
        .filter(key => key !== CACHE_NAME)
        .map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.destination === 'image' ||
      request.destination === 'font' ||
      request.destination === 'style' ||
      request.destination === 'script') {
    event.respondWith(cacheFirst(request));
    return;
  }

  event.respondWith(networkFirst(request));
});

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  const cache = await caches.open(CACHE_NAME);
  cache.put(request, response.clone());
  return response;
}

async function networkFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const response = await fetch(request);
    cache.put(request, response.clone());
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    if (cached) return cached;
    throw error;
  }
}
