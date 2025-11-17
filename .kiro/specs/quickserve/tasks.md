# QuickServe - Implementasyon Görev Listesi

## Proje Yapısı ve Temel Kurulum

- [ ] 1. Proje dizin yapısını oluştur

  - `tablet/` ve `staff/` klasörlerini oluştur
  - Her iki klasörde `assets/` alt klasörlerini oluştur
  - Mevcut görselleri (`images/` klasöründen) uygun yerlere kopyala
  - _Gereksinim: 1.1, 5.1, 5.3_

- [ ] 2. Firebase yapılandırma dosyalarını oluştur
  - `.env` dosyasındaki Firebase config bilgilerini kullanarak `tablet/firebase-config.js` oluştur
  - Aynı config'i `staff/firebase-config.js` için de oluştur
  - FCM initialization kodunu ekle
  - _Gereksinim: 2.1, 2.2_

## Tablet Arayüzü - Temel Yapı

- [ ] 3. Tablet arayüzü HTML yapısını oluştur

  - [ ] 3.1 `tablet/index.html` dosyasını oluştur

    - Meta tags (viewport, PWA için)
    - Tailwind CSS CDN linkini ekle
    - Firebase SDK script'lerini ekle
    - Merit Royal Diamond logo'yu header'a ekle
    - _Gereksinim: 1.1, 5.1, 5.2_

  - [ ] 3.2 Salon seçim ekranı HTML yapısını ekle

    - 4 salon için kart container'ı (2x2 grid)
    - Her salon kartı: başlık, ikon placeholder, seçim border
    - "Servis Talep Et" butonu (başlangıçta disabled)
    - _Gereksinim: 1.1, 1.2, 5.3_

  - [ ] 3.3 Başarı/hata modal yapısını ekle
    - Başarı mesajı container'ı (gizli)
    - Hata mesajı container'ı (gizli)
    - Otomatik kapanma için timer placeholder
    - _Gereksinim: 1.4, 1.5_

- [ ] 4. Tablet arayüzü CSS stillerini oluştur

  - [ ] 4.1 `tablet/styles.css` dosyasını oluştur

    - CSS değişkenleri (renk paleti)
    - Tailwind custom class'ları
    - Salon kartı stilleri (normal, selected, hover YOK)
    - _Gereksinim: 5.2, 5.5_

  - [ ] 4.2 Buton stillerini ekle

    - Primary buton (Servis Talep Et)
    - Disabled buton durumu
    - Active state (scale-95)
    - _Gereksinim: 5.2_

  - [ ] 4.3 Modal ve bildirim stillerini ekle

    - Başarı modal (yeşil tema)
    - Hata modal (kırmızı tema)
    - Fade-in/fade-out animasyonları
    - _Gereksinim: 1.4, 1.5_

  - [ ] 4.4 Responsive tasarım ekle
    - Tablet portrait (768px-1024px) için 2x2 grid
    - Tablet landscape için optimize layout
    - Touch-friendly boyutlar (min 44px)
    - _Gereksinim: 5.5_

## Tablet Arayüzü - JavaScript Mantığı

- [ ] 5. Salon seçim mantığını implement et

  - [ ] 5.1 `tablet/app.js` dosyasını oluştur ve SalonSelector class'ını yaz

    - Salon listesi: ['Barnabas', 'Zefiros', 'Kourion', 'Karmi']
    - `selectSalon(salonName)` metodu: seçili salonu kaydet
    - UI güncelleme: seçili kartı vurgula, diğerlerini normal yap
    - "Servis Talep Et" butonunu aktif et
    - _Gereksinim: 1.1, 1.2_

  - [ ] 5.2 Salon kartlarına click event listener'ları ekle
    - Her karta tıklandığında `selectSalon()` çağır
    - Seçili kartın border'ını değiştir (border-primary)
    - Buton durumunu güncelle (disabled → enabled)
    - _Gereksinim: 1.2_

- [ ] 6. FCM bildirim gönderme mantığını implement et

  - [ ] 6.1 NotificationSender class'ını yaz

    - Firebase FCM initialize et
    - `sendRequest(salonName)` metodu oluştur
    - FCM topic'e mesaj gönder: topic = "service-requests"
    - Mesaj payload: `{ salon, timestamp, type: 'service-request' }`
    - _Gereksinim: 1.3, 2.1, 2.2_

  - [ ] 6.2 Hata yönetimi ve retry mekanizması ekle

    - Try-catch ile FCM hatalarını yakala
    - 3 deneme, 2 saniye aralık ile retry
    - Timeout: 5 saniye
    - _Gereksinim: 1.4, 7.4_

  - [ ] 6.3 "Servis Talep Et" butonuna click handler ekle
    - Butona tıklandığında `sendRequest()` çağır
    - Loading state göster (buton disabled, spinner)
    - Başarı durumunda başarı modalını göster
    - Hata durumunda hata modalını göster
    - _Gereksinim: 1.3, 1.4, 1.5_

- [ ] 7. Modal ve UI feedback sistemini implement et

  - [ ] 7.1 Başarı modalı gösterme fonksiyonu yaz

    - Modal'ı göster (fade-in)
    - "Talebiniz iletildi" mesajı
    - 2 saniye sonra otomatik kapat ve salon seçimini sıfırla
    - _Gereksinim: 1.5_

  - [ ] 7.2 Hata modalı gösterme fonksiyonu yaz

    - Modal'ı göster (fade-in)
    - Hata mesajı: "Bağlantı hatası, tekrar deneyin"
    - "Tekrar Dene" butonu ekle
    - 3 saniye sonra otomatik kapat
    - _Gereksinim: 1.4_

  - [ ] 7.3 Otomatik sıfırlama mekanizması ekle
    - Başarılı gönderimden sonra seçimi temizle
    - Butonları disabled yap
    - Kartların border'larını sıfırla
    - _Gereksinim: 3.4_

## Personel PWA - Temel Yapı

- [ ] 8. Personel PWA HTML yapısını oluştur

  - [ ] 8.1 `staff/index.html` dosyasını oluştur

    - Meta tags (viewport, PWA, theme-color)
    - Tailwind CSS CDN linkini ekle
    - Firebase SDK script'lerini ekle
    - Manifest.json linkini ekle
    - _Gereksinim: 6.1, 6.4_

  - [ ] 8.2 Hoş geldiniz ekranı HTML yapısını ekle

    - Merit Royal Diamond logo
    - "Bildirimlere İzin Ver" butonu
    - Açıklama metni
    - _Gereksinim: 2.3, 5.1_

  - [ ] 8.3 Ana ekran (dashboard) HTML yapısını ekle
    - Bağlantı durumu göstergesi (online/offline)
    - "Bildirimler Aktif" durumu
    - Son talep bilgisi placeholder (opsiyonel)
    - _Gereksinim: 2.5_

- [ ] 9. Personel PWA CSS stillerini oluştur

  - [ ] 9.1 `staff/styles.css` dosyasını oluştur

    - CSS değişkenleri (aynı renk paleti)
    - Mobile-first responsive tasarım
    - Single column layout
    - _Gereksinim: 5.2_

  - [ ] 9.2 Buton ve kart stillerini ekle

    - Full-width butonlar
    - Büyük touch target'lar (min 44px)
    - Durum göstergeleri (online/offline badge)
    - _Gereksinim: 5.2_

  - [ ] 9.3 Bildirim stillerini ekle
    - Bildirim kartı tasarımı
    - Salon adı ve zaman gösterimi
    - Okunabilir tipografi (büyük font)
    - _Gereksinim: 2.4, 5.4_

## Personel PWA - JavaScript Mantığı

- [ ] 10. Bildirim izni ve FCM token yönetimini implement et

  - [ ] 10.1 `staff/app.js` dosyasını oluştur ve NotificationManager class'ını yaz

    - `requestPermission()` metodu: Notification API izni iste
    - FCM token al ve localStorage'a kaydet
    - Token'ı "service-requests" topic'ine subscribe et
    - _Gereksinim: 2.1, 2.3, 4.2_

  - [ ] 10.2 "Bildirimlere İzin Ver" butonuna click handler ekle

    - Butona tıklandığında `requestPermission()` çağır
    - İzin verilirse ana ekrana geç
    - İzin reddedilirse hata mesajı göster
    - _Gereksinim: 2.3_

  - [ ] 10.3 Hata yönetimi ekle
    - İzin reddedildi durumu
    - FCM token alınamadı durumu
    - 3 deneme ile otomatik retry
    - _Gereksinim: 2.3_

- [ ] 11. Foreground bildirim dinleyicisini implement et

  - [ ] 11.1 FCM message listener'ı ekle

    - `onMessage()` ile foreground mesajları dinle
    - Mesaj payload'ını parse et (salon, timestamp)
    - Notification API ile bildirim göster
    - _Gereksinim: 2.3, 2.4_

  - [ ] 11.2 Bildirim gösterme fonksiyonu yaz

    - Başlık: "Servis Talebi"
    - İçerik: "{Salon} salonundan servis talebi"
    - İkon ve badge ekle
    - requireInteraction: true
    - _Gereksinim: 2.2, 2.4, 5.4_

  - [ ] 11.3 Bildirime tıklama handler'ı ekle
    - Tıklandığında uygulamayı aç
    - Talep detaylarını göster (salon, zaman)
    - _Gereksinim: 2.4_

## Personel PWA - Service Worker ve PWA Özellikleri

- [ ] 12. Service Worker'ı oluştur ve kaydet

  - [ ] 12.1 `staff/sw.js` dosyasını oluştur

    - Service Worker lifecycle event'lerini ekle (install, activate)
    - Static asset'leri cache'le (HTML, CSS, JS, görseller)
    - Offline fallback stratejisi
    - _Gereksinim: 6.2, 6.5_

  - [ ] 12.2 FCM background mesaj dinleyicisini ekle

    - `push` event listener'ı ekle
    - Push event'inden payload'ı çıkar
    - Notification göster (background'da)
    - _Gereksinim: 2.5_

  - [ ] 12.3 Notification click handler'ı ekle

    - `notificationclick` event listener'ı ekle
    - Uygulamayı aç veya focus et
    - Talep detaylarını göster
    - _Gereksinim: 2.4_

  - [ ] 12.4 Service Worker'ı `staff/app.js`'de kaydet
    - `navigator.serviceWorker.register()` çağır
    - Kayıt başarısız olursa fallback: foreground-only mod
    - Hata durumunda kullanıcıya bilgi ver
    - _Gereksinim: 6.2_

- [ ] 13. PWA manifest dosyasını oluştur

  - [ ] 13.1 `staff/manifest.json` dosyasını oluştur

    - App adı: "QuickServe - Personel"
    - Short name: "QuickServe"
    - İkonlar: 192x192, 512x512 (Merit Royal Diamond logo)
    - Start URL, display: standalone
    - Theme color, background color
    - _Gereksinim: 6.1, 6.4_

  - [ ] 13.2 PWA ikonlarını hazırla
    - 192x192 ikon oluştur (mevcut logo'dan)
    - 512x512 ikon oluştur
    - `staff/assets/` klasörüne kaydet
    - _Gereksinim: 6.4_

## Test ve Doğrulama

- [ ]\* 14. Temel fonksiyonellik testlerini yaz

  - [ ]\* 14.1 Tablet arayüzü için test senaryoları

    - Salon seçimi testi
    - Bildirim gönderme testi
    - Hata durumu testi
    - _Gereksinim: 1.1, 1.2, 1.3, 1.4_

  - [ ]\* 14.2 Personel PWA için test senaryoları

    - Bildirim izni testi
    - FCM token alma testi
    - Bildirim alma testi (foreground, background)
    - _Gereksinim: 2.1, 2.3, 2.5_

  - [ ]\* 14.3 Entegrasyon testi: Tablet → Personel akışı
    - Tablet'te salon seç ve talep gönder
    - Personel PWA'da bildirimin geldiğini doğrula
    - Bildirim içeriğini kontrol et
    - _Gereksinim: 1.3, 2.1, 2.2_

- [ ]\* 15. Performans ve güvenilirlik testleri

  - [ ]\* 15.1 Yükleme performansı testi

    - Tablet arayüzü yükleme süresi (< 1 saniye)
    - Personel PWA yükleme süresi
    - _Gereksinim: 7.2_

  - [ ]\* 15.2 Bildirim gecikme testi

    - Talep gönderme → bildirim alma süresi (< 3 saniye)
    - Retry mekanizması testi
    - _Gereksinim: 7.1, 7.5_

  - [ ]\* 15.3 Hata durumu testleri
    - Network offline durumu
    - FCM servisi erişilemez durumu
    - Bildirim izni yok durumu
    - _Gereksinim: 1.4, 7.4_

## Deployment Hazırlığı

- [ ] 16. Production build hazırlığı

  - [ ] 16.1 HTML dosyalarını optimize et

    - Gereksiz yorumları temizle
    - Meta tag'leri kontrol et
    - _Gereksinim: 7.2_

  - [ ] 16.2 CSS ve JS dosyalarını minify et

    - Tailwind CSS'i production build'e hazırla
    - JavaScript dosyalarını minify et
    - _Gereksinim: 7.2_

  - [ ] 16.3 Görselleri optimize et
    - Logo ve ikonları optimize et (WebP, PNG)
    - Dosya boyutlarını küçült
    - _Gereksinim: 7.2_

- [ ]\* 17. Deployment dokümantasyonu oluştur

  - [ ]\* 17.1 README.md dosyası oluştur

    - Proje açıklaması
    - Kurulum adımları
    - Firebase config ayarları
    - Deployment adımları
    - _Gereksinim: Tüm gereksinimler_

  - [ ]\* 17.2 Kullanım kılavuzu oluştur
    - Tablet arayüzü kullanımı
    - Personel PWA kurulumu
    - Sorun giderme
    - _Gereksinim: Tüm gereksinimler_

## Notlar

- Her görev tamamlandığında, ilgili gereksinimlerin karşılandığını doğrula
- Hata yönetimi her adımda try-catch ile implement edilmeli
- Tüm kullanıcı etkileşimleri için feedback (loading, success, error) sağlanmalı
- Kod içi yorumlar Türkçe olmalı
- Console.log ile debug mesajları eklenebilir (production'da kaldırılacak)
