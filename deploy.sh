#!/bin/bash
# QuickServe - Unix/Linux/Mac Deployment Script
# Merit Royal Diamond Otel

echo ""
echo "========================================"
echo "QuickServe Firebase Deployment"
echo "========================================"
echo ""

# Check Firebase CLI
if ! command -v firebase &> /dev/null; then
    echo "[ERROR] Firebase CLI bulunamadı!"
    echo ""
    echo "Lütfen önce Firebase CLI'yi yükleyin:"
    echo "npm install -g firebase-tools"
    echo ""
    exit 1
fi

echo "[OK] Firebase CLI bulundu"
echo ""

# Check if logged in
if ! firebase projects:list &> /dev/null; then
    echo "[INFO] Firebase login gerekiyor..."
    firebase login
    if [ $? -ne 0 ]; then
        echo "[ERROR] Login başarısız!"
        exit 1
    fi
fi

echo "[OK] Firebase authentication OK"
echo ""

# Deploy Database Rules
echo "[1/3] Database rules deploy ediliyor..."
firebase deploy --only database
if [ $? -ne 0 ]; then
    echo "[ERROR] Database rules deploy hatası!"
    exit 1
fi
echo "[OK] Database rules deploy edildi"
echo ""

# Deploy Functions
echo "[2/3] Cloud Functions deploy ediliyor..."
cd functions
if [ ! -d "node_modules" ]; then
    echo "[INFO] npm install yapılıyor..."
    npm install
    if [ $? -ne 0 ]; then
        echo "[ERROR] npm install hatası!"
        cd ..
        exit 1
    fi
fi
cd ..

firebase deploy --only functions
if [ $? -ne 0 ]; then
    echo "[ERROR] Functions deploy hatası!"
    exit 1
fi
echo "[OK] Functions deploy edildi"
echo ""

# Deploy Hosting (Optional)
echo "[3/3] Hosting deploy edilsin mi? (y/n)"
read -p "Seçim: " deploy_hosting
if [[ "$deploy_hosting" =~ ^[Yy]$ ]]; then
    firebase deploy --only hosting
    if [ $? -ne 0 ]; then
        echo "[WARNING] Hosting deploy hatası"
    else
        echo "[OK] Hosting deploy edildi"
    fi
fi

echo ""
echo "========================================"
echo "Deployment tamamlandı!"
echo "========================================"
echo ""
echo "Kontroller:"
echo "1. Firebase Console: https://console.firebase.google.com/project/shuttle-call-835d9"
echo "2. Database Rules: https://console.firebase.google.com/project/shuttle-call-835d9/database"
echo "3. Functions: https://console.firebase.google.com/project/shuttle-call-835d9/functions"
echo ""
echo "Test için:"
echo "- Staff PWA: http://localhost:5500/staff/"
echo "- Tablet: http://localhost:5500/tablet/"
echo ""
