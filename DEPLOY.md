# QuickServe Deployment Guide

## 🚀 Deployment Adımları

### 1. Ön Gereksinimler

```bash
# Node.js kurulu olmalı (v18 veya üzeri)
node --version

# Firebase CLI kurulu değilse kur
npm install -g firebase-tools

# Firebase'e login ol
firebase login
```

### 2. Firebase Realtime Database Kurallarını Deploy Et

```bash
# Database kurallarını deploy et
firebase deploy --only database
```

Bu komut `database-rules.json` dosyasındaki kuralları Firebase'e yükleyecektir.

### 3. Firebase Cloud Functions Deploy Et

```bash
# Functions klasörüne git
cd functions

# Bağımlılıkları yükle
npm install

# Geri dön
cd ..

# Functions'ı deploy et
firebase deploy --only functions
```

**Önemli**: Functions deploy edilene kadar bildirimler sadece LocalStorage üzerinden (aynı tarayıcıda) çalışacaktır!

### 4. Firebase Hosting (Opsiyonel)

Eğer uygulamayı Firebase Hosting üzerinde yayınlamak isterseniz:

```bash
firebase deploy --only hosting
```

### 5. Tüm Servisleri Birlikte Deploy Et

```bash
# Tümünü bir seferde deploy et
firebase deploy
```

## 🔧 Yapılandırma Kontrolleri

### Firebase Project ID Doğrulama

`.firebaserc` dosyasında doğru project ID'nin olduğundan emin olun:

```json
{
  "projects": {
    "default": "shuttle-call-835d9"
  }
}
```

### Environment Variables

`.env` dosyası zaten yapılandırılmış durumda. Kontrol edin:

- ✅ FIREBASE_SERVICE_ACCOUNT_BASE64
- ✅ FIREBASE_PROJECT_ID
- ✅ FIREBASE_VAPID_KEY

## 🧪 Test Etme

### 1. Database Kurallarını Test Et

Firebase Console'dan:
1. `https://console.firebase.google.com/project/shuttle-call-835d9/database`
2. Rules sekmesine git
3. Kuralların yüklendiğini doğrula

### 2. Functions'ı Test Et

```bash
# Functions loglarını izle
firebase functions:log

# Veya real-time izleme
firebase functions:log --follow
```

### 3. Bildirim Sistemini Test Et

1. **Staff PWA'yı aç**: `http://localhost:5500/staff/index.html`
2. Bildirim iznini ver
3. **Tablet'i aç**: `http://localhost:5500/tablet/index.html`
4. Bir salon seç ve "Servis Talep Et" butonuna bas
5. Staff PWA'da bildirim gelmesini bekle

## 📊 Monitoring

### Firebase Console'da İzleme

1. **Realtime Database**: https://console.firebase.google.com/project/shuttle-call-835d9/database
   - `/service-requests`: Gelen talepler
   - `/subscriptions`: FCM subscriptions
   - `/notifications`: Gönderilen bildirimler
   - `/statistics`: Günlük istatistikler

2. **Cloud Functions**: https://console.firebase.google.com/project/shuttle-call-835d9/functions
   - Çalışan functions
   - Error rate
   - Execution times

3. **Cloud Messaging**: https://console.firebase.google.com/project/shuttle-call-835d9/messaging
   - Gönderilen mesajlar
   - Delivery rate

## ⚠️ Önemli Notlar

1. **VAPID Key**: Web push için gerekli, `.env` dosyasında tanımlı
2. **Service Account**: Functions için gerekli, base64 encoded olarak `.env`'de
3. **Database Rules**: Production'da mutlaka deploy edilmeli
4. **HTTPS Gereksinimi**: PWA ve FCM sadece HTTPS üzerinde çalışır (localhost hariç)

## 🐛 Sorun Giderme

### Bildirimler Gelmiyor

1. **Functions deploy edildi mi?**
   ```bash
   firebase functions:list
   ```

2. **Database rules doğru mu?**
   - Firebase Console > Database > Rules

3. **Token subscribe oldu mu?**
   - Database'de `/subscriptions` kontrol et

4. **Browser console'da hata var mı?**
   - F12 > Console
   - Service Worker > Application > Service Workers

### 404 Hatası

- Database rules deploy edilmemiş olabilir
- `firebase deploy --only database` çalıştırın

### Subscription Hatası

- Functions deploy edilmemiş olabilir
- `cd functions && npm install && cd .. && firebase deploy --only functions`

## 🔄 Güncelleme

Kod değişikliklerinden sonra:

```bash
# Sadece değişen kısmı deploy et
firebase deploy --only functions  # Functions değiştiyse
firebase deploy --only database   # Rules değiştiyse
firebase deploy --only hosting    # Frontend değiştiyse

# Veya hepsini
firebase deploy
```

## 📝 Loglar

```bash
# Functions logları
firebase functions:log

# Belirli bir function'ın logları
firebase functions:log --only sendServiceRequest

# Real-time log izleme
firebase functions:log --follow
```

## ✅ Deployment Checklist

- [ ] Firebase CLI kuruldu
- [ ] `firebase login` yapıldı
- [ ] `.firebaserc` doğru project ID'ye sahip
- [ ] `database-rules.json` deploy edildi
- [ ] `functions/` klasöründe `npm install` yapıldı
- [ ] Functions deploy edildi
- [ ] Staff PWA'da bildirim izni verildi
- [ ] Tablet'ten test talebi gönderildi
- [ ] Staff'ta bildirim alındı
- [ ] Firebase Console'dan loglar kontrol edildi
