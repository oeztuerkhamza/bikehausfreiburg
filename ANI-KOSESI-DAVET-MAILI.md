# Anı Köşesi — Davet Maili (toplu gönderim için)

Google-Bewertungs-Kampagne ile **aynı tarzda**: düz metin, kişisel, reklam gibi
durmayan — böylece Gmail "Werbung/Promotions" sekmesine düşmez. Kısa, tek link.

- **Gönderen:** Sen (kendi mail programın / Mailcow). Toplu gönderimde **BCC** kullan.
- **Alıcılar:** Kiralama (Miete) müşterileri.
- Kendi domain'inden gittiği için SPF/DKIM sorunu yok (DMARC p=reject uyumlu).
- Almanca konuşan müşteriye **DE**, diğerlerine **EN** gönder. Emin değilsen
  aşağıdaki **birleşik (DE+EN)** sürümü kullan.

---

## Konu satırı

**Almanca:**
```
Ihre schönste Radtour – teilen Sie sie mit uns
```

**İngilizce:**
```
Your best bike ride – share it with us
```

**Birleşik (DE + EN):**
```
Ihre schönste Radtour teilen / Share your best bike ride
```

---

## 1) Almanca sürüm

```
Hallo [Vorname],

vielen Dank, dass Sie bei Bike Haus Freiburg ein Rad gemietet haben.
Ich hoffe, Sie hatten eine schöne Tour.

Wir starten gerade eine kleine Erinnerungsecke auf unserer Website – eine
Sammlung echter Momente von Kundinnen und Kunden, die mit unseren Rädern
unterwegs waren. Und wir würden uns sehr freuen, wenn Ihre Erinnerung dabei ist.

Es dauert nur zwei Minuten: E-Mail kurz bestätigen (Sie erhalten einen
4-stelligen Code), bis zu 5 Fotos hochladen und ein paar Sätze zu Ihrer Tour
schreiben. Jede Einsendung prüfen wir persönlich, bevor sie veröffentlicht wird.

Hier geht es zur Erinnerungsecke:
https://bikehausfreiburg.com/de/erinnerungen

Vielen Dank, dass Sie ein Teil davon sind!

Viele Grüße
Cevdet Akarsu
Bike Haus Freiburg
Heckerstraße 27, 79114 Freiburg im Breisgau
Telefon / WhatsApp: +49 155 6630 0011

Wenn Sie keine weiteren E-Mails von uns möchten, antworten Sie einfach mit „Abmelden".
```

---

## 2) İngilizce sürüm

```
Hello [First name],

thank you for renting a bike from Bike Haus Freiburg. I hope you had a
wonderful ride.

We're starting a little Memory Corner on our website – a collection of real
moments from customers who explored the world on our bikes. And we would love
for your memory to be part of it.

It only takes two minutes: quickly confirm your email (you'll get a 4-digit
code), upload up to 5 photos and write a few sentences about your trip. We
personally review every submission before it goes live.

Here is the Memory Corner:
https://bikehausfreiburg.com/en/memories

Thank you for being part of it!

Best regards
Cevdet Akarsu
Bike Haus Freiburg
Heckerstraße 27, 79114 Freiburg im Breisgau
Phone / WhatsApp: +49 155 6630 0011

If you no longer wish to receive emails from us, simply reply with "unsubscribe".
```

---

## 3) Birleşik sürüm (DE + EN tek mailde)

```
Hallo [Vorname],

vielen Dank, dass Sie bei Bike Haus Freiburg ein Rad gemietet haben.
Wir starten eine kleine Erinnerungsecke auf unserer Website – echte Momente
von Kundinnen und Kunden, die mit unseren Rädern unterwegs waren. Wir würden
uns sehr freuen, wenn Ihre Erinnerung dabei ist.

Kurz E-Mail bestätigen (4-stelliger Code), bis zu 5 Fotos hochladen, ein paar
Sätze schreiben – fertig. Jede Einsendung prüfen wir vor der Veröffentlichung.

https://bikehausfreiburg.com/de/erinnerungen

------------------------------------------------------------

Hello [First name],

thank you for renting a bike from Bike Haus Freiburg. We're starting a little
Memory Corner on our website – real moments from customers who explored the
world on our bikes. We'd love for your memory to be part of it.

Just confirm your email (4-digit code), upload up to 5 photos and write a few
sentences – done. We review every submission before it goes live.

https://bikehausfreiburg.com/en/memories

------------------------------------------------------------

Viele Grüße / Best regards
Cevdet Akarsu
Bike Haus Freiburg
Heckerstraße 27, 79114 Freiburg im Breisgau
Telefon / WhatsApp: +49 155 6630 0011

Abmelden / unsubscribe: einfach auf diese E-Mail antworten.
```

---

## Toplu gönderim ipuçları
- **`[Vorname]` / `[First name]`** yerine gerçek ismi koy (mümkünse). İsim yoksa
  sadece "Hallo," / "Hello," ile başla.
- Toplu gönderimde alıcıları **BCC**'ye ekle — herkesin adresi birbirine
  görünmesin (KVKK/GDPR).
- Bir seferde çok sayıda alıcı yerine **50-100'lük gruplar** halinde gönder —
  Mailcow rate-limit yemez, teslim oranı yüksek kalır.
- HTML değil **düz metin** gönder — kişisel görünür, spam'e daha az takılır.
```
