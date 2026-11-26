/* Plates offline cache. The build fills in the version and the file list.
   Everything the app needs is copied into the cache when this installs, so it opens with no connection.
   A new version installs in the background and takes over the next time the app starts, or when the page asks. */
const BUILD = 'd8a90cb380';
const CACHE = 'plates-' + BUILD;
const ASSETS = ["./","app.css?v=d8a90cb380","app.js?v=d8a90cb380","manifest.webmanifest","icon-192.png","big-shoulders-display-latin-800-normal.woff2","big-shoulders-display-latin-900-normal.woff2","barlow-latin-400-normal.woff2","barlow-latin-500-normal.woff2","barlow-latin-600-normal.woff2","barlow-latin-700-normal.woff2"];

self.addEventListener('install', ev => {
  ev.waitUntil(caches.open(CACHE).then(cache => Promise.all(ASSETS.map(u =>
    fetch(new Request(u, { cache: 'reload' })).then(r => {
      if (!r.ok) throw new Error(u + ': ' + r.status);
      return cache.put(u, r);
    })
  ))));
});
self.addEventListener('activate', ev => {
  ev.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k.indexOf('plates-') === 0 && k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('message', ev => { if (ev.data === 'skip') self.skipWaiting(); });
self.addEventListener('fetch', ev => {
  const req = ev.request;
  if (req.method !== 'GET') return;
  if (new URL(req.url).origin !== self.location.origin) return;
  const hit = caches.open(CACHE).then(cache => req.mode === 'navigate' ? cache.match('./') : cache.match(req));
  ev.respondWith(hit.then(r => r || fetch(req)));
});
