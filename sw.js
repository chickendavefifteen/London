/* London Tutor — network-first cache. Always tries the network so code
 * changes propagate on the next page load; falls back to the most recent
 * cached copy only when offline. */
const CACHE = 'london-tutor-v6';

self.addEventListener('install', (e) => { self.skipWaiting(); });

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ).then(() => self.clients.claim()));
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  e.respondWith(
    fetch(req).then((resp) => {
      const copy = resp.clone();
      caches.open(CACHE).then((c) => c.put(req, copy).catch(()=>{}));
      return resp;
    }).catch(() => caches.match(req).then(hit => hit || caches.match('./index.html')))
  );
});
