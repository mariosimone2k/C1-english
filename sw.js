// Offline support: app files are cached on first visit and refreshed in the background.
const CACHE = "ascent-v7";
const APP = ["./", "index.html", "manifest.webmanifest", "icon-192.png", "icon-512.png", "apple-touch-icon.png", "css/app.css", "js/stages.js", "js/b1.js", "js/b2.js", "js/c1.js", "js/c2.js", "js/jflt.js", "js/leveltest.js", "js/teach.js", "js/app.js"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(APP)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  const cacheable = url.origin === location.origin || url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com";
  if (!cacheable) return;
  e.respondWith(caches.open(CACHE).then(async cache => {
    const cached = await cache.match(req, {ignoreSearch: true});
    const network = fetch(req).then(res => {
      if (res && (res.ok || res.type === "opaque")) cache.put(req, res.clone());
      return res;
    }).catch(() => cached);
    return cached || network;
  }));
});
