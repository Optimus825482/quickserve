// QuickServe - Service Worker
// Merit Royal Diamond Otel

const CACHE_NAME = "quickserve-v1";
const urlsToCache = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./firebase-config.js",
  "./assets/logo.png",
  "./assets/icon-192.png",
  "./assets/icon-512.png",
  "./assets/apple-touch-icon.png",
  "./manifest.json",
];

// Service Worker Install
self.addEventListener("install", (event) => {
  console.log("🔧 Service Worker: Installing...");

  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("📦 Service Worker: Caching files");
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.error("❌ Service Worker: Cache error", error);
      })
  );

  // Yeni service worker'ı hemen aktif et
  self.skipWaiting();
});

// Service Worker Activate
self.addEventListener("activate", (event) => {
  console.log("✅ Service Worker: Activated");

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log("🗑️ Service Worker: Deleting old cache", cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );

  // Tüm client'ları kontrol et
  return self.clients.claim();
});

// Fetch Event - Cache First Strategy
self.addEventListener("fetch", (event) => {
  // Chrome extension ve unsupported scheme'leri ignore et
  const url = new URL(event.request.url);
  if (
    url.protocol === "chrome-extension:" ||
    url.protocol === "moz-extension:" ||
    !url.protocol.startsWith("http")
  ) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      // Cache'de varsa döndür
      if (response) {
        return response;
      }

      // Cache'de yoksa network'ten al
      return fetch(event.request)
        .then((response) => {
          // Geçerli response değilse döndür
          if (
            !response ||
            response.status !== 200 ||
            response.type !== "basic"
          ) {
            return response;
          }

          // Response'u clone'la ve cache'e ekle
          const responseToCache = response.clone();

          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });

          return response;
        })
        .catch((error) => {
          console.error("❌ Fetch error:", error);

          // Offline fallback
          if (event.request.destination === "document") {
            return caches.match("/index.html");
          }
        });
    })
  );
});

// FCM Push Event - Background Notification
self.addEventListener("push", (event) => {
  console.log("📨 Service Worker: Push event received");

  try {
    let data = {};
    let notification = {};

    if (event.data) {
      const payload = event.data.json();
      data = payload.data || {};
      notification = payload.notification || {};
    }

    const title = notification.title || "Servis Talebi";
    const options = {
      body: notification.body || `${data.salon} salonundan servis talebi`,
      icon: notification.icon || "/assets/logo.png",
      badge: notification.badge || "/assets/logo.png",
      tag: "service-request",
      requireInteraction: true,
      vibrate: [200, 100, 200, 100, 200],
      data: data,
      actions: [
        {
          action: "view",
          title: "Görüntüle",
        },
        {
          action: "close",
          title: "Kapat",
        },
      ],
    };

    event.waitUntil(self.registration.showNotification(title, options));
  } catch (error) {
    console.error("❌ Push event error:", error);
  }
});

// Notification Click Event
self.addEventListener("notificationclick", (event) => {
  console.log("🔔 Service Worker: Notification clicked");

  event.notification.close();

  if (event.action === "close") {
    return;
  }

  // Uygulamayı aç veya focus et
  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // Açık bir pencere varsa focus et
        for (let client of clientList) {
          if (client.url.includes("/staff") && "focus" in client) {
            return client.focus();
          }
        }

        // Açık pencere yoksa yeni pencere aç
        if (clients.openWindow) {
          return clients.openWindow("/staff/");
        }
      })
  );
});

// Background Sync (Opsiyonel - gelecek için)
self.addEventListener("sync", (event) => {
  console.log("🔄 Service Worker: Background sync");

  if (event.tag === "sync-requests") {
    event.waitUntil(
      // Senkronizasyon işlemleri
      Promise.resolve()
    );
  }
});

// Message Event - Client'tan mesaj al
self.addEventListener("message", (event) => {
  console.log("💬 Service Worker: Message received", event.data);

  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

console.log("🚀 Service Worker: Loaded");
