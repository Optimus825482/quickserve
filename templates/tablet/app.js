// QuickServe - Tablet Arayüzü
// Merit Royal Diamond Otel

// Global değişkenler
let messaging = null;
let selectedSalon = null;

// DOM elementleri
const salonCards = document.querySelectorAll(".salon-card");
const requestBtn = document.getElementById("request-btn");
const btnText = document.getElementById("btn-text");
const btnSpinner = document.getElementById("btn-spinner");
const successModal = document.getElementById("success-modal");
const errorModal = document.getElementById("error-modal");
const retryBtn = document.getElementById("retry-btn");

// Salon Seçici Class
class SalonSelector {
  constructor() {
    this.salons = ["Barnabas", "Zefiros", "Kourion", "Karmi"];
    this.selectedSalon = null;
    this.init();
  }

  init() {
    // Her salon kartına click event ekle
    salonCards.forEach((card) => {
      card.addEventListener("click", () => {
        const salonName = card.getAttribute("data-salon");
        this.selectSalon(salonName);
      });
    });
  }

  selectSalon(salonName) {
    try {
      console.log(`🏛️ Salon seçildi: ${salonName}`);

      // Önceki seçimi temizle
      salonCards.forEach((card) => card.classList.remove("selected"));

      // Yeni seçimi işaretle
      const selectedCard = document.querySelector(
        `[data-salon="${salonName}"]`
      );
      if (selectedCard) {
        selectedCard.classList.add("selected");
        this.selectedSalon = salonName;
        selectedSalon = salonName; // Global değişkeni güncelle

        // Butonu aktif et
        requestBtn.disabled = false;
      }
    } catch (error) {
      console.error("❌ Salon seçim hatası:", error);
    }
  }

  reset() {
    // Tüm seçimleri temizle
    salonCards.forEach((card) => card.classList.remove("selected"));
    this.selectedSalon = null;
    selectedSalon = null;
    requestBtn.disabled = true;
  }
}

// Bildirim Gönderici Class
class NotificationSender {
  constructor() {
    this.maxRetries = 3;
    this.retryDelay = 2000; // 2 saniye
    this.timeout = 5000; // 5 saniye
  }

  async sendRequest(salonName) {
    let attempts = 0;

    while (attempts < this.maxRetries) {
      try {
        attempts++;
        console.log(
          `📤 Bildirim gönderiliyor... (Deneme ${attempts}/${this.maxRetries})`
        );

        // FCM üzerinden topic'e mesaj gönder
        const result = await this.sendToTopic(salonName);

        console.log("✅ Bildirim başarıyla gönderildi");
        return { success: true, data: result };
      } catch (error) {
        console.error(`❌ Gönderim hatası (Deneme ${attempts}):`, error);

        if (attempts < this.maxRetries) {
          console.log(
            `⏳ ${this.retryDelay / 1000} saniye sonra tekrar denenecek...`
          );
          await this.sleep(this.retryDelay);
        } else {
          throw new Error("Maksimum deneme sayısına ulaşıldı");
        }
      }
    }
  }

  async sendToTopic(salonName) {
    return new Promise(async (resolve, reject) => {
      try {
        // Timeout mekanizması
        const timeoutId = setTimeout(() => {
          reject(new Error("İstek zaman aşımına uğradı"));
        }, this.timeout);

        // Backend API URL'i (Coolify'dan sonra güncellenecek)
        const API_URL = window.QUICKSERVE_API_URL || "http://localhost:3000";

        console.log(`📤 Bildirim gönderiliyor: ${salonName}`);

        // Backend'e POST isteği
        const response = await fetch(`${API_URL}/api/send-notification`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            salon: salonName,
            timestamp: Date.now(),
            type: "service-request",
          }),
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `HTTP Error: ${response.status}`);
        }

        const data = await response.json();
        console.log("✅ Backend response:", data);

        // LocalStorage ile cross-tab notification (fallback)
        const notificationData = {
          notification: {
            title: "Servis Talebi",
            body: `${salonName} salonundan servis talebi`,
          },
          data: {
            salon: salonName,
            timestamp: Date.now().toString(),
            type: "service-request",
            requestId: data.requestId,
          },
          timestamp: Date.now(),
        };
        localStorage.setItem(
          "quickserve-notification",
          JSON.stringify(notificationData)
        );
        console.log("📡 LocalStorage ile bildirim gönderildi (fallback)");

        setTimeout(() => {
          localStorage.removeItem("quickserve-notification");
        }, 100);

        resolve(data);
      } catch (error) {
        console.error("❌ sendToTopic error:", error);
        reject(error);
      }
    });
  }

  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// UI Feedback Class
class UIFeedback {
  showSuccess() {
    successModal.classList.remove("hidden");

    // 2 saniye sonra otomatik kapat
    setTimeout(() => {
      this.hideSuccess();
      salonSelector.reset();
    }, 2000);
  }

  hideSuccess() {
    successModal.classList.add("hidden");
  }

  showError() {
    errorModal.classList.remove("hidden");

    // 3 saniye sonra otomatik kapat
    setTimeout(() => {
      this.hideError();
    }, 3000);
  }

  hideError() {
    errorModal.classList.add("hidden");
  }

  showLoading() {
    btnText.classList.add("hidden");
    btnSpinner.classList.remove("hidden");
    requestBtn.disabled = true;
  }

  hideLoading() {
    btnText.classList.remove("hidden");
    btnSpinner.classList.add("hidden");
    requestBtn.disabled = false;
  }
}

// Instance'ları oluştur
const salonSelector = new SalonSelector();
const notificationSender = new NotificationSender();
const uiFeedback = new UIFeedback();

// Servis Talep Butonu Click Handler
requestBtn.addEventListener("click", async () => {
  if (!selectedSalon) {
    console.warn("⚠️ Salon seçilmedi");
    return;
  }

  try {
    // Loading durumunu göster
    uiFeedback.showLoading();

    // Bildirimi gönder
    await notificationSender.sendRequest(selectedSalon);

    // Başarı modalını göster
    uiFeedback.hideLoading();
    uiFeedback.showSuccess();
  } catch (error) {
    console.error("❌ Talep gönderme hatası:", error);

    // Hata modalını göster
    uiFeedback.hideLoading();
    uiFeedback.showError();
  }
});

// Tekrar Dene Butonu
retryBtn.addEventListener("click", () => {
  uiFeedback.hideError();

  // Eğer salon seçiliyse, tekrar gönder
  if (selectedSalon) {
    requestBtn.click();
  }
});

// Firebase'i başlat
async function init() {
  try {
    console.log("🚀 QuickServe Tablet başlatılıyor...");

    // Firebase'i initialize et
    const { app, messaging: msg } = await initializeFirebase();
    messaging = msg;

    console.log("✅ Sistem hazır");
  } catch (error) {
    console.error("❌ Başlatma hatası:", error);
    alert("Sistem başlatılamadı. Lütfen sayfayı yenileyin.");
  }
}

// Sayfa yüklendiğinde başlat
window.addEventListener("DOMContentLoaded", init);
