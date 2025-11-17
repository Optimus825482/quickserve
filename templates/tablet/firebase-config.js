// Firebase Configuration - Tablet Arayüzü
// QuickServe - Merit Royal Diamond Otel

// Firebase config bilgileri
const firebaseConfig = {
  apiKey: "AIzaSyD5brCkHqSPVCtt0XJmUMqZizrjK_HX9dc",
  authDomain: "shuttle-call-835d9.firebaseapp.com",
  projectId: "shuttle-call-835d9",
  storageBucket: "shuttle-call-835d9.firebasestorage.app",
  messagingSenderId: "1044072191950",
  appId: "1:1044072191950:web:dc780e1832d3a4ee5afd9f",
  measurementId: "G-DCP7FTRM9Q",
};

// VAPID Key (FCM için)
const vapidKey =
  "BBrNGl2-VPA-iuLasrj8jpS2Sj2FrYr-FQq57GET6ofRV4QOljRwyLg--HMI-bV7m-lmdBk5NJxSyy3nVpNLzA4";

// Firebase'i initialize et
async function initializeFirebase() {
  let app;
  try {
    // Firebase App'i başlat
    app = firebase.initializeApp(firebaseConfig);
    console.log("✅ Firebase initialized");

    // Tablet için Messaging DEVRE DIŞI (sadece backend API kullanılıyor)
    // Çünkü tablet bildirim almıyor, sadece gönderiyor
    console.log("ℹ️ Firebase Messaging disabled for tablet (not needed)");

    return { app, messaging: null };
  } catch (error) {
    console.error("❌ Firebase initialization error:", error);
    return { app: null, messaging: null };
  }
}

// Export
window.firebaseConfig = firebaseConfig;
window.vapidKey = vapidKey;
window.initializeFirebase = initializeFirebase;
