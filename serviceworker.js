const VERSION = "5.3.0"; /* update whenever anything changes */

self.addEventListener("install", event => {
    // console.log("PWA Install: " + VERSION);
    self.skipWaiting();
    event.waitUntil((async () => {
        const cache = await caches.open(VERSION);
        cache.addAll(["./"]);
    })());
});

self.addEventListener("activate", event => {
    // console.log("PWA Activate: " + VERSION);
    self.clients.claim();
    event.waitUntil((async () => {
        const keys = await caches.keys();
        keys.forEach(async (key) => {
            if (key !== VERSION) {
                // console.log("PWA Delete: " + key);
                await caches.delete(key);
            }
        });
    })());
});

self.addEventListener("fetch", event => {
    // console.log("PWA Fetch: " + VERSION);
    event.respondWith((async () => {
        const cache = await caches.open(VERSION);
        const cacheResponse = await cache.match(event.request);
        if (cacheResponse) {
            return cacheResponse;
        }
        else {
            try {
                const fetchResponse = await fetch(event.request);
                if (event.request.method === "GET") {
                    cache.put(event.request, fetchResponse.clone());
                }
                return fetchResponse;
            }
            catch (e) {
                // console.warn(e);
            }
        }
    })());
});
