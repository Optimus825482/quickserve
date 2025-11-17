@echo off
REM QuickServe - Windows Deployment Script
REM Merit Royal Diamond Otel

echo.
echo ========================================
echo QuickServe Firebase Deployment
echo ========================================
echo.

REM Check Firebase CLI
where firebase >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Firebase CLI bulunamadi!
    echo.
    echo Lutfen once Firebase CLI'yi yukleyin:
    echo npm install -g firebase-tools
    echo.
    pause
    exit /b 1
)

echo [OK] Firebase CLI bulundu
echo.

REM Check if logged in
firebase projects:list >nul 2>nul
if %errorlevel% neq 0 (
    echo [INFO] Firebase login gerekiyor...
    firebase login
    if %errorlevel% neq 0 (
        echo [ERROR] Login basarisiz!
        pause
        exit /b 1
    )
)

echo [OK] Firebase authentication OK
echo.

REM Deploy Database Rules
echo [1/3] Database rules deploy ediliyor...
firebase deploy --only database
if %errorlevel% neq 0 (
    echo [ERROR] Database rules deploy hatasi!
    pause
    exit /b 1
)
echo [OK] Database rules deploy edildi
echo.

REM Deploy Functions
echo [2/3] Cloud Functions deploy ediliyor...
cd functions
if not exist "node_modules" (
    echo [INFO] npm install yapiliyor...
    call npm install
    if %errorlevel% neq 0 (
        echo [ERROR] npm install hatasi!
        cd ..
        pause
        exit /b 1
    )
)
cd ..

firebase deploy --only functions
if %errorlevel% neq 0 (
    echo [ERROR] Functions deploy hatasi!
    pause
    exit /b 1
)
echo [OK] Functions deploy edildi
echo.

REM Deploy Hosting (Optional)
echo [3/3] Hosting deploy edilsin mi? (y/n)
set /p deploy_hosting="Secim: "
if /i "%deploy_hosting%"=="y" (
    firebase deploy --only hosting
    if %errorlevel% neq 0 (
        echo [WARNING] Hosting deploy hatasi
    ) else (
        echo [OK] Hosting deploy edildi
    )
)

echo.
echo ========================================
echo Deployment tamamlandi!
echo ========================================
echo.
echo Kontroller:
echo 1. Firebase Console: https://console.firebase.google.com/project/shuttle-call-835d9
echo 2. Database Rules: https://console.firebase.google.com/project/shuttle-call-835d9/database
echo 3. Functions: https://console.firebase.google.com/project/shuttle-call-835d9/functions
echo.
echo Test icin:
echo - Staff PWA: http://localhost:5500/staff/
echo - Tablet: http://localhost:5500/tablet/
echo.
pause
