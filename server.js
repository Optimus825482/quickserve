// QuickServe Backend Server
// Merit Royal Diamond Otel
// Coolify Deploy için Express.js + Firebase Admin

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const admin = require('firebase-admin');

// Express App
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Firebase Admin Initialization
let firebaseApp;
try {
  // Service account'u base64'ten decode et
  const serviceAccountBase64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;

  if (!serviceAccountBase64) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_BASE64 environment variable bulunamadı!');
  }

  const serviceAccount = JSON.parse(
    Buffer.from(serviceAccountBase64, 'base64').toString('utf-8')
  );

  firebaseApp = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: `https://${process.env.FIREBASE_PROJECT_ID || 'shuttle-call-835d9'}-default-rtdb.firebaseio.com`
  });

  console.log('✅ Firebase Admin initialized');
} catch (error) {
  console.error('❌ Firebase initialization error:', error);
  process.exit(1);
}

const db = admin.database();
const messaging = admin.messaging();

// ==================== Routes ====================

// Health Check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: Date.now(),
    service: 'QuickServe Backend',
    version: '1.0.0',
    firebase: firebaseApp ? 'connected' : 'disconnected'
  });
});

// Test endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'QuickServe Backend API',
    endpoints: {
      health: 'GET /health',
      sendNotification: 'POST /api/send-notification',
      subscribe: 'POST /api/subscribe',
      unsubscribe: 'POST /api/unsubscribe',
      statistics: 'GET /api/statistics'
    }
  });
});

// Bildirim Gönder
app.post('/api/send-notification', async (req, res) => {
  try {
    const { salon, timestamp, type } = req.body;

    // Validation
    if (!salon) {
      return res.status(400).json({
        success: false,
        error: 'Salon parametresi gerekli'
      });
    }

    const validSalons = ['Barnabas', 'Zefiros', 'Kourion', 'Karmi'];
    if (!validSalons.includes(salon)) {
      return res.status(400).json({
        success: false,
        error: `Geçersiz salon. Geçerli salonlar: ${validSalons.join(', ')}`
      });
    }

    // Realtime Database'e kaydet
    const requestRef = db.ref('service-requests').push();
    const requestId = requestRef.key;

    await requestRef.set({
      salon,
      timestamp: timestamp || Date.now(),
      type: type || 'service-request',
      createdAt: Date.now()
    });

    console.log(`📨 Yeni servis talebi: ${salon} (${requestId})`);

    // FCM Bildirim Gönder
    const message = {
      notification: {
        title: 'Servis Talebi',
        body: `${salon} salonundan servis talebi`
      },
      data: {
        salon,
        timestamp: (timestamp || Date.now()).toString(),
        type: type || 'service-request',
        requestId
      },
      topic: 'service-requests',
      webpush: {
        notification: {
          icon: '/assets/logo.png',
          badge: '/assets/logo.png',
          requireInteraction: true,
          vibrate: [200, 100, 200, 100, 200]
        },
        fcmOptions: {
          link: '/staff/'
        }
      },
      android: {
        priority: 'high',
        notification: {
          sound: 'default',
          channelId: 'service-requests'
        }
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: 1
          }
        }
      }
    };

    const messageId = await messaging.send(message);
    console.log(`✅ Bildirim gönderildi: ${messageId}`);

    // Notification kaydı
    await db.ref(`notifications/${requestId}`).set({
      salon,
      timestamp: timestamp || Date.now(),
      sentAt: Date.now(),
      messageId,
      status: 'sent'
    });

    // İstatistik güncelle
    await updateStatistics(salon);

    res.json({
      success: true,
      requestId,
      messageId,
      salon,
      timestamp: timestamp || Date.now()
    });

  } catch (error) {
    console.error('❌ Send notification error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Topic Subscribe
app.post('/api/subscribe', async (req, res) => {
  try {
    const { token, topic } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'Token parametresi gerekli'
      });
    }

    const topicName = topic || 'service-requests';

    // FCM topic subscription
    const response = await messaging.subscribeToTopic(token, topicName);
    console.log(`✅ Token topic'e subscribe oldu: ${topicName}`);

    // Database'e kaydet
    const subscriptionRef = db.ref('subscriptions').push();
    await subscriptionRef.set({
      token,
      topic: topicName,
      timestamp: Date.now(),
      subscribedAt: Date.now(),
      status: 'active'
    });

    res.json({
      success: true,
      topic: topicName,
      subscriptionId: subscriptionRef.key,
      response
    });

  } catch (error) {
    console.error('❌ Subscribe error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Topic Unsubscribe
app.post('/api/unsubscribe', async (req, res) => {
  try {
    const { token, topic } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'Token parametresi gerekli'
      });
    }

    const topicName = topic || 'service-requests';

    const response = await messaging.unsubscribeFromTopic(token, topicName);
    console.log(`✅ Token topic'ten unsubscribe oldu: ${topicName}`);

    res.json({
      success: true,
      topic: topicName,
      response
    });

  } catch (error) {
    console.error('❌ Unsubscribe error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// İstatistikler
app.get('/api/statistics', async (req, res) => {
  try {
    const { date } = req.query;
    const targetDate = date || new Date().toISOString().split('T')[0];

    const statsSnapshot = await db.ref(`statistics/${targetDate}`).once('value');
    const stats = statsSnapshot.val();

    if (!stats) {
      return res.json({
        success: true,
        date: targetDate,
        totalRequests: 0,
        salons: {}
      });
    }

    res.json({
      success: true,
      date: targetDate,
      ...stats
    });

  } catch (error) {
    console.error('❌ Statistics error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ==================== Helper Functions ====================

async function updateStatistics(salon) {
  try {
    const today = new Date().toISOString().split('T')[0];
    const statsRef = db.ref(`statistics/${today}`);

    await statsRef.transaction((current) => {
      if (!current) {
        return {
          totalRequests: 1,
          salons: {
            [salon]: 1
          },
          lastUpdated: Date.now()
        };
      }

      current.totalRequests = (current.totalRequests || 0) + 1;
      current.salons = current.salons || {};
      current.salons[salon] = (current.salons[salon] || 0) + 1;
      current.lastUpdated = Date.now();

      return current;
    });

    console.log('📊 İstatistikler güncellendi');
  } catch (error) {
    console.error('❌ Statistics update error:', error);
  }
}

// ==================== Realtime Database Listeners ====================

// Service requests dinle
db.ref('service-requests').on('child_added', async (snapshot) => {
  try {
    const request = snapshot.val();
    const requestId = snapshot.key;

    console.log('🔔 Yeni talep algılandı:', {
      id: requestId,
      salon: request.salon,
      timestamp: request.timestamp
    });

    // Zaten notification'ı send-notification endpoint'i gönderiyor
    // Burada ekstra bir şey yapmaya gerek yok

  } catch (error) {
    console.error('❌ Service request listener error:', error);
  }
});

// ==================== Error Handlers ====================

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint bulunamadı',
    path: req.path
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('❌ Global error:', err);
  res.status(500).json({
    success: false,
    error: 'Sunucu hatası',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// ==================== Server Start ====================

app.listen(PORT, '0.0.0.0', () => {
  console.log('');
  console.log('========================================');
  console.log('🚀 QuickServe Backend Server');
  console.log('========================================');
  console.log(`📡 Server: http://0.0.0.0:${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔥 Firebase Project: ${process.env.FIREBASE_PROJECT_ID || 'shuttle-call-835d9'}`);
  console.log('========================================');
  console.log('');
});

// Graceful Shutdown
process.on('SIGTERM', () => {
  console.log('⚠️ SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('⚠️ SIGINT received, shutting down gracefully...');
  process.exit(0);
});
