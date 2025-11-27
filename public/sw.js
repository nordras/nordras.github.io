const CACHE_VERSION = 'v1';
const CACHE_NAME = `nordras-blog-${CACHE_VERSION}`;

// Assets para cache
const ASSETS_TO_CACHE = [
  '/',
  '/fonts/atkinson-regular.woff',
  '/fonts/atkinson-bold.woff',
];

// Install - cachear assets estáticos
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate - limpar caches antigos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name.startsWith('nordras-blog-') && name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch - estratégia Cache First para fontes, Network First para o resto
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Cache First para fontes
  if (url.pathname.startsWith('/fonts/')) {
    event.respondWith(
      caches.match(request).then((response) => {
        return response || fetch(request).then((fetchResponse) => {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, fetchResponse.clone());
            return fetchResponse;
          });
        });
      })
    );
    return;
  }

  // Network First para o resto
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Apenas cachear respostas bem-sucedidas
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Fallback para cache se offline
        return caches.match(request);
      })
  );
});
