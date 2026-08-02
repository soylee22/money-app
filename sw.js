/* Cache the shell so the app opens with no signal.
   The build stamps a new version, which evicts the old cache. */
const V = 'purse-ad3528ffec4a';
const FILES = ['./', 'index.html', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(V).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(hit => {
      const live = fetch(e.request).then(res => {
        if (res && res.ok) { const copy = res.clone(); caches.open(V).then(c => c.put(e.request, copy)); }
        return res;
      }).catch(() => hit);
      return hit || live;
    })
  );
});
