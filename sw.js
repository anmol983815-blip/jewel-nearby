// Minimal service worker so the app can be installed. It does not cache anything,
// so customers always see the latest shops, prices and rates.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", e => e.waitUntil(self.clients.claim()));
self.addEventListener("fetch", () => {});
