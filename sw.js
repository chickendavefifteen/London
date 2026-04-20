/* London Tutor — offline cache. Cache core assets on install, then serve
 * cache-first with network fallback so the app works on the subway. */
const CACHE = 'london-tutor-v3';
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './engine.js',
  './london-book.js',
  './manifest.webmanifest',
  'https://cdnjs.cloudflare.com/ajax/libs/chess.js/0.10.3/chess.min.js'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS).catch(()=>{})));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  e.respondWith(
    caches.match(req).then((hit) => hit || fetch(req).then((resp) => {
      const copy = resp.clone();
      caches.open(CACHE).then((c) => c.put(req, copy).catch(()=>{}));
      return resp;
    }).catch(() => caches.match('./index.html')))
  );
});
