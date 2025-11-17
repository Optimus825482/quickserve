# ğŸ¨ QuickServe - Merit Royal Diamond Otel

Otel misafirlerinin salonlardan servis talep edebilmesi için geliştirilmiş modern PWA çözümü.

## âš¡ Flask Backend ile Hızlı Deploy

**3 Adımda Coolify'a Deploy!**

### 1ï¸âƒ£ Git'e Push

```bash
git init
git add .
git commit -m "QuickServe Flask backend"
git remote add origin https://github.com/USERNAME/quickserve.git
git push -u origin main
```

### 2ï¸âƒ£ Coolify'da Deploy

- **New Resource** â†’ **Application**
- **Build Pack**: Dockerfile (otomatik)
- **Port**: 3000
- **Health Check**: `/health`

### 3ï¸âƒ£ Environment Variables Ekle

Coolify'da **Environment** sekmesine `.env` dosyasındaki değerleri kopyala:

```bash
FLASK_ENV=production
PORT=3000
FIREBASE_SERVICE_ACCOUNT_BASE64=<.env'deki tam değer>
FIREBASE_PROJECT_ID=shuttle-call-835d9
ALLOWED_ORIGINS=https://yourdomain.com
```

**âœ… Deploy!** Otomatik build başlayacak!

---

## ğŸ“± Özellikler

- **Tablet PWA**: Salonlardan kolay servis talebi
- **Personel PWA**: Anlık push bildirimleri
- **Flask Backend**: Python/Flask + Firebase FCM
- **Offline**: PWA ile internet olmadan çalışır
- **Gerçek Zamanlı**: Firebase Cloud Messaging
- **Coolify Deploy**: Git push ile otomatik deploy

## ğŸ—ï¸ Teknolojiler

**Backend**:
- Python 3.11
- Flask
- Firebase Admin SDK
- Gunicorn (Production)

**Frontend**:
- Progressive Web App (PWA)
- Firebase Cloud Messaging
- Tailwind CSS

**Deploy**:
- Coolify
- Docker
- Git Webhook (Auto-deploy)

## ğŸ“‚ Proje Yapısı

```
quickserve/
â”œâ”€â”€ app.py                 # Flask Backend API â­
â”œâ”€â”€ requirements.txt       # Python dependencies
â”œâ”€â”€ Dockerfile            # Coolify build
â”œâ”€â”€ Procfile             # Alternative deploy
â”œâ”€â”€ runtime.txt          # Python version
â”œâ”€â”€ config.js            # API URL config
â”œâ”€â”€ .env                 # Environment (GİZLİ!)
â”œâ”€â”€ staff/               # Personel PWA
â”‚   â”œâ”€â”€ index.html
â”‚   â”œâ”€â”€ app.js
â”‚   â””â”€â”€ sw.js
â”œâ”€â”€ tablet/              # Tablet UI
â”‚   â”œâ”€â”€ index.html
â”‚   â””â”€â”€ app.js
â””â”€â”€ database-rules.json  # Firebase rules
```

## ğŸš€ Yerel Test

```bash
# Python dependencies yükle
pip install -r requirements.txt

# Backend başlat
python app.py

# Frontend çalıştır (başka terminal)
python -m http.server 5500
```

- Backend: `http://localhost:3000`
- Staff PWA: `http://localhost:5500/staff/`
- Tablet: `http://localhost:5500/tablet/`

## ğŸ“¡ API Endpoints

- `GET /health` - Health check
- `POST /api/send-notification` - Bildirim gönder
- `POST /api/subscribe` - FCM topic subscribe
- `GET /api/statistics` - İstatistikler

## ğŸ”§ Deployment

Detaylı talimatlar: **[GIT_DEPLOY.md](GIT_DEPLOY.md)**

```bash
# Kod değiştir
git add .
git commit -m "Update X"
git push

# Coolify otomatik deploy! ğŸ‰
```

## ğŸ¯ Kullanım

**Tablet**:
1. Salon seç (Barnabas, Zefiros, Kourion, Karmi)
2. "Servis Talep Et" butonuna bas
3. Talep personele iletilir

**Staff PWA**:
1. Bildirim iznini ver
2. Arka planda çalışır
3. Talep geldiğinde push notification alırsınız

## ğŸ”’ Güvenlik

- âœ… `.env` dosyası Git'e GİTMEMELİ (.gitignore)
- âœ… Coolify Environment Variables kullan
- âœ… HTTPS zorunlu (Production)
- âœ… CORS sadece izin verilen domain'ler
- âœ… Firebase Service Account güvenli

## ğŸ“Š Monitoring

**Coolify**: Dashboard â†’ Logs & Metrics

**Firebase Console**:
- Database: `/service-requests`, `/notifications`
- Cloud Messaging: Delivery rate

## âš ï¸ Sorun Giderme

**Backend başlamıyor?**
```bash
# Coolify logs kontrol et
# Environment variables tam mı?
```

**Bildirim gelmiyor?**
```bash
# Browser console kontrol et
# Firebase Console > Cloud Messaging
# Backend /health endpoint çalışıyor mu?
```

**CORS hatası?**
```bash
# ALLOWED_ORIGINS'e frontend URL ekle
ALLOWED_ORIGINS=https://staff.yourdomain.com,https://tablet.yourdomain.com
```

## âœ… Deploy Checklist

- [ ] `.env` dosyası `.gitignore`'da
- [ ] Git'e push edildi
- [ ] Coolify'da app oluşturuldu
- [ ] Environment variables eklendi
- [ ] Deploy edildi
- [ ] Health check testi OK
- [ ] `config.js` güncellendi
- [ ] Tablet â†’ Staff test OK

## ğŸ“ Notlar

- Backend 24/7 çalışmalı
- HTTPS zorunlu (FCM için)
- `git push` ile otomatik deploy
- Firebase Service Account kesinlikle gizli tutulmalı

## ğŸ†˜ Destek

1. [GIT_DEPLOY.md](GIT_DEPLOY.md) - Deploy rehberi
2. Coolify logs
3. Browser console
4. Firebase Console

---

**Merit Royal Diamond Otel** - QuickServe v1.0
