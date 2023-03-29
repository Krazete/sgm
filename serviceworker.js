self.addEventListener("install", function () {
    caches.keys().then(function (cs) {
        cs.forEach(function (c) {
            caches.delete(c);
        });
    });
    navigator.serviceWorker.getRegistrations().then(function (sws) {
        sws.forEach(function (sw) {
            sw.unregister();
        });
    });
});
