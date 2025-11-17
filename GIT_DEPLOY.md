# 🚀 QuickServe - Git & Coolify Deploy (Flask)

## ⚡ Hızlı Deploy (3 Adım)

### 1️⃣ Git'e Push Et

```bash
# Git init (eğer yoksa)
git init

# Dosyaları ekle
git add .

# Commit
git commit -m "QuickServe Flask backend ilk commit"

# Remote ekle (GitHub/GitLab/Bitbucket)
git remote add origin https://github.com/USERNAME/quickserve.git

# Push
git push -u origin main
```

### 2️⃣ Coolify'da Deploy Et

1. **Coolify Dashboard** → **New Resource** → **Application**
2. **Source**: Git repository'nizi seçin
3. **Build Pack**: `Dockerfile` (otomatik algılar)
4. **Port**: `3000`
5. **Health Check Path**: `/health`

### 3️⃣ Environment Variables Ekle

Coolify'da **Environment** sekmesinden ekleyin:

```bash
# Flask
FLASK_ENV=production
PORT=3000

# Firebase
FIREBASE_SERVICE_ACCOUNT_BASE64=<.env dosyasındaki değer - TAM KOPYALAYABİLİRSİNİZ>
FIREBASE_PROJECT_ID=shuttle-call-835d9

# CORS (Frontend URL'iniz)
ALLOWED_ORIGINS=https://quickserve-staff.yourdomain.com,https://quickserve-tablet.yourdomain.com
```

**✅ DEPLOY!** Coolify otomatik build yapıp başlatacak!

---

## 📋 Detaylı Adımlar

### Git Repository Oluşturma

#### GitHub:
1. GitHub'da yeni repo oluştur: `quickserve`
2. Terminal'de:
```bash
git init
git add .
git commit -m "Initial commit - Flask backend"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/quickserve.git
git push -u origin main
```

#### GitLab/Bitbucket:
Aynı şekilde, sadece URL değişir.

### Coolify Yapılandırması

#### Otomatik Algılama:
Coolify `Dockerfile` görecek ve otomatik:
- ✅ Python 3.11 image kullanacak
- ✅ Requirements install edecek
- ✅ Gunicorn ile başlatacak
- ✅ Health check yapacak
- ✅ Port 3000'i expose edecek

#### Manuel Ayarlar (gerekirse):

**Build Command**:
```bash
pip install -r requirements.txt
```

**Start Command**:
```bash
gunicorn app:app --bind 0.0.0.0:$PORT --workers 2 --threads 2
```

### Environment Variables (ÖNEMLİ!)

`.env` dosyasından kopyalayın:

```bash
# .env dosyasını göster
cat .env

# FIREBASE_SERVICE_ACCOUNT_BASE64 değerini kopyala
# Coolify'da Environment Variables'a yapıştır
```

**Tüm Variables**:
```
FLASK_ENV=production
PORT=3000
FIREBASE_SERVICE_ACCOUNT_BASE64=eyJ0eXBlIjoic2VydmljZV9hY2NvdW50IiwicHJva... (TAM DEĞER)
FIREBASE_PROJECT_ID=shuttle-call-835d9
ALLOWED_ORIGINS=https://yourdomain.com
```

---

## 🧪 Test

### Deploy Sonrası Test:

```bash
# Health check
curl https://quickserve-backend.your-coolify-domain.com/health

# Beklenen response:
{
  "status": "healthy",
  "timestamp": 1234567890,
  "service": "QuickServe Backend",
  "version": "1.0.0",
  "firebase": "connected"
}
```

### Notification Test:

```bash
curl -X POST https://quickserve-backend.your-coolify-domain.com/api/send-notification \
  -H "Content-Type: application/json" \
  -d '{"salon": "Barnabas"}'
```

---

## 🔧 Frontend Güncelleme

Deploy edilen backend URL'ini `config.js`'e ekleyin:

```javascript
// config.js
window.QUICKSERVE_API_URL = 'https://quickserve-backend.your-coolify-domain.com';
```

Frontend'i de Git'e push edip Coolify'a deploy edin veya Firebase Hosting kullanın.

---

## 📦 Dosya Yapısı (Git'e Gidecekler)

```
✅ app.py                    # Flask backend
✅ requirements.txt          # Python dependencies
✅ Dockerfile               # Coolify build için
✅ Procfile                 # Alternatif (Heroku-like)
✅ runtime.txt              # Python version
✅ .env                     # Environment variables (GİZLİ!)
✅ .gitignore              # Git'e gitmeyecekler
✅ config.js               # Frontend config
✅ staff/                  # Staff PWA
✅ tablet/                 # Tablet UI
✅ database-rules.json     # Firebase rules
✅ README.md               # Dokümantasyon
```

---

## 🔒 Güvenlik

### .env Dosyası GİT'E GİTMEMELİ!

`.gitignore` zaten ayarlı, ama kontrol edin:

```bash
# .env dosyası git'te olmamalı
git status

# Eğer .env görünüyorsa:
git rm --cached .env
git commit -m "Remove .env from git"
```

**Önemli**: `.env` dosyasındaki değerleri **Coolify Environment Variables**'a manuel kopyalayın!

---

## 🚀 Coolify Auto-Deploy

### Webhook (Otomatik Deploy):

Coolify'da **Webhooks** sekmesinden:
1. Git webhook URL'ini kopyala
2. GitHub/GitLab Settings → Webhooks → Ekle
3. Artık her `git push`'ta otomatik deploy!

```bash
# Kod değişikliği yap
git add .
git commit -m "Update feature X"
git push

# Coolify otomatik redeploy yapacak! 🎉
```

---

## 📊 Monitoring

### Coolify Logs:
Dashboard → Your App → **Logs** sekmesi

### Firebase Console:
- Database: https://console.firebase.google.com/project/shuttle-call-835d9/database
- Cloud Messaging: Notification delivery

---

## ⚠️ Sorun Giderme

### Build hatası:
```bash
# Coolify logs kontrol et
# requirements.txt doğru mu?
# Python version runtime.txt'te doğru mu?
```

### Firebase bağlanamıyor:
```bash
# Environment variable kontrol
echo $FIREBASE_SERVICE_ACCOUNT_BASE64 | wc -c
# 1000+ karakter olmalı

# Coolify'da Environment Variables'ı tekrar kontrol et
```

### CORS hatası:
```bash
# ALLOWED_ORIGINS'e frontend URL ekleyin
ALLOWED_ORIGINS=https://staff.yourdomain.com,https://tablet.yourdomain.com
```

---

## ✅ Deploy Checklist

- [ ] Git repository oluşturuldu
- [ ] Tüm dosyalar commit edildi
- [ ] `.env` dosyası `.gitignore`'da
- [ ] GitHub/GitLab'a push edildi
- [ ] Coolify'da uygulama oluşturuldu
- [ ] Dockerfile build pack seçildi
- [ ] Environment variables eklendi
- [ ] Port 3000 ayarlandı
- [ ] Health check `/health` ayarlandı
- [ ] Deploy edildi
- [ ] Health check testi yapıldı
- [ ] Notification test edildi
- [ ] `config.js` backend URL ile güncellendi
- [ ] Frontend deploy edildi
- [ ] Tablet → Staff bildirim testi yapıldı

---

## 🎉 Tamamlandı!

Artık her `git push`'ta Coolify otomatik deploy yapacak!

```bash
# Değişiklik yap
vim app.py

# Commit & Push
git add .
git commit -m "Feature: XYZ eklendi"
git push

# Coolify otomatik deploy! 🚀
```

**Notlar**:
- Backend: Python/Flask + Gunicorn
- Deploy: Coolify + Docker
- Database: Firebase Realtime Database
- Notifications: Firebase Cloud Messaging
- Frontend: PWA (Staff + Tablet)
