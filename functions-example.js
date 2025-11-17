// Firebase Cloud Functions - QuickServe
// Merit Royal Diamond Otel
//
// Bu dosya Firebase Functions klasörüne kopyalanmalı
// Kullanım: firebase deploy --only functions

const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

/**
 * Servis Talebi Gönderme
 *
 * Realtime Database'e yazılan servis taleplerini dinler
 * ve FCM üzerinden tüm personele bildirim gönderir
 */
exports.sendServiceRequest = functions.database
  .ref("/service-requests/{requestId}")
  .onCreate(async (snapshot, context) => {
    try {
      const request = snapshot.val();
      const requestId = context.params.requestId;

      console.log("📨 Yeni servis talebi:", {
        id: requestId,
        salon: request.salon,
        timestamp: request.timestamp,
      });

      // FCM mesaj payload'ı
      const message = {
        notification: {
          title: "Servis Talebi",
          body: `${request.salon} salonundan servis talebi`,
          icon: "/assets/logo.png",
          badge: "/assets/logo.png",
        },
        data: {
          salon: request.salon,
          timestamp: request.timestamp.toString(),
          type: "service-request",
          requestId: requestId,
        },
        topic: "service-requests",
        android: {
          priority: "high",
          notification: {
            sound: "default",
            channelId: "service-requests",
          },
        },
        apns: {
          payload: {
            aps: {
              sound: "default",
              badge: 1,
            },
          },
        },
        webpush: {
          notification: {
            requireInteraction: true,
            vibrate: [200, 100, 200],
          },
        },
      };

      // Bildirimi gönder
      const response = await admin.messaging().send(message);

      console.log("✅ Bildirim gönderildi:", response);

      // İsteğe bağlı: Gönderim kaydını tut
      await admin.database().ref(`/notifications/${requestId}`).set({
        salon: request.salon,
        timestamp: request.timestamp,
        sentAt: Date.now(),
        messageId: response,
      });

      return response;
    } catch (error) {
      console.error("❌ Bildirim gönderme hatası:", error);
      throw error;
    }
  });

/**
 * Topic Subscription Yönetimi
 *
 * Personel PWA'dan gelen subscription taleplerini işler
 * ve FCM token'ı ilgili topic'e subscribe eder
 */
exports.manageSubscriptions = functions.database
  .ref("/subscriptions/{subscriptionId}")
  .onCreate(async (snapshot, context) => {
    try {
      const subscription = snapshot.val();
      const subscriptionId = context.params.subscriptionId;

      console.log("🔔 Yeni subscription:", {
        id: subscriptionId,
        topic: subscription.topic,
      });

      // Token'ı topic'e subscribe et
      const response = await admin
        .messaging()
        .subscribeToTopic(subscription.token, subscription.topic);

      console.log("✅ Topic subscription başarılı:", response);

      // Subscription kaydını güncelle
      await admin.database().ref(`/subscriptions/${subscriptionId}`).update({
        subscribedAt: Date.now(),
        status: "active",
      });

      return response;
    } catch (error) {
      console.error("❌ Subscription hatası:", error);

      // Hata kaydını tut
      await admin
        .database()
        .ref(`/subscriptions/${context.params.subscriptionId}`)
        .update({
          status: "failed",
          error: error.message,
        });

      throw error;
    }
  });

/**
 * Eski Talepleri Temizleme (Opsiyonel)
 *
 * Her gün gece yarısı çalışır ve 7 günden eski talepleri siler
 */
exports.cleanupOldRequests = functions.pubsub
  .schedule("0 0 * * *") // Her gün gece 00:00
  .timeZone("Europe/Istanbul")
  .onRun(async (context) => {
    try {
      console.log("🧹 Eski talepler temizleniyor...");

      const now = Date.now();
      const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;

      // 7 günden eski talepleri bul
      const snapshot = await admin
        .database()
        .ref("/service-requests")
        .orderByChild("timestamp")
        .endAt(sevenDaysAgo)
        .once("value");

      if (!snapshot.exists()) {
        console.log("✅ Temizlenecek talep yok");
        return null;
      }

      // Talepleri sil
      const updates = {};
      snapshot.forEach((child) => {
        updates[child.key] = null;
      });

      await admin.database().ref("/service-requests").update(updates);

      console.log(`✅ ${Object.keys(updates).length} talep temizlendi`);

      return null;
    } catch (error) {
      console.error("❌ Temizleme hatası:", error);
      throw error;
    }
  });

/**
 * Bildirim İstatistikleri (Opsiyonel)
 *
 * Gönderilen bildirimlerin istatistiklerini tutar
 */
exports.updateStatistics = functions.database
  .ref("/notifications/{notificationId}")
  .onCreate(async (snapshot, context) => {
    try {
      const notification = snapshot.val();
      const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

      // Günlük istatistikleri güncelle
      await admin
        .database()
        .ref(`/statistics/${today}`)
        .transaction((current) => {
          if (!current) {
            return {
              totalRequests: 1,
              salons: {
                [notification.salon]: 1,
              },
            };
          }

          current.totalRequests = (current.totalRequests || 0) + 1;
          current.salons = current.salons || {};
          current.salons[notification.salon] =
            (current.salons[notification.salon] || 0) + 1;

          return current;
        });

      console.log("📊 İstatistikler güncellendi");

      return null;
    } catch (error) {
      console.error("❌ İstatistik hatası:", error);
      // İstatistik hatası kritik değil, devam et
      return null;
    }
  });

/**
 * Health Check Endpoint (Opsiyonel)
 *
 * Sistem sağlığını kontrol etmek için HTTP endpoint
 */
exports.healthCheck = functions.https.onRequest((req, res) => {
  res.status(200).json({
    status: "healthy",
    timestamp: Date.now(),
    service: "QuickServe",
    version: "1.0.0",
  });
});
