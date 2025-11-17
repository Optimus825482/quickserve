# QuickServe - Hızlı Başlangıç Kılavuzu

## 🚀 5 Dakikada Başlayın!

### Adım 1: Yerel Test Sunucusu Başlatın

Proje klasöründe bir HTTP sunucusu başlatın:

**Python 3 ile:**

```bash
python -m http.server 8000
```

**Node.js ile:**

```bash
npx http-server -p 8000
```

**PHP ile:**

```bash
php -S localhost:8000
```

### Adım 2: Tarayıcıda Açın

Ana sayfa:

```
http://localhost:8000
```

Tablet arayüzü:

```
http://localhost:8000/tablet/
```

Personel PWA:

```
http://localhost:8000/staff/
```

### Adım 3: Firebase Cloud Functions Deploy Edin

**Önemli**: Bildirimlerin çalışması için Cloud Functions gereklidir!

```bash
# Firebase CLI yükleyin
npm install -g firebase-tools

# Login olun
firebase login

# Functions klasörü oluşturun
mkdir functions
cd functions
npm init -y
npm install firebase-functions firebase-admin

# functions-example.js dosyasını kopyalayın
copy ..\functions-example.js index.js

# Deploy edin
cd ..
firebase deploy --only functions
```

### Adım 4: Realtime Database Kurallarını Ayarlayın

1. Firebase Console'a gidin: https://console.firebase.google.com
2. Projenizi seçin: `shuttle-call-835d9`
3. Realtime Database → Rules
4. `database-rules.json` içeriğini kopyalayın
5. "Publish" butonuna basın

### Adım 5: Test Edin!

#### Tablet Testi

1. `http://localhost:8000/tablet/` adresini açın
2. Bir salon seçin (örn: Barnabas)
3. "Servis Talep Et" butonuna basın
4. Başarı mesajını görün ✅

#### Personel PWA Testi

1. Mobil cihazınızda `http://[your-ip]:8000/staff/` adresini açın
   - IP adresinizi öğrenmek için: `ipconfig` (Windows) veya `ifconfig` (Mac/Linux)
2. "Bildirimlere İzin Ver" butonuna basın
3. İzin verin
4. Tablet'ten talep gönderin
5. Bildirim geldiğini görün 🔔

## 🎯 Hızlı Sorun Giderme

### Bildirimler Gelmiyor?

1. **Cloud Functions deploy edildi mi?**

   ```bash
   firebase functions:log
   ```

2. **Realtime Database kuralları doğru mu?**

   - Firebase Console → Database → Rules

3. **Console'da hata var mı?**
   - F12 → Console

### PWA Yüklenmiyor?

1. **HTTPS gerekli!** (Production için)

   - Localhost'ta çalışır
   - Production'da Firebase Hosting kullanın

2. **Service Worker kaydı başarılı mı?**
   - F12 → Application → Service Workers

### Tablet Talep Gönderemiyor?

1. **Network bağlantısı var mı?**

   - F12 → Network

2. **Firebase config doğru mu?**
   - `tablet/firebase-config.js` kontrol edin

## 📱 Production'a Geçiş

### Firebase Hosting ile Deploy

```bash
# Hosting'i initialize edin
firebase init hosting

# Deploy edin
firebase deploy --only hosting

# URL'nizi alın
# https://shuttle-call-835d9.web.app
```

### Custom Domain Ekleyin

1. Firebase Console → Hosting → "Add custom domain"
2. Domain'inizi girin: `quickserve.meritroyal.com`
3. DNS kayıtlarını ekleyin
4. SSL otomatik oluşturulur ✅

## 🎉 Tamamlandı!

Artık QuickServe sisteminiz hazır!

- **Tablet**: Toplantı salonlarında kullanıma hazır
- **Personel PWA**: Mobil cihazlara yüklenebilir
- **Bildirimler**: Anlık ve güvenilir

## 📚 Daha Fazla Bilgi

- Detaylı kurulum: `README.md`
- Deployment kılavuzu: `DEPLOYMENT.md`
- Firebase Functions: `functions-example.js`

## 💡 İpuçları

1. **Tablet'leri bookmark'layın**: Kolay erişim için
2. **Personel PWA'yı ana ekrana ekleyin**: App-like deneyim
3. **Offline test edin**: PWA offline çalışır
4. **Monitoring kurun**: Firebase Console → Functions → Logs

## 🆘 Yardım

Sorun mu yaşıyorsunuz?

1. Console loglarını kontrol edin (F12)
2. Firebase Functions loglarını kontrol edin
3. `DEPLOYMENT.md` dosyasına bakın
4. IT departmanı ile iletişime geçin

---

**QuickServe** - Hızlı ve Kolay! 🚀
