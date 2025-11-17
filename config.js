// QuickServe Configuration
// Bu dosya HTML'lere dahil edilecek ve API URL'ini tanımlayacak

(function() {
  // Production'da Coolify URL'iniz, development'ta localhost
  window.QUICKSERVE_API_URL =
    window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      ? 'http://localhost:3000'
      : 'https://YOUR_COOLIFY_BACKEND_URL'; // Coolify'a deploy ettikten sonra buraya backend URL'ini yazın

  console.log('🔧 QuickServe API URL:', window.QUICKSERVE_API_URL);
})();
