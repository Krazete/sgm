self.addEventListener("install", function () {
    self.skipWaiting();
    caches.keys().then(function (cs) {
        cs.forEach(function (c) {
            caches.delete(c);
        });
    });
});

self.addEventListener("activate", function () {
    self.registration.unregister().then(function () {
        return self.clients.matchAll();
    }).then(function (clients) {
        clients.forEach(function (client) {
            client.navigate(client.url);
        });
    });
});
