# QuickServe - Coolify Deployment Guide

## 🚀 Coolify'a Deploy

### 1. Coolify'da Yeni Proje Oluştur

1. Coolify dashboard'unuza giriş yapın
2. **New Resource** > **Application** seçin
3. Git repository'nizi bağlayın veya manuel upload yapın

### 2. Backend (API) Deploy

#### Application Settings:

- **Name**: `quickserve-backend`
- **Build Pack**: `nixpacks` veya `dockerfile`
- **Port**: `3000`
- **Health Check Path**: `/health`

#### Environment Variables:

Coolify'da şu environment variable'ları ekleyin:

```bash
NODE_ENV=production
PORT=3000

# Firebase Configuration
FIREBASE_SERVICE_ACCOUNT_BASE64=<.env dosyasındaki değer>
FIREBASE_PROJECT_ID=shuttle-call-835d9
FIREBASE_API_KEY=AIzaSyD5brCkHqSPVCtt0XJmUMqZizrjK_HX9dc
FIREBASE_AUTH_DOMAIN=shuttle-call-835d9.firebaseapp.com
FIREBASE_STORAGE_BUCKET=shuttle-call-835d9.firebasestorage.app
FIREBASE_MESSAGING_SENDER_ID=1044072191950
FIREBASE_APP_ID=1:1044072191950:web:dc780e1832d3a4ee5afd9f
FIREBASE_MEASUREMENT_ID=G-DCP7FTRM9Q
FIREBASE_VAPID_KEY=BBrNGl2-VPA-iuLasrj8jpS2Sj2FrYr-FQq57GET6ofRV4QOljRwyLg--HMI-bV7m-lmdBk5NJxSyy3nVpNLzA4

# CORS
ALLOWED_ORIGINS=https://quickserve.yourserver.com,http://localhost:5500
```

**ÖNEMLİ**: `.env` dosyasındaki `FIREBASE_SERVICE_ACCOUNT_BASE64` değerini kopyalayın!

#### Build Command (Nixpacks kullanıyorsanız):
```bash
npm install --production
```

#### Start Command:
```bash
npm start
```

### 3. Frontend (Staff + Tablet) Deploy

Frontend'i 2 şekilde deploy edebilirsiniz:

#### Opsiyon A: Coolify Static Site

1. Yeni bir **Static Site** resource oluşturun
2. `staff/` ve `tablet/` klasörlerini upload edin
3. Coolify otomatik olarak serve edecek

#### Opsiyon B: Firebase Hosting (Önerilen)

```bash
# Firebase CLI ile deploy
firebase deploy --only hosting
```

### 4. config.js Güncellemesi

Backend deploy edildikten sonra, Coolify'dan aldığınız URL'i `config.js`'e ekleyin:

```javascript
// config.js
window.QUICKSERVE_API_URL =
  window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000'
    : 'https://quickserve-backend.your-coolify-domain.com'; // Buraya backend URL'inizi yazın
```

### 5. Firebase Realtime Database Rules Deploy

Coolify'dan bağımsız, Firebase Console'dan:

```bash
firebase deploy --only database
```

Ya da Firebase Console > Database > Rules sekmesinden `database-rules.json` içeriğini manuel yapıştırın.

## 🔧 Coolify Dockerfile Deploy

Eğer Dockerfile ile deploy ediyorsanız:

1. Coolify'da **Build Pack**: `Dockerfile` seçin
2. **Dockerfile Location**: `./Dockerfile`
3. **Port**: `3000`

Coolify otomatik olarak `Dockerfile`'ı kullanacak.

## 📋 Deploy Checklist

- [ ] Backend Coolify'a deploy edildi
- [ ] Backend environment variables ayarlandı
- [ ] Backend health check çalışıyor (`/health`)
- [ ] Frontend (Staff + Tablet) deploy edildi
- [ ] `config.js` backend URL ile güncellendi
- [ ] Firebase Database rules deploy edildi
- [ ] CORS ayarları doğru (`ALLOWED_ORIGINS`)
- [ ] Test: Tablet'ten talep gönder
- [ ] Test: Staff'ta bildirim geldi mi

## 🧪 Test Etme

### 1. Backend Health Check

```bash
curl https://quickserve-backend.your-coolify-domain.com/health
```

Beklenen response:
```json
{
  "status": "healthy",
  "timestamp": 1234567890,
  "service": "QuickServe Backend",
  "version": "1.0.0",
  "firebase": "connected"
}
```

### 2. Notification Test

```bash
curl -X POST https://quickserve-backend.your-coolify-domain.com/api/send-notification \
  -H "Content-Type: application/json" \
  -d '{
    "salon": "Barnabas",
    "timestamp": 1234567890,
    "type": "service-request"
  }'
```

### 3. Browser Test

1. Staff PWA'yı aç
2. Bildirim iznini ver
3. Tablet'i aç
4. Bir salon seç ve "Servis Talep Et" butonuna bas
5. Staff'ta bildirim gelmeli

## 📊 Monitoring

### Coolify Logs

Coolify dashboard'dan:
- **Logs** sekmesinden real-time logları izleyin
- **Metrics** sekmesinden CPU/RAM kullanımını görün

### Firebase Console

- **Realtime Database**: https://console.firebase.google.com/project/shuttle-call-835d9/database
  - `/service-requests`: Gelen talepler
  - `/notifications`: Gönderilen bildirimler
  - `/statistics`: Günlük istatistikler

## ⚠️ Sorun Giderme

### Backend başlamıyor

1. Coolify logs'u kontrol edin
2. Environment variables doğru mu?
3. `FIREBASE_SERVICE_ACCOUNT_BASE64` eksiksiz mi?

```bash
# .env dosyasından kontrol:
echo $FIREBASE_SERVICE_ACCOUNT_BASE64 | wc -c
# 1000+ karakter olmalı
```

### CORS hatası

`ALLOWED_ORIGINS` environment variable'ına frontend URL'inizi ekleyin:

```bash
ALLOWED_ORIGINS=https://staff.yourdomain.com,https://tablet.yourdomain.com
```

### Bildirimler gelmiyor

1. Browser console'da hata var mı?
2. FCM token alındı mı?
3. Topic subscription başarılı mı?
4. Firebase Console > Cloud Messaging'de delivery rate kontrol et

## 🔄 Güncelleme

Kod değişiklikleri sonrası:

1. Git push yapın
2. Coolify otomatik redeploy yapacak (auto-deploy aktifse)
3. Ya da Coolify'dan manuel **Deploy** butonuna basın

## 📝 Notlar

- Backend 24/7 çalışmalı (Coolify auto-restart aktif olmalı)
- HTTPS zorunlu (FCM ve PWA için)
- Firebase Service Account kesinlikle güvenli tutulmalı
- Production'da `NODE_ENV=production` olmalı

## 🆘 Destek

Sorun yaşarsanız:

1. Coolify logs kontrol edin
2. Browser console kontrol edin
3. Firebase Console > Cloud Messaging kontrol edin
4. Backend `/health` endpoint'ini kontrol edin
