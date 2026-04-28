/* eslint-disable no-restricted-globals */
const CACHE_NAME = "habit-tracker-shell-v1";

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            try {
              cache.put(event.request, response.clone());
            } catch {
              /* ignore cache write failures for opaque responses */
            }
          }
          return response;
        })
        .catch(() =>
          cache.match(event.request).then((cached) => {
            if (cached) {
              return cached;
            }
            if (event.request.mode === "navigate") {
              return cache.match("/");
            }
            return undefined;
          }).then(
            (res) =>
              res ??
              new Response("Offline", {
                status: 200,
                headers: { "Content-Type": "text/plain; charset=utf-8" },
              }),
          ),
        );
    }),
  );
});
