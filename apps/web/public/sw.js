self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('optra-v1').then((cache) => cache.addAll(['/','/manifest.json']))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});


