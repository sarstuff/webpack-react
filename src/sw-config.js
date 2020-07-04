importScripts("https://storage.googleapis.com/workbox-cdn/releases/5.1.2/workbox-sw.js");
workbox.core.skipWaiting();
workbox.core.clientsClaim();

// workbox.precaching.precacheAndRoute(["index.html", "/"]);
workbox.routing.registerRoute(
  ({ url }) => url.origin === "https://api.weatherapi.com",
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: "weather",
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 5,
      }),
    ],
  })
);
workbox.routing.registerRoute(
  ({ url }) => url.origin === "https://api.weatherapi.com",
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: "weather",
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 5,
      }),
    ],
  })
);
workbox.routing.registerRoute(
  ({ url }) => url.origin === "https://tiles.sarmap.xyz",
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: "mapping",
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 260,
        maxAgeSeconds: 5 * 24 * 60 * 60,
      }),
    ],
  })
);
workbox.routing.registerRoute(
  ({ url }) => url.origin === "https://demo.sarsys.co.uk",
  new workbox.strategies.NetworkFirst({
    cacheName: "sarsys",
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 5,
        maxAgeSeconds: 1 * 24 * 60 * 60,
      }),
    ],
  })
);

workbox.routing.registerRoute(
  ({ request }) => request.destination === "script" || request.destination === "style",

  new workbox.strategies.StaleWhileRevalidate({
    cacheName: "static-resources",
  })
);
workbox.precaching.precacheAndRoute(self.__WB_MANIFEST);
