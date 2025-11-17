# QuickServe - Deployment Kılavuzu

## 🚀 Deployment Adımları

### 1. Firebase Projesi Hazırlığı

#### Firebase Console'da Yapılacaklar

1. **Firebase Console'a giriş yapın**: https://console.firebase.google.com
2. Projenizi seçin: `shuttle-call-835d9`

#### Realtime Database Kurallarını Ayarlayın

1. Firebase Console → Realtime Database → Rules
2. `database-rules.json` dosyasındaki kuralları kopyalayın
3. "Publish" butonuna basın

```json
{
  "rules": {
    "service-requests": {
      ".read": false,
      ".write": true
    },
    "subscriptions": {
      ".read": false,
      ".write": true
    }
  }
}
```

#### Cloud Functions Deploy Edin

1. Firebase CLI'yi yükleyin (eğer yoksa):

```bash
npm install -g firebase-tools
```

2. Firebase'e login olun:

```bash
firebase login
```

3. Proje dizininde Firebase'i initialize edin:

```bash
firebase init
```

- Functions seçin
- Mevcut projeyi seçin: `shuttle-call-835d9`
- JavaScript seçin
- ESLint: Hayır (opsiyonel)
- Dependencies yükleyin: Evet

4. `functions-example.js` dosyasını `functions/index.js` olarak kopyalayın:

```bash
copy functions-example.js functions\index.js
```

5. Functions'ı deploy edin:

```bash
firebase deploy --only functions
```

### 2. Web Hosting

#### Seçenek A: Firebase Hosting (Önerilen)

1. Firebase Hosting'i initialize edin:

```bash
firebase init hosting
```

- Public directory: `.` (root)
- Single-page app: Hayır
- GitHub deployment: Hayır (opsiyonel)

2. `firebase.json` dosyasını düzenleyin:

```json
{
  "hosting": {
    "public": ".",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**",
      "functions/**",
      ".env"
    ],
    "rewrites": [
      {
        "source": "/tablet",
        "destination": "/tablet/index.html"
      },
      {
        "source": "/staff",
        "destination": "/staff/index.html"
      }
    ]
  }
}
```

3. Deploy edin:

```bash
firebase deploy --only hosting
```

4. URL'nizi alın:

```
Hosting URL: https://shuttle-call-835d9.web.app
```

#### Seçenek B: Netlify

1. Netlify'a giriş yapın: https://app.netlify.com
2. "Add new site" → "Deploy manually"
3. Proje klasörünü sürükle-bırak
4. Deploy tamamlandığında URL'yi alın

#### Seçenek C: Vercel

1. Vercel'e giriş yapın: https://vercel.com
2. "New Project" → "Import Git Repository" veya "Deploy"
3. Proje klasörünü seçin
4. Deploy edin

### 3. HTTPS Sertifikası

**Önemli**: PWA ve FCM için HTTPS zorunludur!

- Firebase Hosting: Otomatik SSL sağlar ✅
- Netlify: Otomatik SSL sağlar ✅
- Vercel: Otomatik SSL sağlar ✅
- Custom domain: Let's Encrypt kullanın

### 4. Domain Ayarları (Opsiyonel)

Kendi domain'inizi kullanmak için:

#### Firebase Hosting

1. Firebase Console → Hosting → "Add custom domain"
2. Domain'inizi girin: `quickserve.meritroyal.com`
3. DNS kayıtlarını ekleyin (A veya CNAME)
4. SSL sertifikası otomatik oluşturulur

#### DNS Kayıtları Örneği

```
Type: A
Name: quickserve
Value: [Firebase IP]

Type: CNAME
Name: www
Value: shuttle-call-835d9.web.app
```

### 5. Firebase Security Rules

#### API Key Restriction

1. Google Cloud Console'a gidin
2. APIs & Services → Credentials
3. API Key'i seçin
4. "Application restrictions" → "HTTP referrers"
5. Domain'lerinizi ekleyin:

```
https://shuttle-call-835d9.web.app/*
https://quickserve.meritroyal.com/*
```

### 6. Test

#### Tablet Arayüzü Testi

1. Tablet'te tarayıcıyı açın
2. URL'yi girin: `https://[your-domain]/tablet/`
3. Salon seçin ve talep gönderin
4. Console'da hata olup olmadığını kontrol edin

#### Personel PWA Testi

1. Mobil cihazda tarayıcıyı açın
2. URL'yi girin: `https://[your-domain]/staff/`
3. "Bildirimlere İzin Ver" butonuna basın
4. İzin verin
5. Tablet'ten talep gönderin
6. Bildirimin geldiğini kontrol edin

#### PWA Kurulum Testi

1. Chrome (Android) veya Safari (iOS) ile açın
2. "Ana Ekrana Ekle" seçeneğini görün
3. Ekleyin ve uygulamayı açın
4. App-like deneyimi test edin

### 7. Monitoring ve Logging

#### Firebase Console

1. **Functions Logs**: Functions → Logs
2. **Realtime Database**: Database → Data
3. **Analytics**: Analytics → Dashboard (opsiyonel)

#### Chrome DevTools

1. F12 ile DevTools'u açın
2. Console: Hata mesajları
3. Network: API istekleri
4. Application: Service Worker, Cache, Storage

### 8. Güncelleme ve Bakım

#### Kod Güncellemesi

1. Değişiklikleri yapın
2. Test edin (localhost)
3. Deploy edin:

```bash
firebase deploy
```

#### Service Worker Güncellemesi

Service Worker güncellendiğinde:

1. Kullanıcılar sayfayı yenilediğinde otomatik güncellenir
2. Veya `sw.js` içinde `skipWaiting()` kullanın

#### Cache Temizleme

Eğer kullanıcılar eski versiyonu görüyorsa:

1. `CACHE_NAME` değişkenini değiştirin (örn: `quickserve-v2`)
2. Service Worker otomatik eski cache'i temizler

### 9. Sorun Giderme

#### Bildirimler Çalışmıyor

1. HTTPS kontrolü yapın
2. Firebase Cloud Functions deploy edilmiş mi kontrol edin
3. Console'da hata mesajlarını kontrol edin
4. FCM token alınıyor mu kontrol edin

#### PWA Yüklenmiyor

1. HTTPS kontrolü yapın
2. `manifest.json` erişilebilir mi kontrol edin
3. Service Worker kaydı başarılı mı kontrol edin
4. Chrome DevTools → Application → Manifest

#### Tablet Talep Gönderemiyor

1. Network bağlantısını kontrol edin
2. Firebase Realtime Database kurallarını kontrol edin
3. Console'da hata mesajlarını kontrol edin
4. CORS hatası varsa Firebase Hosting kullanın

### 10. Production Checklist

- [ ] Firebase Cloud Functions deploy edildi
- [ ] Realtime Database kuralları ayarlandı
- [ ] Web hosting deploy edildi
- [ ] HTTPS sertifikası aktif
- [ ] API Key restriction ayarlandı
- [ ] Tablet arayüzü test edildi
- [ ] Personel PWA test edildi
- [ ] Push bildirimleri test edildi
- [ ] PWA kurulum test edildi
- [ ] Offline çalışma test edildi
- [ ] Tüm salonlar test edildi
- [ ] Hata senaryoları test edildi
- [ ] Performans test edildi (< 3 saniye)
- [ ] Monitoring kuruldu
- [ ] Dokümantasyon hazırlandı

### 11. Kullanıcı Eğitimi

#### Tablet Kullanıcıları İçin

1. Tarayıcıyı açın
2. Bookmark'a ekleyin (kolay erişim için)
3. Salon seçin
4. "Servis Talep Et" butonuna basın
5. Başarı mesajını bekleyin

#### Personel İçin

1. Mobil cihazda URL'yi açın
2. "Bildirimlere İzin Ver" butonuna basın
3. İzin verin
4. "Ana Ekrana Ekle" ile uygulamayı yükleyin
5. Uygulamayı arka planda çalışır durumda tutun
6. Bildirim geldiğinde yanıt verin

### 12. Destek ve İletişim

Sorun yaşarsanız:

1. Console loglarını kontrol edin
2. Firebase Console → Functions → Logs
3. Chrome DevTools → Console
4. IT departmanı ile iletişime geçin

---

**QuickServe** - Başarılı Deployment! 🎉
