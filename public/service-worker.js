const CACHE_NAME = "like-mind-pwa-v1";
const OFFLINE_URL = "/offline.html";

// Challenge & dynamic routes to bypass
const BLOCKED_PATHS = ["/cdn-cgi/", "/verify", "/challenge"];

// Install: cache core assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    Promise.all([
      caches
        .open(CACHE_NAME)
        .then((cache) =>
          cache.addAll([
            "/",
            OFFLINE_URL,
            "/favicon.ico",
            "/icons/icon-192x192.png",
            "/icons/icon-512x512.png",
            "/manifest.json",
          ])
        ),
      // Notify clients about installation
      self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({ type: 'INSTALLED' });
        });
      })
    ])
  );
  self.skipWaiting();
});

// Activate: clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      )
    )
  );
  self.clients.claim();
});

// Fetch: smart cache strategy
self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Only handle GET requests
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Bypass challenge or dynamic paths
  if (BLOCKED_PATHS.some((path) => url.pathname.startsWith(path))) {
    return;
  }

  // Handle navigation to offline fallback
  if (request.mode === "navigate") {
    event.respondWith(fetch(request).catch(() => caches.match(OFFLINE_URL)));
    return;
  }

  // Respond with cache, fallback to network
  event.respondWith(
    caches
      .match(request)
      .then((cached) => {
        return (
          cached ||
          fetch(request).then((res) => {
            // Clone and cache response
            return caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, res.clone());
              return res;
            });
          })
        );
      })
      .catch(() => caches.match(OFFLINE_URL))
  );
});
