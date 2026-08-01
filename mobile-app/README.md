# BikeHaus Asistan — Android Uygulaması

**Mail AI**, **WhatsApp AI** ve **Kleinanzeigen AI** içeren mobil asistan. Capacitor + native ekranlar
(iframe yok). Mevcut sistemin JWT'siyle giriş yapar, mesajlar sunucuda merkezî
tutulduğu için **her cihazdan aynı sohbetler** görünür.

---

## Ne yapar

| Özellik | Nasıl |
| --- | --- |
| **Tek giriş** | Ana API'den JWT alır (`/api/auth/login`), Capacitor Preferences'ta saklar. Açılışta `/api/auth/me` ile doğrular → **tekrar login istemez**. Token süresi dolarsa otomatik login ekranına döner. |
| **Gelen mesaj altında Türkçe** | WhatsApp servisinin `/translate` ucu gelen mesajları Türkçeye çevirir ve **sunucuda saklar** (bir kez çevrilir, her cihazda görünür). Balonun altında sarı italik olarak çıkar. |
| **AI cevabı + Türkçe kontrol** | Türkçe talimat → AI müşteri dilinde cevap üretir → o cevap **geri Türkçeye çevrilip** ayrı kutuda gösterilir. Gönderilen metin hep müşteri dilindeki kutudur. |
| **İki yönlü düzenleme** | Almanca (müşteri dili) kutusunu doğrudan düzeltip gönderebilirsin. Türkçe kutusunu düzeltip **↻ Yeniden oluştur**'a basarsan, düzeltilmiş Türkçeden yeni bir müşteri-dili cevap üretilir ve Türkçesi tazelenir. |
| **Kleinanzeigen sohbeti** | İlanlara gelen mesajlar Gmail'e `…@mail.kleinanzeigen.de` alias'ından mail olarak düşer. Sunucu bunları ayrıştırıp (kişi, ilan başlığı, ilan no, mesaj) **sohbet** haline getirir; cevap aynı alias'a mail olarak gider ve alıcının Kleinanzeigen uygulamasında görünür. Bu mailler Mail sekmesinden filtrelenir. |
| **Ayrı Gmail hesabı** | Kleinanzeigen kendi Gmail hesabına bağlanabilir (ilanlar başka adreste olabilir). Ayarlar'da "Mail hesabı" ve "Kleinanzeigen hesabı" satırları var: dokununca bağla / çıkar. Kleinanzeigen hesabı yoksa Mail hesabı kullanılır. |
| **Kısa cevap üslubu** | Kleinanzeigen cevapları sohbet dilinde ve kısadır (selam + 1-3 cümle + `Viele Grüße / BikeHaus Freiburg`). Gönderilirken alıntı geçmiş temizlenir — alıcıya sadece yeni metin gider. |
| **Bildirimler** | Yerel bildirim (`@capacitor/local-notifications`). Uygulama ön plandayken yoklama ile yeni mesaj/mail saptanır, bildirim çalar. Bildirime dokununca ilgili sohbet açılır. |

> **Not:** Bildirimler şu an *yerel*. Uygulama tamamen kapalıyken bildirim gelmez.
> Bunun için ileride FCM (Firebase) eklenmeli.

---

## Bağlandığı uçlar

| Ne | Nereye |
| --- | --- |
| Giriş / oturum | `https://api.bikehausfreiburg.com/api/auth/*` |
| Mail AI (üretim + çeviri) | `https://api.bikehausfreiburg.com/api/aiemail/*` |
| Gmail (kutu, oku, gönder) | `https://api.bikehausfreiburg.com/api/gmail/*` |
| WhatsApp servisi | `https://admin.bikehausfreiburg.com/wa/api/*` |
| Kleinanzeigen sohbeti | `https://api.bikehausfreiburg.com/api/kleinanzeigenchat/*` |

`CapacitorHttp` açık → istekler native katmandan gider, **CORS sorunu olmaz**.
WhatsApp servisi ana API ile **aynı `JWT_SECRET_KEY`** ile doğrular, o yüzden tek token her ikisinde geçerli.

Adresleri değiştirmek için: [`www/js/config.js`](www/js/config.js)

---

## Kurulum & build

Toolchain bu makineye **Android Studio olmadan**, komut satırı araçlarıyla kuruldu
(C: dolu olduğu için hepsi D:'de). Sistem ortam değişkenlerine dokunulmadı —
değişkenler yalnızca build komutunda tanımlanır.

| Bileşen | Konum |
| --- | --- |
| Temurin **JDK 21** | `D:\dev-tools\jdk21\jdk-21.0.11+10` |
| Android SDK | `D:\android-sdk` (cmdline-tools, platform-tools, android-35, build-tools 35.0.0) |
| Gradle cache | `D:\dev-tools\gradle-home` |

> **JDK 21 şart.** Capacitor 7 modülleri Java 21 ile derleniyor; JDK 17 ile
> `error: invalid source release: 21` alırsın.

### APK üretme

```powershell
cd D:\projects\bikehausfreiburg\mobile-app
npm run cap:sync         # www/ → android/ kopyala + eklentileri guncelle

cd android
$env:JAVA_HOME  = "D:\dev-tools\jdk21\jdk-21.0.11+10"
$env:ANDROID_HOME = "D:\android-sdk"
$env:Path = "$env:JAVA_HOME\bin;$env:Path"
$env:GRADLE_USER_HOME = "D:\dev-tools\gradle-home"
.\gradlew.bat assembleDebug --no-daemon
```

Çıktı: `android\app\build\outputs\apk\debug\app-debug.apk`

Web tarafında bir şey değiştirdiysen **`npm run cap:sync` çalıştırmayı unutma** —
`android/app/src/main/assets/public/` içine kopyalanan sürüm derlenir.

### Bilinen tuzaklar

- **`android/local.properties`**: Java properties formatında ters bölü kaçış
  karakteridir. `sdk.dir=D\:\android-sdk` yazarsan `\a` yutulur, yol `D:android-sdk`
  olur ve build `IOException: The filename, directory name, or volume label syntax
  is incorrect` ile patlar. **İleri bölü kullan:** `sdk.dir=D:/android-sdk`
- **`typescript` 5.x'e sabit** — 7.x, Capacitor CLI'nin `capacitor.config.ts`
  okumasını kırıyor (`Cannot read properties of undefined (reading 'CommonJS')`).

### Release (imzalı) APK

Üretilen APK **debug** — telefona kurulur ama Play Store'a yüklenemez.
Release için keystore oluşturulup `android/app/build.gradle` içine imza yapılandırması
eklenmeli. İstersen ayrıca yapılabilir.

### Tarayıcıda hızlı bakış (sadece görünüm)

```powershell
npx serve www -l 4321
```

Tarayıcıda API çağrıları CORS'a takılır (native HTTP yok) — yalnızca tasarımı görmek içindir.

---

## Yapı

```
www/
  index.html            Tüm ekranların iskeleti
  css/style.css         WhatsApp koyu teması
  js/
    app.js              Kabuk: oturum, sekmeler, görünüm yönlendirme, global yoklama
    config.js           Adresler + yoklama aralıkları   ← burayı düzenle
    session.js          Token/kullanıcı kalıcılığı (Preferences)
    http.js             fetch sarmalayıcı, Bearer token, 401 → otomatik çıkış
    auth.js             login / oturum doğrulama
    whatsapp.js         Sohbet listesi, thread, çeviri, AI cevap, gönderim
    kleinanzeigen.js    Kleinanzeigen sohbetleri (aynı akış, Gmail üzerinden)
    mail.js             Gmail kutusu, mail detayı, AI cevap, gönderim
    translate.js        Ortak "Türkçeye çevir" (taslak kontrolü için)
    notify.js           Yerel bildirimler
    ui.js               Toast, tarih/isim biçimleme
    keyboard.js         Klavye açıkken görünür alan (--app-h / --kb)
android/                Capacitor'ün ürettiği native proje
```

## Sonraki adımlar

- [ ] FCM ile uygulama kapalıyken de bildirim
- [ ] WhatsApp QR/numara bağlama ekranını uygulamaya taşımak (şu an admin panelde)
- [ ] Mail'de arama + etiket filtreleri
- [ ] Uygulama ikonu / açılış ekranı (şu an Capacitor varsayılanı)
