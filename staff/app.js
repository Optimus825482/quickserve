// QuickServe - Personel PWA
// Merit Royal Diamond Otel

// Global değişkenler
let messaging = null;
let deferredPrompt = null;

// DOM elementleri
const welcomeScreen = document.getElementById("welcome-screen");
const dashboardScreen = document.getElementById("dashboard-screen");
const errorScreen = document.getElementById("error-screen");
const enableNotificationsBtn = document.getElementById(
  "enable-notifications-btn"
);
const retryPermissionBtn = document.getElementById("retry-permission-btn");
const connectionStatus = document.getElementById("connection-status");
const lastRequestCard = document.getElementById("last-request-card");
const lastSalon = document.getElementById("last-salon");
const lastTime = document.getElementById("last-time");
const installPrompt = document.getElementById("install-prompt");
const installBtn = document.getElementById("install-btn");
const errorMessage = document.getElementById("error-message");
const debugLog = document.getElementById("debug-log");

// Debug Logger
function addDebugLog(message, type = "info") {
  const timestamp = new Date().toLocaleTimeString("tr-TR");
  const icon =
    {
      info: "ℹ️",
      success: "✅",
      error: "❌",
      warning: "⚠️",
    }[type] || "📝";

  const color =
    {
      info: "text-blue-700",
      success: "text-green-700",
      error: "text-red-700",
      warning: "text-orange-700",
    }[type] || "text-gray-700";

  const logEntry = document.createElement("div");
  logEntry.className = color;
  logEntry.textContent = `[${timestamp}] ${icon} ${message}`;

  if (debugLog) {
    debugLog.appendChild(logEntry);
    debugLog.scrollTop = debugLog.scrollHeight;
  }

  // Console'a da yaz
  console.log(`[${timestamp}] ${icon} ${message}`);
}

// Bildirim Yöneticisi Class
class NotificationManager {
  constructor() {
    this.maxRetries = 3;
    this.retryDelay = 2000;
  }

  async requestPermission() {
    let attempts = 0;

    while (attempts < this.maxRetries) {
      try {
        attempts++;
        const msg = `Bildirim izni isteniyor... (Deneme ${attempts}/${this.maxRetries})`;
        console.log(`🔔 ${msg}`);
        addDebugLog(msg, "info");

        // Notification API izni iste
        const permission = await Notification.requestPermission();

        if (permission === "granted") {
          console.log("✅ Bildirim izni verildi");
          addDebugLog("Bildirim izni verildi", "success");

          // FCM token al
          addDebugLog("FCM token alınıyor...", "info");
          const token = await this.getFCMToken();
          addDebugLog("FCM token başarıyla alındı", "success");

          // Token'ı kaydet
          this.saveToken(token);

          // Topic'e subscribe ol
          addDebugLog("Topic'e subscribe olunuyor...", "info");
          await this.subscribeToTopic(token);
          addDebugLog("Topic subscription başarılı", "success");

          return { success: true, token };
        } else if (permission === "denied") {
          throw new Error("Bildirim izni reddedildi");
        } else {
          throw new Error("Bildirim izni beklemede");
        }
      } catch (error) {
        console.error(`❌ İzin hatası (Deneme ${attempts}):`, error);
        addDebugLog(`İzin hatası: ${error.message}`, "error");

        if (
          attempts < this.maxRetries &&
          error.message !== "Bildirim izni reddedildi"
        ) {
          const msg = `${
            this.retryDelay / 1000
          } saniye sonra tekrar denenecek...`;
          console.log(`⏳ ${msg}`);
          addDebugLog(msg, "warning");
          await this.sleep(this.retryDelay);
        } else {
          throw error;
        }
      }
    }
  }

  async getFCMToken() {
    try {
      // Service Worker'ı kaydet
      addDebugLog("Service Worker kaydediliyor...", "info");
      const registration = await navigator.serviceWorker.register("sw.js");
      console.log("✅ Service Worker kaydedildi");
      addDebugLog("Service Worker kaydedildi", "success");

      // Service Worker'ın ready olmasını bekle
      addDebugLog("Service Worker hazır olması bekleniyor...", "info");
      await navigator.serviceWorker.ready;
      console.log("✅ Service Worker hazır");
      addDebugLog("Service Worker hazır", "success");

      // Messaging'in hazır olduğundan emin ol
      if (!messaging) {
        throw new Error("Firebase Messaging henüz hazır değil");
      }

      // FCM token al
      const token = await messaging.getToken({
        vapidKey: window.vapidKey,
        serviceWorkerRegistration: registration,
      });

      if (!token) {
        throw new Error("FCM token alınamadı");
      }

      console.log("✅ FCM Token alındı:", token.substring(0, 20) + "...");
      return token;
    } catch (error) {
      console.error("❌ Token alma hatası:", error);
      throw error;
    }
  }

  saveToken(token) {
    try {
      const tokenData = {
        token: token,
        subscribedTopics: ["service-requests"],
        lastUpdated: Date.now(),
      };

      localStorage.setItem("fcm_token", JSON.stringify(tokenData));
      console.log("✅ Token kaydedildi");
    } catch (error) {
      console.error("❌ Token kaydetme hatası:", error);
    }
  }

  async subscribeToTopic(token) {
    try {
      // Backend API URL'i
      const API_URL = window.QUICKSERVE_API_URL || "http://localhost:3000";

      const response = await fetch(`${API_URL}/api/subscribe`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: token,
          topic: "service-requests",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP Error: ${response.status}`);
      }

      const data = await response.json();
      console.log("✅ Topic subscription başarılı:", data);
    } catch (error) {
      console.error("❌ Topic subscription hatası:", error);
      addDebugLog(`Topic subscription hatası: ${error.message}`, "warning");
      // Bu hata kritik değil, LocalStorage fallback ile devam edebiliriz
    }
  }

  setupMessageListener() {
    try {
      // Foreground mesaj dinleyici
      messaging.onMessage((payload) => {
        console.log("📨 Foreground mesaj alındı:", payload);
        addDebugLog(`FCM mesaj alındı: ${payload.data?.salon}`, "success");
        this.handleMessage(payload);
      });

      // TEST MODU: LocalStorage polling (cross-tab communication)
      let lastNotificationTimestamp = 0;

      setInterval(() => {
        try {
          const notificationStr = localStorage.getItem(
            "quickserve-notification"
          );
          if (notificationStr) {
            const notificationData = JSON.parse(notificationStr);

            // Sadece yeni bildirimleri işle
            if (notificationData.timestamp > lastNotificationTimestamp) {
              lastNotificationTimestamp = notificationData.timestamp;
              console.log("📡 LocalStorage mesaj alındı:", notificationData);
              addDebugLog(
                `LocalStorage mesaj alındı: ${notificationData?.data?.salon}`,
                "success"
              );
              this.handleMessage(notificationData);
            }
          }
        } catch (error) {
          console.error("❌ LocalStorage polling hatası:", error);
        }
      }, 500); // Her 500ms kontrol et

      console.log("✅ LocalStorage polling başlatıldı (TEST MODU)");
      addDebugLog("LocalStorage polling başlatıldı (TEST MODU)", "success");

      console.log("✅ Mesaj dinleyici kuruldu");
      addDebugLog("Mesaj dinleyici kuruldu", "success");
    } catch (error) {
      console.error("❌ Mesaj dinleyici hatası:", error);
      addDebugLog(`Mesaj dinleyici hatası: ${error.message}`, "error");
    }
  }

  handleMessage(payload) {
    try {
      const { notification, data } = payload;

      // Son talebi güncelle
      if (data && data.salon) {
        this.updateLastRequest(data.salon, data.timestamp);
      }

      // Notification göster
      this.showNotification(notification, data);
    } catch (error) {
      console.error("❌ Mesaj işleme hatası:", error);
    }
  }

  showNotification(notification, data) {
    try {
      const options = {
        body: notification.body || `${data.salon} salonundan servis talebi`,
        icon: notification.icon || "/assets/logo.png",
        badge: notification.badge || "/assets/logo.png",
        tag: "service-request",
        requireInteraction: true,
        vibrate: [200, 100, 200],
        data: data,
      };

      new Notification(notification.title || "Servis Talebi", options);

      // Ses çal (opsiyonel)
      this.playNotificationSound();
    } catch (error) {
      console.error("❌ Bildirim gösterme hatası:", error);
    }
  }

  playNotificationSound() {
    try {
      // MP3 ses dosyasını çal
      const audio = new Audio("./assets/notification.mp3");
      audio.volume = 0.7; // Ses seviyesi %70
      audio.play().catch((error) => {
        console.warn("⚠️ Ses çalınamadı:", error);
        addDebugLog(
          "Ses çalınamadı (kullanıcı etkileşimi gerekebilir)",
          "warning"
        );
      });
      addDebugLog("Bildirim sesi çalındı", "success");
    } catch (error) {
      console.error("❌ Ses çalma hatası:", error);
      addDebugLog(`Ses çalma hatası: ${error.message}`, "error");
    }
  }

  updateLastRequest(salon, timestamp) {
    try {
      lastSalon.textContent = salon;

      const date = new Date(parseInt(timestamp));
      const timeStr = date.toLocaleTimeString("tr-TR", {
        hour: "2-digit",
        minute: "2-digit",
      });
      lastTime.textContent = timeStr;

      lastRequestCard.classList.remove("hidden");
    } catch (error) {
      console.error("❌ Son talep güncelleme hatası:", error);
    }
  }

  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// UI Manager Class
class UIManager {
  showWelcome() {
    welcomeScreen.classList.remove("hidden");
    dashboardScreen.classList.add("hidden");
    errorScreen.classList.add("hidden");
  }

  showDashboard() {
    welcomeScreen.classList.add("hidden");
    dashboardScreen.classList.remove("hidden");
    errorScreen.classList.add("hidden");
  }

  showError(message) {
    errorMessage.textContent = message;
    welcomeScreen.classList.add("hidden");
    dashboardScreen.classList.add("hidden");
    errorScreen.classList.remove("hidden");
  }

  updateConnectionStatus(isOnline) {
    if (isOnline) {
      connectionStatus.classList.remove("offline");
      connectionStatus.classList.add("online");
      connectionStatus.querySelector(".status-text").textContent = "Çevrimiçi";
    } else {
      connectionStatus.classList.remove("online");
      connectionStatus.classList.add("offline");
      connectionStatus.querySelector(".status-text").textContent = "Çevrimdışı";
    }
  }
}

// Instance'ları oluştur
const notificationManager = new NotificationManager();
const uiManager = new UIManager();

// Bildirim İzni Butonu
enableNotificationsBtn.addEventListener("click", async () => {
  try {
    enableNotificationsBtn.disabled = true;
    enableNotificationsBtn.textContent = "İzin isteniyor...";

    await notificationManager.requestPermission();

    // Mesaj dinleyicisini kur
    notificationManager.setupMessageListener();

    // Dashboard'a geç
    uiManager.showDashboard();
  } catch (error) {
    console.error("❌ İzin alma hatası:", error);

    let errorMsg = "Bildirim izni alınamadı";
    if (error.message.includes("reddedildi")) {
      errorMsg =
        "Bildirim izni reddedildi. Lütfen tarayıcı ayarlarından izin verin.";
    }

    uiManager.showError(errorMsg);
  } finally {
    enableNotificationsBtn.disabled = false;
    enableNotificationsBtn.innerHTML =
      '<span class="text-2xl mr-2">🔔</span> Bildirimlere İzin Ver';
  }
});

// Tekrar Dene Butonu
retryPermissionBtn.addEventListener("click", () => {
  uiManager.showWelcome();
});

// Bağlantı durumu izleme
window.addEventListener("online", () => {
  uiManager.updateConnectionStatus(true);
});

window.addEventListener("offline", () => {
  uiManager.updateConnectionStatus(false);
});

// PWA Install Prompt
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;
  installPrompt.classList.remove("hidden");
});

installBtn.addEventListener("click", async () => {
  if (!deferredPrompt) return;

  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;

  console.log(`PWA install outcome: ${outcome}`);

  deferredPrompt = null;
  installPrompt.classList.add("hidden");
});

// Firebase'i başlat
async function init() {
  try {
    console.log("🚀 QuickServe Personel başlatılıyor...");
    addDebugLog("QuickServe Personel başlatılıyor...", "info");

    // Firebase'i initialize et
    addDebugLog("Firebase initialize ediliyor...", "info");
    const { app, messaging: msg } = await initializeFirebase();
    messaging = msg;
    addDebugLog("Firebase hazır", "success");

    // Bildirim izni kontrolü
    if (Notification.permission === "granted") {
      // İzin zaten verilmiş, direkt dashboard'a geç
      console.log("✅ Bildirim izni zaten verilmiş");
      addDebugLog(
        "Bildirim izni zaten verilmiş, dashboard'a geçiliyor",
        "success"
      );

      const savedToken = localStorage.getItem("fcm_token");
      if (savedToken) {
        addDebugLog("Önceki token bulundu", "success");
      } else {
        addDebugLog("Token yok, yeni token alınacak", "info");
        // Token yoksa al
        try {
          const token = await notificationManager.getFCMToken();
          notificationManager.saveToken(token);
          await notificationManager.subscribeToTopic(token);
        } catch (error) {
          console.warn("⚠️ Token alınamadı:", error);
          addDebugLog(
            "Token alınamadı, Broadcast Channel kullanılacak",
            "warning"
          );
        }
      }

      notificationManager.setupMessageListener();
      uiManager.showDashboard();
    } else {
      // İzin verilmemiş, hoş geldiniz ekranını göster
      addDebugLog("Bildirim izni bekleniyor", "info");
      uiManager.showWelcome();
    }

    // Bağlantı durumunu güncelle
    uiManager.updateConnectionStatus(navigator.onLine);

    console.log("✅ Sistem hazır");
    addDebugLog("Sistem hazır", "success");
  } catch (error) {
    console.error("❌ Başlatma hatası:", error);
    uiManager.showError("Sistem başlatılamadı. Lütfen sayfayı yenileyin.");
  }
}

// Sayfa yüklendiğinde başlat
window.addEventListener("DOMContentLoaded", init);
