# BikeHaus Freiburg — API Endpoint Reference

> Tüm API endpoint'lerinin detaylı listesi. AI'a API ile ilgili soru sorarken kullanın.

---

## Auth (`/api/auth`)

| Method | Endpoint             | Açıklama          | Body                                  |
| ------ | -------------------- | ----------------- | ------------------------------------- |
| POST   | `/api/auth/login`    | Giriş yap         | `{ username, password }`              |
| POST   | `/api/auth/register` | Kullanıcı oluştur | `{ username, password, displayName }` |

---

## Bicycles (`/api/bicycles`)

| Method | Endpoint                  | Açıklama                                         |
| ------ | ------------------------- | ------------------------------------------------ |
| GET    | `/api/bicycles`           | Tüm bisikletler (query: search, status, zustand) |
| GET    | `/api/bicycles/{id}`      | Bisiklet detay                                   |
| GET    | `/api/bicycles/available` | Sadece Available olanlar                         |
| POST   | `/api/bicycles`           | Bisiklet oluştur                                 |
| PUT    | `/api/bicycles/{id}`      | Bisiklet güncelle                                |
| DELETE | `/api/bicycles/{id}`      | Bisiklet sil                                     |

---

## Customers (`/api/customers`)

| Method | Endpoint                   | Açıklama                       |
| ------ | -------------------------- | ------------------------------ |
| GET    | `/api/customers`           | Tüm müşteriler (query: search) |
| GET    | `/api/customers/{id}`      | Müşteri detay                  |
| POST   | `/api/customers`           | Müşteri oluştur                |
| PUT    | `/api/customers/{id}`      | Müşteri güncelle               |
| DELETE | `/api/customers/{id}`      | Müşteri sil                    |
| GET    | `/api/customers/search?q=` | Müşteri ara                    |

---

## Purchases (`/api/purchases`)

| Method | Endpoint                        | Açıklama                                    |
| ------ | ------------------------------- | ------------------------------------------- |
| GET    | `/api/purchases`                | Tüm alımlar (query: page, pageSize, search) |
| GET    | `/api/purchases/{id}`           | Alım detay                                  |
| POST   | `/api/purchases`                | Alım oluştur (bisiklet + müşteri birlikte)  |
| POST   | `/api/purchases/bulk`           | Toplu alım                                  |
| PUT    | `/api/purchases/{id}`           | Alım güncelle                               |
| DELETE | `/api/purchases/{id}`           | Alım sil                                    |
| GET    | `/api/purchases/{id}/kaufbeleg` | PDF Kaufbeleg indir                         |

---

## Sales (`/api/sales`)

| Method | Endpoint                        | Açıklama                                     |
| ------ | ------------------------------- | -------------------------------------------- |
| GET    | `/api/sales`                    | Tüm satışlar (query: page, pageSize, search) |
| GET    | `/api/sales/{id}`               | Satış detay                                  |
| POST   | `/api/sales`                    | Satış oluştur                                |
| PUT    | `/api/sales/{id}`               | Satış güncelle                               |
| DELETE | `/api/sales/{id}`               | Satış sil                                    |
| GET    | `/api/sales/{id}/verkaufsbeleg` | PDF Verkaufsbeleg indir                      |
| GET    | `/api/sales/{id}/rechnung`      | PDF Rechnung indir                           |

---

## Reservations (`/api/reservations`)

| Method | Endpoint                         | Açıklama            |
| ------ | -------------------------------- | ------------------- |
| GET    | `/api/reservations`              | Tüm rezervasyonlar  |
| GET    | `/api/reservations/{id}`         | Rezervasyon detay   |
| POST   | `/api/reservations`              | Rezervasyon oluştur |
| PUT    | `/api/reservations/{id}`         | Güncelle            |
| POST   | `/api/reservations/{id}/convert` | Satışa dönüştür     |
| POST   | `/api/reservations/{id}/cancel`  | İptal et            |

---

## Returns (`/api/returns`)

| Method | Endpoint            | Açıklama     |
| ------ | ------------------- | ------------ |
| GET    | `/api/returns`      | Tüm iadeler  |
| GET    | `/api/returns/{id}` | İade detay   |
| POST   | `/api/returns`      | İade oluştur |

---

## Expenses (`/api/expenses`)

| Method | Endpoint             | Açıklama                                                |
| ------ | -------------------- | ------------------------------------------------------- |
| GET    | `/api/expenses`      | Tüm giderler (query: page, pageSize, search, kategorie) |
| GET    | `/api/expenses/{id}` | Gider detay                                             |
| POST   | `/api/expenses`      | Gider oluştur                                           |
| PUT    | `/api/expenses/{id}` | Gider güncelle                                          |
| DELETE | `/api/expenses/{id}` | Gider sil                                               |

---

## Documents (`/api/documents`)

| Method | Endpoint                             | Açıklama                          |
| ------ | ------------------------------------ | --------------------------------- |
| POST   | `/api/documents/upload`              | Dosya yükle (multipart/form-data) |
| GET    | `/api/documents/{id}/download`       | Dosya indir                       |
| DELETE | `/api/documents/{id}`                | Dosya sil                         |
| GET    | `/api/documents/bicycle/{bicycleId}` | Bisiklete ait dosyalar            |

---

## Dashboard (`/api/dashboard`)

| Method | Endpoint         | Açıklama                |
| ------ | ---------------- | ----------------------- |
| GET    | `/api/dashboard` | Dashboard özet verileri |

---

## Statistics (`/api/statistics`)

| Method | Endpoint          | Açıklama                           |
| ------ | ----------------- | ---------------------------------- |
| GET    | `/api/statistics` | İstatistikler (query: year, month) |

---

## Archive (`/api/archive`)

| Method | Endpoint                            | Açıklama                                        |
| ------ | ----------------------------------- | ----------------------------------------------- |
| GET    | `/api/archive/search?q=`            | Arşiv arama (StokNo, Rahmennummer, BelegNummer) |
| GET    | `/api/archive/bicycle/{id}/history` | Bisiklet geçmişi timeline                       |

---

## Settings (`/api/settings`)

| Method | Endpoint        | Açıklama                 |
| ------ | --------------- | ------------------------ |
| GET    | `/api/settings` | Dükkan ayarları          |
| PUT    | `/api/settings` | Dükkan ayarları güncelle |

---

## Backup (`/api/backup`)

| Method | Endpoint              | Açıklama                         |
| ------ | --------------------- | -------------------------------- |
| POST   | `/api/backup/create`  | Yedek oluştur (ZIP indir)        |
| POST   | `/api/backup/restore` | Yedekten geri yükle (ZIP upload) |

---

## Accessory Catalog (`/api/accessorycatalog`)

| Method | Endpoint                     | Açıklama           |
| ------ | ---------------------------- | ------------------ |
| GET    | `/api/accessorycatalog`      | Tüm aksesuarlar    |
| POST   | `/api/accessorycatalog`      | Aksesuvar ekle     |
| PUT    | `/api/accessorycatalog/{id}` | Aksesuvar güncelle |
| DELETE | `/api/accessorycatalog/{id}` | Aksesuvar sil      |

---

## Ortak Query Parametreleri

- `page` (int) — Sayfa numarası (1-based)
- `pageSize` (int) — Sayfa başına kayıt (varsayılan: 10)
- `search` (string) — Arama metni
- JSON Body: camelCase property isimleri
- Enum değerleri: string olarak gönderilir ("Available", "Bar", "Neu" vb.)
