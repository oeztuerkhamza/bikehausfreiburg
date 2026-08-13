# BikeHaus Notlar — Sesli not uygulaması

Konuşarak not al, not sunucuya kaydedilsin, gerekirse takvime ve hatırlatmaya
dönüşsün. Giriş **BikeHaus Freiburg hesabıyla** (admin panelle aynı kullanıcı/şifre,
aynı JWT). Notlar sunucuda durur → telefonu değiştirsen de aynı liste gelir.

---

## Ne yapar

| Adım | Nasıl |
| --- | --- |
| **Konuş → yazı** | Android'in kendi konuşma tanıma servisi. Ücretsiz, Türkçe/Almanca/İngilizce. Sessizlikte servis kendini kapattığı için uygulama dinlemeyi otomatik yeniden başlatır — uzun dikte tek parça gibi akar. |
| **Düzgün metin + başlık** | Ham dikte sunucuya gider, **kayıtlı Claude anahtarıyla** (`Anthropic:ApiKey`) noktalanır, tekrarlar temizlenir, kısa bir başlık çıkarılır. İçerik değiştirilmez. |
| **Tarih yakalama** | "yarın saat üçte", "morgen um 15 Uhr" gibi ifadeler tarihe çevrilir (Almanya saati). Tarih yoksa boş bırakılır — uydurulmaz. |
| **Takvime ekle** | Telefonun takvim uygulaması başlık/tarih dolu açılır, sen kaydete basarsın. Google hesabı bağlamak, OAuth kurmak gerekmez; telefondaki hangi takvimse oraya yazar. |
| **Hatırlat** | Yerel bildirim kurulur (uygulama kapalıyken de çalar). |
| **Bitti / sil** | Biten notlar listenin sonuna düşer, hatırlatması iptal edilir. |
| **Ham metin** | Dikte edildiği hali her notta saklı. AI yanlış toparladıysa "↻ Yeniden düzenle" ile tekrar denenir. |

> Claude anahtarı yoksa ya da internet yoksa **not yine kaydedilir** — ham metin
> olduğu gibi durur. Notun kaybolması diye bir durum yok.

---

## Bağlandığı uçlar

| Ne | Nereye |
| --- | --- |
| Giriş / oturum | `https://api.bikehausfreiburg.com/api/auth/*` |
| Notlar | `https://api.bikehausfreiburg.com/api/sprachnotizen` (GET/POST/PUT/DELETE) |
| Yeniden düzenleme | `POST /api/sprachnotizen/aufbereiten` |

Adresi değiştirmek için: [`www/js/config.js`](www/js/config.js).
`CapacitorHttp` açık → istekler native katmandan gider, CORS sorunu olmaz.

---

## Kurulum & APK üretme

Toolchain `mobile-app` ile aynı (Android Studio yok, hepsi D:'de):

| Bileşen | Konum |
| --- | --- |
| Temurin **JDK 21** | `D:\dev-tools\jdk21\jdk-21.0.11+10` |
| Android SDK | `D:\android-sdk` |
| Gradle cache | `D:\dev-tools\gradle-home` |

```powershell
cd D:\projects\bikehausfreiburg\mobile-notes
npm install
npm run cap:sync

cd android
$env:JAVA_HOME  = "D:\dev-tools\jdk21\jdk-21.0.11+10"
$env:ANDROID_HOME = "D:\android-sdk"
$env:Path = "$env:JAVA_HOME\bin;$env:Path"
$env:GRADLE_USER_HOME = "D:\dev-tools\gradle-home"
.\gradlew.bat assembleDebug --no-daemon
```

Çıktı: `android\app\build\outputs\apk\debug\app-debug.apk`

`www/` altında bir şey değiştirdiysen **`npm run cap:sync`** çalıştırmadan build alma —
derlenen sürüm `android/app/src/main/assets/public/` içine kopyalanan sürümdür.

### Telefona kurma

APK'yı telefona at, dosya yöneticisinden aç, "bilinmeyen kaynak" iznini ver.
İlk açılışta iki izin sorulur: **mikrofon** (dikte) ve **bildirim** (hatırlatma).
`mobile-app`'tan ayrı bir uygulamadır (`com.bikehausfreiburg.notizen`), ikisi
yan yana durabilir.

---

## Yapı

```
www/
  index.html          Tüm ekranlar (giriş, liste, dikte, detay)
  css/style.css       Koyu tema
  js/
    app.js            Kabuk: oturum, ekran yönlendirme, dikte akışı
    config.js         Adresler, diller   ← burayı düzenle
    speech.js         Konuşma tanıma + otomatik yeniden başlatma döngüsü
    notes.js          Not uçları (liste/ekle/güncelle/sil)
    calendar.js       Takvim intent'i + yerel bildirim
    session.js        Token kalıcılığı (Preferences)
    http.js           fetch sarmalayıcı, Bearer token, 401 → çıkış
    auth.js           login / oturum doğrulama
    ui.js             Toast, tarih biçimleme
android/
  app/src/main/java/com/bikehausfreiburg/notizen/
    KalenderPlugin.java   Takvim uygulamasını açan küçük Capacitor eklentisi
    MainActivity.java     Eklentiyi kaydeder
```

## Sunucu tarafı

- Varlık: `Sprachnotiz` (başlık, metin, ham metin, tarih, bitti, dil)
- Servis: `SprachnotizService` — Claude ile toparlama + tarih çıkarma
- Uç: `SprachnotizenController` (`/api/sprachnotizen`)
- Migration: `AddSprachnotizen`

## Sonraki adımlar

- [ ] Uygulama ikonu (şu an Capacitor varsayılanı)
- [ ] Notlarda arama
- [ ] İmzalı release APK (şu an debug — kurulur ama Play Store'a yüklenemez)
