# QuickServe - Tasarım Dokümanı

## Genel Bakış

QuickServe, iki ana bileşenden oluşan bir PWA sistemidir:

1. **Tablet Arayüzü**: Toplantı salonlarındaki tabletlerde çalışan talep oluşturma arayüzü
2. **Personel PWA**: Servis personelinin mobil cihazlarında çalışan bildirim alma uygulaması

Sistem, Firebase Cloud Messaging (FCM) üzerinden anlık bildirim gönderir ve herhangi bir backend sunucuya ihtiyaç duymaz. Tüm iletişim client-to-client FCM topic subscription modeli ile gerçekleşir.

## Mimari

### Sistem Mimarisi

```
┌─────────────────┐
│  Tablet Arayüzü │
│   (4 Salon)     │
└────────┬────────┘
         │
         │ FCM Topic Publish
         │
         ▼
┌─────────────────────┐
│   Firebase Cloud    │
│    Messaging (FCM)  │
└────────┬────────────┘
         │
         │ Push Notification
         │
         ▼
┌─────────────────────┐
│   Personel PWA      │
│  (Topic Subscribe)  │
└─────────────────────┘
```

### Teknoloji Stack

**Frontend (Her İki Uygulama)**

- HTML5, CSS3, JavaScript (Vanilla JS)
- Tailwind CSS (Styling)
- Firebase SDK v10+ (FCM)
- Service Worker API (PWA)

**Bildirim Altyapısı**

- Firebase Cloud Messaging (FCM)
- Firebase Admin SDK (Server-side token yönetimi için opsiyonel)

**Deployment**

- Static hosting (Firebase Hosting, Netlify, Vercel vb.)
- HTTPS zorunlu (PWA ve FCM için)

## Bileşenler ve Arayüzler

### 1. Tablet Arayüzü (`/tablet`)

#### Sayfa Yapısı

```
tablet/
├── index.html          # Ana sayfa
├── styles.css          # Tailwind + Custom CSS
├── app.js              # Ana uygulama mantığı
├── firebase-config.js  # Firebase yapılandırması
└── assets/
    ├── logo.png        # Merit Royal Diamond Logo
    └── icons/          # Salon ikonları
```

#### Ekran Akışı

1. **Salon Seçim Ekranı**

   - 4 salon kartı (2x2 grid)
   - Her kart: Salon adı + ikon + hover efekti YOK
   - Seçim: Kart border rengi değişir

2. **Talep Onay Ekranı**

   - Seçilen salon bilgisi
   - "Servis Talep Et" butonu (büyük, belirgin)
   - "İptal" butonu

3. **Başarı/Hata Ekranı**
   - Başarı: Yeşil checkmark + "Talebiniz iletildi"
   - Hata: Kırmızı X + "Bağlantı hatası, tekrar deneyin"
   - 2-3 saniye sonra otomatik dönüş

#### Bileşen Detayları

**SalonSelector Component**

```javascript
class SalonSelector {
  constructor() {
    this.salons = ["Barnabas", "Zefiros", "Kourion", "Karmi"];
    this.selectedSalon = null;
  }

  render() {
    // 2x2 grid layout
    // Her salon için kart oluştur
  }

  selectSalon(salonName) {
    // Salon seçimi
    // UI güncelleme
  }
}
```

**NotificationSender Component**

```javascript
class NotificationSender {
  async sendRequest(salonName) {
    // FCM topic'e mesaj gönder
    // Topic: "service-requests"
    // Payload: { salon: salonName, timestamp: Date.now() }
  }
}
```

### 2. Personel PWA (`/staff`)

#### Sayfa Yapısı

```
staff/
├── index.html              # Ana sayfa
├── styles.css              # Tailwind + Custom CSS
├── app.js                  # Ana uygulama mantığı
├── firebase-config.js      # Firebase yapılandırması
├── sw.js                   # Service Worker
├── manifest.json           # PWA Manifest
└── assets/
    ├── icon-192.png        # PWA ikonu
    ├── icon-512.png        # PWA ikonu
    └── logo.png            # Merit Royal Diamond Logo
```

#### Ekran Akışı

1. **Hoş Geldiniz Ekranı**

   - Logo
   - "Bildirimlere İzin Ver" butonu
   - Bildirim izni isteme

2. **Ana Ekran (Dashboard)**

   - Bağlantı durumu göstergesi
   - Son alınan talep bilgisi (opsiyonel, memory'de)
   - "Bildirimler Aktif" durumu

3. **Bildirim Ekranı**
   - Push notification geldiğinde
   - Salon adı + zaman
   - Büyük, okunabilir font

#### Bileşen Detayları

**NotificationManager Component**

```javascript
class NotificationManager {
  async requestPermission() {
    // Notification API izni
    // FCM token al
    // Topic'e subscribe: "service-requests"
  }

  setupMessageListener() {
    // FCM foreground mesaj dinleyici
    // Background mesaj service worker'da
  }

  showNotification(payload) {
    // Notification API ile bildirim göster
  }
}
```

**ServiceWorker (`sw.js`)**

```javascript
// FCM background mesaj dinleyici
self.addEventListener("push", (event) => {
  // Push event'i yakala
  // Notification göster
});

// Notification tıklama
self.addEventListener("notificationclick", (event) => {
  // Uygulamayı aç
  // Talep detaylarını göster
});
```

### 3. Firebase Yapılandırması

#### FCM Topic Modeli

- **Topic Adı**: `service-requests`
- **Subscriber**: Tüm personel PWA cihazları
- **Publisher**: Tablet arayüzleri

#### Mesaj Formatı

```json
{
  "notification": {
    "title": "Servis Talebi",
    "body": "Barnabas salonundan servis talebi",
    "icon": "/assets/icon-192.png",
    "badge": "/assets/badge.png",
    "tag": "service-request",
    "requireInteraction": true
  },
  "data": {
    "salon": "Barnabas",
    "timestamp": "1700000000000",
    "type": "service-request"
  }
}
```

## Veri Modelleri

### Bildirim Payload

```typescript
interface ServiceRequest {
  salon: "Barnabas" | "Zefiros" | "Kourion" | "Karmi";
  timestamp: number;
  type: "service-request";
}
```

### FCM Token (Sadece cihazda)

```typescript
interface FCMToken {
  token: string;
  subscribedTopics: string[];
  lastUpdated: number;
}
```

**Depolama**: `localStorage` (sadece personel PWA'da)

## Hata Yönetimi

### Tablet Arayüzü Hataları

1. **FCM Bağlantı Hatası**

   - Kullanıcıya: "Bağlantı hatası, lütfen tekrar deneyin"
   - Retry mekanizması: 3 deneme, 2 saniye aralık
   - Log: Console'a hata detayı

2. **Tarayıcı Uyumsuzluğu**

   - FCM desteklenmiyorsa: "Bu cihaz desteklenmiyor"
   - Fallback: QR kod ile personel çağırma (opsiyonel)

3. **Network Timeout**
   - 5 saniye timeout
   - Kullanıcıya: "İstek zaman aşımına uğradı"

### Personel PWA Hataları

1. **Bildirim İzni Reddedildi**

   - Kullanıcıya: "Bildirimler için izin gerekli"
   - Yeniden izin isteme butonu

2. **FCM Token Alınamadı**

   - Kullanıcıya: "Bağlantı kurulamadı, sayfayı yenileyin"
   - Otomatik retry: 3 deneme

3. **Service Worker Kayıt Hatası**
   - Fallback: Foreground-only mod
   - Kullanıcıya: "Arka plan bildirimleri devre dışı"

### Hata Loglama

```javascript
class ErrorLogger {
  static log(error, context) {
    console.error(`[${context}]`, error);
    // Opsiyonel: Firebase Analytics'e gönder
  }
}
```

## Test Stratejisi

### 1. Birim Testleri (Opsiyonel)

- `SalonSelector` seçim mantığı
- `NotificationSender` mesaj formatı
- `NotificationManager` token yönetimi

**Framework**: Jest veya Vitest

### 2. Entegrasyon Testleri

**Senaryo 1: Tablet → Personel Akışı**

1. Tablet'te salon seç
2. Talep gönder
3. Personel PWA'da bildirim geldiğini doğrula

**Senaryo 2: Hata Durumları**

1. Network offline
2. FCM servisi erişilemez
3. Bildirim izni yok

**Senaryo 3: PWA Özellikleri**

1. Offline çalışma
2. Ana ekrana ekleme
3. Background bildirimler

### 3. Manuel Testler

- **Cihaz Testleri**: iPad, Android tablet, iPhone, Android phone
- **Tarayıcı Testleri**: Chrome, Safari, Firefox, Edge
- **Network Testleri**: WiFi, 4G, 3G, offline
- **Performans Testleri**: Bildirim gecikme süresi

### 4. Kullanıcı Kabul Testleri (UAT)

- Gerçek otel personeli ile test
- Gerçek toplantı senaryosu simülasyonu
- Feedback toplama

## Güvenlik

### 1. FCM Güvenliği

- **VAPID Key**: Public key client-side, private key server-side
- **API Key**: Sadece FCM için kısıtlı (Firebase Console'dan)
- **Domain Restriction**: Sadece otel domain'inden erişim

### 2. HTTPS Zorunluluğu

- PWA ve FCM için HTTPS gerekli
- Let's Encrypt ile ücretsiz SSL

### 3. Veri Gizliliği

- Hiçbir kişisel veri toplanmaz
- FCM token sadece cihazda saklanır
- Analytics opsiyonel (kapalı olabilir)

## Performans Optimizasyonu

### 1. Yükleme Performansı

- **Lazy Loading**: Görseller için
- **Code Splitting**: Tablet ve Personel ayrı bundle
- **Minification**: CSS ve JS

### 2. Runtime Performansı

- **Debouncing**: Buton tıklamaları için
- **Caching**: Service Worker ile static asset'ler
- **Optimistic UI**: Bildirim gönderimi sırasında

### 3. Bildirim Performansı

- **Topic Subscription**: Broadcast yerine
- **Payload Boyutu**: Maksimum 4KB
- **Priority**: High priority mesajlar

## Deployment Planı

### 1. Geliştirme Ortamı

- Local development: `localhost:3000`
- Firebase Emulator Suite (opsiyonel)

### 2. Test Ortamı

- Firebase Hosting preview channel
- Test FCM project

### 3. Prodüksiyon Ortamı

- Firebase Hosting veya custom domain
- Prodüksiyon FCM project
- SSL sertifikası

### Deployment Adımları

1. Build: `npm run build`
2. Test: Otomatik testler
3. Deploy: `firebase deploy` veya CI/CD
4. Smoke Test: Temel akışları kontrol

## Tasarım Sistemi

### Renk Paleti

```css
:root {
  --primary: #1e40af; /* Mavi - Ana butonlar */
  --secondary: #7c3aed; /* Mor - Vurgular */
  --success: #10b981; /* Yeşil - Başarı */
  --error: #ef4444; /* Kırmızı - Hata */
  --warning: #f59e0b; /* Turuncu - Uyarı */
  --background: #f9fafb; /* Açık gri - Arka plan */
  --surface: #ffffff; /* Beyaz - Kartlar */
  --text-primary: #111827; /* Koyu gri - Ana metin */
  --text-secondary: #6b7280; /* Orta gri - İkincil metin */
}
```

### Tipografi

- **Font Family**: Inter, system-ui, sans-serif
- **Başlıklar**:
  - H1: 2.5rem (40px), font-bold
  - H2: 2rem (32px), font-semibold
  - H3: 1.5rem (24px), font-semibold
- **Body**: 1rem (16px), font-normal
- **Butonlar**: 1.125rem (18px), font-medium

### Spacing

- Tailwind default spacing scale
- Container: max-w-7xl, mx-auto, px-4

### Bileşen Stilleri

**Salon Kartı**

```css
.salon-card {
  @apply bg-white rounded-xl shadow-lg p-8 cursor-pointer transition-all;
  @apply border-4 border-transparent;
}

.salon-card.selected {
  @apply border-primary shadow-xl scale-105;
}
```

**Butonlar**

```css
.btn-primary {
  @apply bg-primary text-white px-8 py-4 rounded-lg;
  @apply font-medium text-lg shadow-md;
  @apply transition-all duration-200;
}

.btn-primary:active {
  @apply scale-95;
}
```

## Responsive Tasarım

### Breakpoints

- **Tablet (Tablet Arayüzü)**: 768px - 1024px (optimize edilmiş)
- **Mobile (Personel PWA)**: 320px - 768px (optimize edilmiş)
- **Desktop**: 1024px+ (desteklenir ama optimize değil)

### Layout

**Tablet Arayüzü**

- Portrait: 2x2 grid (salon kartları)
- Landscape: 4x1 grid veya 2x2

**Personel PWA**

- Single column layout
- Full-width butonlar
- Büyük touch target'lar (min 44px)

## Erişilebilirlik

- **ARIA Labels**: Tüm interaktif elementler
- **Keyboard Navigation**: Tab order
- **Color Contrast**: WCAG AA standardı
- **Focus Indicators**: Görünür focus ring'ler
- **Screen Reader**: Anlamlı mesajlar

## Tarayıcı Desteği

- **Chrome**: 90+ ✅
- **Safari**: 14+ ✅
- **Firefox**: 88+ ✅
- **Edge**: 90+ ✅
- **Opera**: 76+ ✅

**Not**: Service Worker ve FCM desteği gerekli

## Gelecek Geliştirmeler (Out of Scope)

1. Talep geçmişi (opsiyonel analytics)
2. Personel yanıt sistemi ("Yoldayım" butonu)
3. Çoklu dil desteği
4. Admin paneli (salon ekleme/çıkarma)
5. Talep kategorileri (İkram, Teknik destek, vb.)
