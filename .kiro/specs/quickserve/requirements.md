# QuickServe - Toplantı Salonu Servis Talep Sistemi

## Giriş

QuickServe, Merit Royal Diamond Otel'deki toplantı salonlarında (Barnabas, Zefiros, Kourion, Karmi) bulunan tabletler üzerinden servis personeline anlık bildirim göndermeye yarayan bir PWA (Progressive Web App) sistemidir. Sistem, toplantı sırasında servis taleplerini dijital olarak iletir ve personelin gereksiz yere toplantı salonlarına girmesini önler.

## Sözlük (Glossary)

- **Tablet Arayüzü**: Toplantı salonlarında bulunan tabletlerde çalışan, servis talebi oluşturmak için kullanılan web arayüzü
- **Personel PWA**: Servis personelinin mobil cihazlarında çalışan, anlık bildirimleri alan Progressive Web App
- **FCM (Firebase Cloud Messaging)**: Google'ın anlık bildirim gönderme servisi
- **Servis Talebi**: Toplantı salonundan gönderilen ikram veya hizmet talebi
- **Salon Seçici**: Dört toplantı salonundan birini seçmeye yarayan arayüz bileşeni
- **Bildirim Sistemi**: FCM üzerinden çalışan anlık bildirim altyapısı

## Gereksinimler

### Gereksinim 1

**Kullanıcı Hikayesi:** Toplantı katılımcısı olarak, toplantı sırasında servis personelini aramak için dışarı çıkmadan, tablet üzerinden servis talebi göndermek istiyorum, böylece toplantı akışı kesintiye uğramaz.

#### Kabul Kriterleri

1. WHEN kullanıcı Tablet Arayüzünü açtığında, THE Tablet Arayüzü SHALL dört salon seçeneğini (Barnabas, Zefiros, Kourion, Karmi) görsel olarak gösterir
2. WHEN kullanıcı bir salon seçtiğinde, THE Tablet Arayüzü SHALL seçilen salonu vurgular ve servis talebi butonunu aktif hale getirir
3. WHEN kullanıcı servis talebi butonuna bastığında, THE Tablet Arayüzü SHALL seçilen salon bilgisini içeren bir bildirim talebini Bildirim Sistemi'ne gönderir
4. IF bildirim gönderimi başarısız olursa, THEN THE Tablet Arayüzü SHALL kullanıcıya hata mesajı gösterir ve 3 saniye sonra tekrar deneme seçeneği sunar
5. WHEN bildirim başarıyla gönderildiğinde, THE Tablet Arayüzü SHALL kullanıcıya başarı mesajı gösterir ve 2 saniye sonra salon seçim ekranına döner

### Gereksinim 2

**Kullanıcı Hikayesi:** Servis personeli olarak, hangi salonda servis talebi olduğunu anlık olarak öğrenmek istiyorum, böylece hızlı bir şekilde müdahale edebilirim.

#### Kabul Kriterleri

1. WHEN bir Servis Talebi oluşturulduğunda, THE Bildirim Sistemi SHALL tüm kayıtlı Personel PWA cihazlarına FCM üzerinden anlık bildirim gönderir
2. THE Bildirim Sistemi SHALL bildirimde salon adını ve talep zamanını içerir
3. WHEN Personel PWA bir bildirim aldığında, THE Personel PWA SHALL cihazda görünür bir bildirim gösterir
4. WHEN personel bildirime tıkladığında, THE Personel PWA SHALL uygulamayı açar ve talep detaylarını gösterir
5. THE Personel PWA SHALL arka planda çalışırken bile bildirimleri alır

### Gereksinim 3

**Kullanıcı Hikayesi:** Sistem yöneticisi olarak, sistemin şifre gerektirmeden çalışmasını istiyorum, böylece toplantı katılımcıları kolayca erişebilir.

#### Kabul Kriterleri

1. THE Tablet Arayüzü SHALL herhangi bir kimlik doğrulama veya şifre girişi gerektirmez
2. WHEN Tablet Arayüzü açıldığında, THE Tablet Arayüzü SHALL doğrudan salon seçim ekranını gösterir
3. THE Tablet Arayüzü SHALL oturum yönetimi veya kullanıcı kaydı tutmaz
4. THE Tablet Arayüzü SHALL her kullanımdan sonra otomatik olarak sıfırlanır

### Gereksinim 4

**Kullanıcı Hikayesi:** Sistem yöneticisi olarak, sistemin veri kaydetmemesini istiyorum, böylece KVKK ve gizlilik endişeleri olmaz.

#### Kabul Kriterleri

1. THE Tablet Arayüzü SHALL kullanıcı verisi, oturum bilgisi veya talep geçmişi kaydetmez
2. THE Personel PWA SHALL sadece FCM token bilgisini cihazda saklar
3. THE Bildirim Sistemi SHALL gönderilen bildirimlerin geçmişini sunucu tarafında saklamaz
4. THE Tablet Arayüzü SHALL tarayıcı önbelleğinde hassas veri saklamaz
5. THE Bildirim Sistemi SHALL sadece anlık bildirim iletimi için gerekli minimum veriyi işler

### Gereksinim 5

**Kullanıcı Hikayesi:** Otel yönetimi olarak, sistemin profesyonel ve otelin imajına uygun görünmesini istiyorum, böylece müşterilerimize kaliteli bir deneyim sunabiliriz.

#### Kabul Kriterleri

1. THE Tablet Arayüzü SHALL Merit Royal Diamond Otel logosunu ve marka renklerini kullanır
2. THE Tablet Arayüzü SHALL Tailwind CSS ile responsive ve modern bir tasarıma sahiptir
3. THE Tablet Arayüzü SHALL her salon için görsel temsil içerir
4. THE Personel PWA SHALL profesyonel ve okunabilir bir bildirim tasarımı kullanır
5. THE Tablet Arayüzü SHALL tablet ekranlarında (768px ve üzeri) optimize edilmiş görünür

### Gereksinim 6

**Kullanıcı Hikayesi:** Servis personeli olarak, PWA'yı mobil cihazıma yükleyebilmek istiyorum, böylece uygulama gibi kullanabilirim.

#### Kabul Kriterleri

1. THE Personel PWA SHALL manifest.json dosyası içerir
2. THE Personel PWA SHALL service worker ile offline çalışma desteği sağlar
3. THE Personel PWA SHALL "Ana Ekrana Ekle" özelliğini destekler
4. THE Personel PWA SHALL uygulama ikonu ve splash screen içerir
5. WHEN Personel PWA offline olduğunda, THE Personel PWA SHALL kullanıcıya bağlantı durumu hakkında bilgi verir

### Gereksinim 7

**Kullanıcı Hikayesi:** Sistem yöneticisi olarak, sistemin hızlı ve güvenilir çalışmasını istiyorum, böylece servis kalitesi etkilenmez.

#### Kabul Kriterleri

1. WHEN kullanıcı servis talebi butonuna bastığında, THE Bildirim Sistemi SHALL 2 saniye içinde bildirimi gönderir
2. THE Tablet Arayüzü SHALL 1 saniye içinde yüklenir
3. THE Bildirim Sistemi SHALL 99% uptime garantisi sağlar
4. IF FCM servisi erişilemez durumda ise, THEN THE Tablet Arayüzü SHALL kullanıcıya anlaşılır bir hata mesajı gösterir
5. THE Personel PWA SHALL bildirim alımında maksimum 3 saniye gecikme yaşar
