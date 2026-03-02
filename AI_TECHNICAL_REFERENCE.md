# BikeHaus Freiburg — Detaylı Teknik Referans (AI için)

> Bu dosya AI asistanlarına projenin tüm teknik detaylarını verir.
> Kodla ilgili sorularınızda veya yeni özellik geliştirirken bu dosyayı kullanın.

---

## A. Entity'lerin Tam Yapısı

### BaseEntity

```csharp
public abstract class BaseEntity {
    int Id;
    DateTime CreatedAt = DateTime.UtcNow;
    DateTime? UpdatedAt;
}
```

### Bicycle : BaseEntity

```
string Marke              — Marka (Required, MaxLength 100)
string Modell             — Model (MaxLength 100)
string? Rahmennummer      — Seri/Çerçeve No (MaxLength 50, Indexed)
string? Rahmengroesse     — Çerçeve Büyüklüğü
string? Farbe             — Renk (MaxLength 50)
string Reifengroesse      — Tekerlek Büyüklüğü (Required, MaxLength 20)
string? StokNo            — Stok Numarası
string? Fahrradtyp        — Bisiklet Tipi (E-Bike, Trekking vb.)
string? Beschreibung      — Açıklama (MaxLength 500)
BikeStatus Status         — Available | Sold | Reserved
BikeCondition Zustand     — Neu | Gebraucht
Nav: Purchase?, Sale?, Reservation?, Documents[]
```

### Customer : BaseEntity

```
string Vorname            — Ad (Required, MaxLength 100)
string Nachname           — Soyad (Required, MaxLength 100)
string? Strasse           — Sokak (MaxLength 200)
string? Hausnummer        — Kapı No (MaxLength 10)
string? PLZ               — Posta Kodu (MaxLength 10)
string? Stadt             — Şehir (MaxLength 100)
string? Telefon           — Telefon (MaxLength 20)
string? Email             — E-posta (MaxLength 200)
string? Steuernummer      — Vergi No
Computed: FullName, FullAddress (Ignored by EF)
Nav: Purchases[], Sales[], Returns[], Reservations[]
```

### Purchase : BaseEntity

```
int BicycleId             — FK → Bicycle (1:1, Restrict)
int SellerId              — FK → Customer (N:1, Restrict)
decimal Preis             — Fiyat (decimal(18,2))
PaymentMethod Zahlungsart — Ödeme Yöntemi
DateTime Kaufdatum        — Alım Tarihi
string? Notizen           — Notlar (MaxLength 1000)
string? BelegNummer       — Belge No (MaxLength 20, Indexed)
decimal? VerkaufspreisVorschlag — Önerilen Satış Fiyatı
string? AnzeigeNr         — İlan Numarası
Nav: Bicycle, Seller, Signature (cascade), Documents[], Sale?
```

### Sale : BaseEntity

```
int BicycleId             — FK → Bicycle (1:1, Restrict)
int BuyerId               — FK → Customer (N:1, Restrict)
int? PurchaseId           — FK → Purchase (1:1, SetNull)
decimal Preis             — Satış Fiyatı (decimal(18,2))
PaymentMethod Zahlungsart — Ödeme Yöntemi
DateTime Verkaufsdatum    — Satış Tarihi
bool Garantie             — Garanti Var/Yok
string? GarantieBedingungen — Garanti Koşulları (MaxLength 2000)
string? Notizen           — Notlar (MaxLength 1000)
string BelegNummer        — Belge No (Required, MaxLength 20, Unique)
decimal Rabatt            — İndirim
int? BuyerSignatureId     — FK → Signature (SetNull)
int? SellerSignatureId    — FK → Signature (SetNull)
Computed: Gesamtbetrag = Preis + Accessories.Sum(a.Gesamtpreis) - Rabatt (Ignored by EF)
Nav: Bicycle, Buyer, Purchase?, BuyerSignature?, SellerSignature?, Documents[], Accessories[]
```

### SaleAccessory : BaseEntity

```
int SaleId                — FK → Sale (Cascade)
string Bezeichnung        — Ad (Required, MaxLength 200)
decimal Preis             — Fiyat (decimal(18,2))
int Menge                 — Miktar (Required)
Computed: Gesamtpreis = Preis * Menge (Ignored by EF)
```

### Reservation : BaseEntity

```
int BicycleId             — FK → Bicycle (1:1, Restrict)
int CustomerId            — FK → Customer (N:1, Restrict)
DateTime ReservierungsDatum — Rezervasyon Tarihi
DateTime AblaufDatum      — Bitiş Tarihi
decimal? Anzahlung        — Kapora (decimal(18,2))
string? Notizen           — Notlar (MaxLength 1000)
ReservationStatus Status  — Active | Converted | Expired | Cancelled
string ReservierungsNummer — Rez. No (Required, MaxLength 20, Unique)
int? SaleId               — Satışa dönüştüyse FK (SetNull)
Nav: Bicycle, Customer, Sale?
```

### Return : BaseEntity

```
int SaleId                — FK → Sale (Restrict)
int BicycleId             — FK → Bicycle (Restrict)
int CustomerId            — FK → Customer (N:1, Restrict)
DateTime Rueckgabedatum   — İade Tarihi
ReturnReason Grund        — İade Sebebi
string? GrundDetails      — Detay (MaxLength 1000)
decimal Erstattungsbetrag — İade Tutarı (decimal(18,2))
PaymentMethod Zahlungsart — İade Ödeme Yöntemi
string? Notizen           — Notlar (MaxLength 1000)
string BelegNummer        — Belge No (Required, MaxLength 20, Unique)
int? CustomerSignatureId  — FK → Signature (SetNull)
int? ShopSignatureId      — FK → Signature (SetNull)
Nav: Sale, Bicycle, Customer, CustomerSignature?, ShopSignature?, Documents[]
```

### Expense : BaseEntity

```
string Bezeichnung        — Açıklama (Required, MaxLength 200)
string? Kategorie         — Kategori (MaxLength 100)
decimal Betrag            — Tutar (decimal(18,2))
DateTime Datum            — Tarih
string? Lieferant         — Tedarikçi (MaxLength 200)
string? BelegNummer       — Belge No (MaxLength 50)
string? Notizen           — Notlar (MaxLength 1000)
```

### Document : BaseEntity

```
string FileName, FilePath, ContentType — Dosya bilgileri
long FileSize
DocumentType DocumentType
int? BicycleId, int? PurchaseId, int? SaleId — Opsiyonel FK'lar (SetNull)
```

### Signature : BaseEntity

```
string SignatureData      — Base64 imza
string SignerName         — İmzacı adı (Required, MaxLength 200)
SignatureType SignatureType
DateTime SignedAt
int? PurchaseId           — FK (Cascade)
```

### ShopSettings : BaseEntity

```
ShopName, Strasse, Hausnummer, PLZ, Stadt, Telefon, Email, Website
Steuernummer, UstIdNr, Bankname, IBAN, BIC
LogoBase64, LogoFileName
InhaberVorname, InhaberNachname, InhaberSignatureBase64, InhaberSignatureFileName
FahrradNummerStart — Bisiklet numaralama başlangıcı
Oeffnungszeiten, Zusatzinfo
```

### User : BaseEntity

```
string Username (Required, Unique), PasswordHash (Required)
string DisplayName (MaxLength 200), string Role = "Admin" (MaxLength 50)
```

---

## B. İlişki Diyagramı

```
Customer ──1:N──→ Purchase ──1:1──→ Bicycle
Customer ──1:N──→ Sale ──────1:1──→ Bicycle
Customer ──1:N──→ Reservation──1:1→ Bicycle
Customer ──1:N──→ Return ────────→ Sale (ref)

Sale ──1:N──→ SaleAccessory
Sale ──1:1──→ Purchase (opsiyonel, SetNull)
Sale ──0:1──→ BuyerSignature, SellerSignature

Purchase ──1:1──→ Signature (Cascade)
Purchase ──1:N──→ Document
Sale ────1:N──→ Document
Bicycle ──1:N──→ Document

Reservation ──0:1──→ Sale (dönüştürme sonrası)
Return ──0:1──→ CustomerSignature, ShopSignature
```

---

## C. Servis Katmanı (Application)

Her servis genellikle şu metotlara sahiptir:

- `GetAllAsync()` / `GetPaginatedAsync(page, pageSize, search?)`
- `GetByIdAsync(int id)`
- `CreateAsync(CreateDto dto)`
- `UpdateAsync(int id, UpdateDto dto)`
- `DeleteAsync(int id)`

Özel metotlar:

- `PurchaseService`: `CreateWithBicycleAsync`, `BulkCreateAsync`
- `SaleService`: `CreateAsync` (imza + aksesuvar dahil)
- `ReservationService`: `ConvertToSaleAsync`, `CancelAsync`
- `StatisticsService`: `GetStatisticsAsync(year?, month?)`
- `ArchiveService`: `SearchAsync(query)`, `GetBicycleHistoryAsync(bicycleId)`
- `PdfService`: `GenerateKaufbeleg`, `GenerateVerkaufsbeleg`, `GenerateRechnung`

---

## D. Frontend Servisleri

| Service                 | Base URL                | Temel Metotlar                                  |
| ----------------------- | ----------------------- | ----------------------------------------------- |
| BicycleService          | `/api/bicycles`         | getAll, getById, create, update, delete, search |
| CustomerService         | `/api/customers`        | getAll, search, create, update, delete          |
| PurchaseService         | `/api/purchases`        | getAll, getById, create, update, delete         |
| SaleService             | `/api/sales`            | getAll, getById, create, update, delete, getPdf |
| ReservationService      | `/api/reservations`     | getAll, create, convertToSale, cancel           |
| ReturnService           | `/api/returns`          | getAll, create                                  |
| ExpenseService          | `/api/expenses`         | getAll, create, update, delete                  |
| DocumentService         | `/api/documents`        | upload, download, delete, getByBicycle          |
| DashboardService        | `/api/dashboard`        | getDashboard                                    |
| StatisticsService       | `/api/statistics`       | getStatistics                                   |
| ArchiveService          | `/api/archive`          | search, getBicycleHistory                       |
| SettingsService         | `/api/settings`         | getSettings, updateSettings                     |
| BackupService           | `/api/backup`           | create, restore                                 |
| AuthService             | `/api/auth`             | login, register, logout, token management       |
| AccessoryCatalogService | `/api/accessorycatalog` | getAll, create, update, delete                  |
| TranslationService      | —                       | DE/TR/EN çeviri yönetimi                        |
| ThemeService            | —                       | Dark/Light tema yönetimi                        |
| NotificationService     | —                       | Toast bildirimleri                              |
| DialogService           | —                       | Onay/cancel dialog'ları                         |

---

## E. Ortak Component'ler

| Component             | Dosya Yolu                           | Açıklama                  |
| --------------------- | ------------------------------------ | ------------------------- |
| SignaturePad          | `components/signature-pad/`          | Canvas-based dijital imza |
| Dialog                | `components/dialog/`                 | Onay/cancel modal         |
| Notification          | `components/notification/`           | Toast mesajları           |
| BikeSelector          | `components/bike-selector/`          | Available bisiklet seçici |
| Pagination            | `components/pagination/`             | Sayfalama                 |
| AddressAutocomplete   | `components/address-autocomplete/`   | Adres otomatik tamamlama  |
| AccessoryAutocomplete | `components/accessory-autocomplete/` | Aksesuvar seçimi          |

---

## F. Konfigürasyon

### appsettings.json

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Data Source=BikeHausFreiburg.db"
  },
  "FileStorage": { "BasePath": "uploads" },
  "Jwt": {
    "Key": "BikeHausFreiburgSuperSecretKey2024!@#$%^&*()",
    "Issuer": "BikeHausFreiburg",
    "Audience": "BikeHausApp"
  }
}
```

### Program.cs Middleware Sırası

1. Swagger (dev only)
2. CORS ("AllowAngular")
3. DefaultFiles + StaticFiles (prod only)
4. Authentication → Authorization
5. MapControllers
6. SPA Fallback → index.html (prod only)

### DI Kayıtları (DependencyInjection.cs)

- DbContext → SQLite
- Generic `IRepository<T>` → `Repository<T>`
- 10 spesifik Repository
- 13 Service
- FileStorageService (custom factory)
- BackupService (custom factory)

---

## G. İş Kuralları

1. **Purchase oluşturulunca** → Bicycle + Customer otomatik oluşur, Bicycle.Status = Available
2. **Sale oluşturulunca** → Bicycle.Status = Sold
3. **Reservation oluşturulunca** → Bicycle.Status = Reserved
4. **Reservation → Sale dönüşümü** → Status = Converted, yeni Sale kaydı
5. **Return oluşturulunca** → Bicycle.Status tekrar Available olur
6. **BelegNummer** → Otomatik üretilir (VK-YYYYMMDD-XXX, EK-YYYYMMDD-XXX vb.)
7. **StokNo** → ShopSettings.FahrradNummerStart'tan otomatik artan numara
8. **Garantie** → Neu = 2 yıl, Gebraucht = 3 ay (varsayılan)
9. **Cascade Delete** → SaleAccessory (Sale silinince), Signature (Purchase silinince)
10. **SetNull** → Document FK'ları, Sale.PurchaseId, Signature FK'ları
