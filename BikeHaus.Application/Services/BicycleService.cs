using BikeHaus.Application.DTOs;
using BikeHaus.Application.Interfaces;
using BikeHaus.Application.Mappings;
using BikeHaus.Domain;
using BikeHaus.Domain.Entities;
using BikeHaus.Domain.Enums;
using BikeHaus.Domain.Interfaces;
using System.Linq.Expressions;

namespace BikeHaus.Application.Services;

public class BicycleService : IBicycleService
{
    private readonly IBicycleRepository _repository;
    private readonly IPurchaseRepository _purchaseRepository;
    private readonly IShopSettingsRepository _settingsRepository;
    private readonly IRentalRepository _rentalRepository;
    private readonly IRentalBookingRepository _bookingRepository;

    public BicycleService(
        IBicycleRepository repository,
        IPurchaseRepository purchaseRepository,
        IShopSettingsRepository settingsRepository,
        IRentalRepository rentalRepository,
        IRentalBookingRepository bookingRepository)
    {
        _repository = repository;
        _purchaseRepository = purchaseRepository;
        _settingsRepository = settingsRepository;
        _rentalRepository = rentalRepository;
        _bookingRepository = bookingRepository;
    }

    private static bool IsAccessoryOnlySystemBike(Domain.Entities.Bicycle bike)
    {
        return bike.Marke == "Zubehör" &&
               bike.Modell == "Direktverkauf" &&
               !string.IsNullOrWhiteSpace(bike.Rahmennummer) &&
               bike.Rahmennummer.StartsWith("ACC-");
    }

    public async Task<IEnumerable<BicycleDto>> GetAllAsync()
    {
        var bicycles = await _repository.FindAsync(b =>
            !(b.Marke == "Zubehör" &&
              b.Modell == "Direktverkauf" &&
              b.Rahmennummer != null &&
              b.Rahmennummer.StartsWith("ACC-")));
        return bicycles.Select(b => b.ToDto());
    }

    public async Task<PaginatedResult<BicycleDto>> GetPaginatedAsync(PaginationParams paginationParams)
    {
        Expression<Func<Domain.Entities.Bicycle, bool>>? predicate = b =>
                !(b.Marke == "Zubehör" &&
                    b.Modell == "Direktverkauf" &&
                    b.Rahmennummer != null &&
                    b.Rahmennummer.StartsWith("ACC-"));

        // Status filter
        if (!string.IsNullOrEmpty(paginationParams.Status) &&
            Enum.TryParse<BikeStatus>(paginationParams.Status, out var status))
        {
            predicate = CombineAnd(predicate, b => b.Status == status);
        }

        // Zustand (condition) filter
        if (!string.IsNullOrEmpty(paginationParams.Zustand) &&
            Enum.TryParse<BikeCondition>(paginationParams.Zustand, out var zustand))
        {
            predicate = CombineAnd(predicate, b => b.Zustand == zustand);
        }

        // Fahrradtyp filter
        if (!string.IsNullOrEmpty(paginationParams.Fahrradtyp))
        {
            var typ = paginationParams.Fahrradtyp;
            predicate = CombineAnd(predicate, b => b.Fahrradtyp != null && b.Fahrradtyp == typ);
        }

        // Reifengroesse filter
        if (!string.IsNullOrEmpty(paginationParams.Reifengroesse))
        {
            var reifen = paginationParams.Reifengroesse;
            predicate = CombineAnd(predicate, b => b.Reifengroesse == reifen);
        }

        // Marke filter
        if (!string.IsNullOrEmpty(paginationParams.Marke))
        {
            var marke = paginationParams.Marke.ToLower();
            predicate = CombineAnd(predicate, b => b.Marke.ToLower() == marke);
        }

        // IsRentable filter
        if (paginationParams.IsRentable.HasValue)
        {
            var rentable = paginationParams.IsRentable.Value;
            predicate = CombineAnd(predicate, b => b.IsRentable == rentable);
        }

        // Search filter
        if (!string.IsNullOrEmpty(paginationParams.SearchTerm))
        {
            var term = paginationParams.SearchTerm.ToLower();
            // Numeric terms also match the Lagernummer (stock number) exactly.
            var isNumeric = int.TryParse(paginationParams.SearchTerm.Trim(), out var lagerNr);
            predicate = CombineAnd(predicate, b =>
                b.Marke.ToLower().Contains(term) ||
                b.Modell.ToLower().Contains(term) ||
                (b.Rahmennummer != null && b.Rahmennummer.ToLower().Contains(term)) ||
                (b.Farbe != null && b.Farbe.ToLower().Contains(term)) ||
                (isNumeric && b.Lagernummer == lagerNr));
        }

        var (items, totalCount) = await _repository.GetPaginatedAsync(
            paginationParams.Page,
            paginationParams.PageSize,
            predicate);

        return new PaginatedResult<BicycleDto>
        {
            Items = items.Select(b => b.ToDto()),
            TotalCount = totalCount,
            Page = paginationParams.Page,
            PageSize = paginationParams.PageSize
        };
    }

    /// <summary>
    /// Combines two Expression predicates with AndAlso, suitable for EF Core translation.
    /// </summary>
    private static Expression<Func<T, bool>> CombineAnd<T>(
        Expression<Func<T, bool>>? left,
        Expression<Func<T, bool>> right)
    {
        if (left == null) return right;

        var param = Expression.Parameter(typeof(T), "x");
        var body = Expression.AndAlso(
            Expression.Invoke(left, param),
            Expression.Invoke(right, param));
        return Expression.Lambda<Func<T, bool>>(body, param);
    }

    public async Task<BicycleDto?> GetByIdAsync(int id)
    {
        var bicycle = await _repository.GetWithDetailsAsync(id);
        return bicycle?.ToDto();
    }

    public async Task<IEnumerable<BicycleDto>> GetAvailableAsync()
    {
        var bicycles = await _repository.GetAvailableBicyclesAsync();
        return bicycles
            .Where(b => !IsAccessoryOnlySystemBike(b))
            .Select(b => b.ToDto());
    }

    public async Task<BicycleDto> CreateAsync(BicycleCreateDto dto)
    {
        var entity = dto.ToEntity();

        // Beim Verkauf angelegte (nicht-verleihbare) Räder: Kollidiert die
        // Rahmennummer mit einem VERLEIH-Rad (gleiche physische Nummer, anderer
        // Zweck), hängen wir "-verkauf" an, damit der eindeutige Index nicht
        // verletzt wird und der Verkauf trotzdem angelegt werden kann.
        if (!entity.IsRentable && !string.IsNullOrWhiteSpace(entity.Rahmennummer))
        {
            var baseNr = entity.Rahmennummer.Trim();
            var existing = await _repository.GetByRahmennummerAsync(baseNr);
            if (existing != null && existing.IsRentable)
            {
                var candidate = $"{baseNr}-verkauf";
                var suffix = 2;
                while (await _repository.GetByRahmennummerAsync(candidate) != null)
                    candidate = $"{baseNr}-verkauf-{suffix++}";
                entity.Rahmennummer = candidate;
            }
        }

        var created = await _repository.AddAsync(entity);
        return created.ToDto();
    }

    public async Task<BicycleDto> UpdateAsync(int id, BicycleUpdateDto dto)
    {
        var entity = await _repository.GetByIdAsync(id)
            ?? throw new KeyNotFoundException($"Bicycle with ID {id} not found.");

        entity.Marke = dto.Marke;
        entity.Modell = dto.Modell;
        entity.Rahmennummer = dto.Rahmennummer;
        // Lagernummer: null = keep current (callers that don't know the field
        // must not wipe it), 0 = clear, value = set.
        if (dto.Lagernummer.HasValue)
            entity.Lagernummer = dto.Lagernummer.Value == 0 ? null : dto.Lagernummer;
        entity.Rahmengroesse = dto.Rahmengroesse;
        entity.Farbe = dto.Farbe;
        entity.Reifengroesse = dto.Reifengroesse;
        entity.Fahrradtyp = dto.Fahrradtyp;
        // Art: null = behalten, "" = leeren. Die Formulare, die Art besitzen,
        // schicken bei leerer Auswahl "" (mietfahrrad-form lädt art ?? ''),
        // Aufrufer ohne Art-Feld schicken den Schlüssel gar nicht erst.
        if (dto.Art != null)
            entity.Art = dto.Art;
        entity.Beschreibung = dto.Beschreibung;
        // null = beibehalten, wie bei den anderen optionalen Feldern.
        if (dto.Gangschaltung != null) entity.Gangschaltung = dto.Gangschaltung;
        entity.Status = dto.Status;
        entity.Zustand = dto.Zustand;
        // Alles ab hier: null = aktuellen Wert behalten, Wert = setzen.
        // Siehe Kommentar bei Kaution weiter unten — dieselbe Begründung gilt
        // für jedes Feld auf diesem Vollersatz-Pfad, das ein Aufrufer nicht
        // selbst bearbeitet. Ohne die Guards löschte z. B. das Umwandeln einer
        // Buchung in einen Mietvertrag die komplette Tagespreis-Staffel und
        // nahm das Rad per IsRentable=false aus der Vermietflotte.
        if (dto.VerkaufspreisVorschlag.HasValue)
            entity.VerkaufspreisVorschlag = dto.VerkaufspreisVorschlag.Value;
        if (dto.IsRentable.HasValue)
            entity.IsRentable = dto.IsRentable.Value;
        if (dto.RentalPriceDay1.HasValue) entity.RentalPriceDay1 = dto.RentalPriceDay1.Value;
        if (dto.RentalPriceDay2.HasValue) entity.RentalPriceDay2 = dto.RentalPriceDay2.Value;
        if (dto.RentalPriceDay3.HasValue) entity.RentalPriceDay3 = dto.RentalPriceDay3.Value;
        if (dto.RentalPriceDay4.HasValue) entity.RentalPriceDay4 = dto.RentalPriceDay4.Value;
        if (dto.RentalPriceDay5.HasValue) entity.RentalPriceDay5 = dto.RentalPriceDay5.Value;
        if (dto.RentalPriceDay6.HasValue) entity.RentalPriceDay6 = dto.RentalPriceDay6.Value;
        if (dto.RentalPriceDay7.HasValue) entity.RentalPriceDay7 = dto.RentalPriceDay7.Value;
        if (dto.RentalPriceAdditionalDayAfter7.HasValue)
            entity.RentalPriceAdditionalDayAfter7 = dto.RentalPriceAdditionalDayAfter7.Value;
        // Mietrad-Angaben: null = behalten, Wert = setzen (gleiche Regel wie bei
        // den Preisfeldern). So kann ein Formular ohne diese Felder sie nicht leeren.
        if (dto.Fahrradnummer != null)
            entity.Fahrradnummer = string.IsNullOrWhiteSpace(dto.Fahrradnummer)
                ? null
                : dto.Fahrradnummer.Trim();
        if (dto.KoerpergroesseVonCm.HasValue)
            entity.KoerpergroesseVonCm = dto.KoerpergroesseVonCm.Value == 0
                ? null
                : dto.KoerpergroesseVonCm;
        if (dto.KoerpergroesseBisCm.HasValue)
            entity.KoerpergroesseBisCm = dto.KoerpergroesseBisCm.Value == 0
                ? null
                : dto.KoerpergroesseBisCm;

        // Kaution wird hier bewusst NICHT angefasst — sie gehört dem Fahrrad und
        // ist nur über SetKautionAsync (Seite „Mietfahrräder") änderbar. Jedes
        // andere Formular, das nebenbei ein Fahrrad speichert (Mietvertrag,
        // Verkauf), kann sie damit weder überschreiben noch leeren.
        entity.UpdatedAt = DateTime.UtcNow;

        await _repository.UpdateAsync(entity);
        return entity.ToDto();
    }

    /// <summary>
    /// Einziger Schreibpfad für die am Fahrrad hinterlegte Kaution (Seite
    /// „Mietfahrräder"). null = keine Kaution hinterlegt.
    /// </summary>
    public async Task<BicycleDto> SetKautionAsync(int id, decimal? kaution)
    {
        if (kaution is < 0)
            throw new InvalidOperationException("Die Kaution darf nicht negativ sein.");

        var entity = await _repository.GetByIdAsync(id)
            ?? throw new KeyNotFoundException($"Fahrrad mit ID {id} nicht gefunden.");

        entity.Kaution = kaution;
        entity.UpdatedAt = DateTime.UtcNow;
        await _repository.UpdateAsync(entity);
        return entity.ToDto();
    }

    public async Task DeleteAsync(int id)
    {
        var bicycle = await _repository.GetWithDetailsAsync(id)
            ?? throw new KeyNotFoundException($"Fahrrad mit ID {id} nicht gefunden.");

        // If bicycle has a sale, it cannot be deleted
        if (bicycle.Sales != null && bicycle.Sales.Any())
        {
            throw new InvalidOperationException(
                "Fahrrad kann nicht gelöscht werden. Es gibt einen verknüpften Verkauf. " +
                "Bitte löschen Sie zuerst den Verkauf.");
        }

        // If bicycle has a purchase but no sale, delete the purchase first
        if (bicycle.Purchase != null)
        {
            await _purchaseRepository.DeleteAsync(bicycle.Purchase.Id);
        }

        await _repository.DeleteAsync(id);
    }

    public async Task<IEnumerable<BicycleDto>> SearchAsync(string searchTerm)
    {
        var lowerTerm = searchTerm.ToLower();
        var isNumeric = int.TryParse(searchTerm.Trim(), out var lagerNr);
        var bicycles = await _repository.FindAsync(b =>
                        !(b.Marke == "Zubehör" &&
                            b.Modell == "Direktverkauf" &&
                            b.Rahmennummer != null &&
                            b.Rahmennummer.StartsWith("ACC-")) &&
            b.Status != BikeStatus.Sold && (
            b.Marke.Contains(searchTerm) ||
            b.Modell.Contains(searchTerm) ||
            (b.Rahmennummer != null && b.Rahmennummer.ToLower().Contains(lowerTerm)) ||
            (b.Farbe != null && b.Farbe.Contains(searchTerm)) ||
            (isNumeric && b.Lagernummer == lagerNr)));
        return bicycles.Select(b => b.ToDto());
    }

    public async Task<IEnumerable<string>> GetUniqueBrandsAsync()
    {
        return await _repository.GetUniqueBrandsAsync();
    }

    public async Task<IEnumerable<string>> GetDuplicateRahmennummernAsync()
    {
        return await _repository.GetDuplicateRahmennummernAsync();
    }

    public async Task<IEnumerable<string>> GetUniqueModelsAsync(string? brand = null)
    {
        return await _repository.GetUniqueModelsAsync(brand);
    }

    public async Task<BicycleDto> TogglePublishOnWebsiteAsync(int id)
    {
        var entity = await _repository.GetWithImagesAsync(id)
            ?? throw new KeyNotFoundException($"Bicycle with ID {id} not found.");
        entity.IsPublishedOnWebsite = !entity.IsPublishedOnWebsite;
        entity.UpdatedAt = DateTime.UtcNow;
        await _repository.UpdateAsync(entity);
        return entity.ToDto();
    }

    public async Task<BicycleDto> TogglePublishOnKleinanzeigenAsync(int id)
    {
        var entity = await _repository.GetWithImagesAsync(id)
            ?? throw new KeyNotFoundException($"Bicycle with ID {id} not found.");
        entity.IsPublishedOnKleinanzeigen = !entity.IsPublishedOnKleinanzeigen;
        entity.UpdatedAt = DateTime.UtcNow;
        await _repository.UpdateAsync(entity);
        return entity.ToDto();
    }

    public async Task<BicycleDto> SetKleinanzeigenAnzeigeNrAsync(int id, string anzeigeNr)
    {
        var entity = await _repository.GetWithImagesAsync(id)
            ?? throw new KeyNotFoundException($"Bicycle with ID {id} not found.");
        entity.KleinanzeigenAnzeigeNr = anzeigeNr;
        entity.UpdatedAt = DateTime.UtcNow;
        await _repository.UpdateAsync(entity);
        return entity.ToDto();
    }

    public async Task<IEnumerable<PublicBicycleDto>> GetPublishedOnWebsiteAsync()
    {
        var bicycles = await _repository.GetPublishedOnWebsiteAsync();
        return bicycles.Select(b => b.ToPublicDto());
    }

    public async Task<PublicBicycleDto?> GetPublishedBicycleByIdAsync(int id)
    {
        var bicycle = await _repository.GetWithImagesAsync(id);
        if (bicycle == null || !bicycle.IsPublishedOnWebsite) return null;
        return bicycle.ToPublicDto();
    }

    public async Task<IEnumerable<PublicRentalBicycleDto>> GetRentableBicyclesAsync()
    {
        var bicycles = await _repository.GetRentableBicyclesAsync();
        return bicycles.Select(b => b.ToPublicRentalDto());
    }

    public async Task<PublicRentalBicycleDto?> GetRentableBicycleByIdAsync(int id)
    {
        var bicycle = await _repository.GetRentableBicycleByIdAsync(id);
        return bicycle?.ToPublicRentalDto();
    }

    public async Task<BicycleImageDto> AddImageAsync(int bicycleId, string filePath, int sortOrder)
    {
        var bicycle = await _repository.GetByIdAsync(bicycleId)
            ?? throw new KeyNotFoundException($"Bicycle with ID {bicycleId} not found.");

        var image = new BicycleImage
        {
            BicycleId = bicycleId,
            FilePath = filePath,
            SortOrder = sortOrder
        };

        bicycle.Images ??= new List<BicycleImage>();
        bicycle.Images.Add(image);
        await _repository.UpdateAsync(bicycle);

        return image.ToDto();
    }

    public async Task DeleteImageAsync(int bicycleId, int imageId)
    {
        var bicycle = await _repository.GetWithImagesAsync(bicycleId)
            ?? throw new KeyNotFoundException($"Bicycle with ID {bicycleId} not found.");

        var image = bicycle.Images?.FirstOrDefault(i => i.Id == imageId)
            ?? throw new KeyNotFoundException($"Image with ID {imageId} not found.");

        bicycle.Images!.Remove(image);
        await _repository.UpdateAsync(bicycle);
    }

    public async Task<IEnumerable<BicycleImageDto>> GetImagesAsync(int bicycleId)
    {
        var bicycle = await _repository.GetWithImagesAsync(bicycleId)
            ?? throw new KeyNotFoundException($"Bicycle with ID {bicycleId} not found.");

        return bicycle.Images?.OrderBy(i => i.SortOrder).Select(i => i.ToDto())
            ?? Enumerable.Empty<BicycleImageDto>();
    }

    public async Task<IEnumerable<BicycleImageDto>> ReorderImagesAsync(int bicycleId, IList<int> orderedImageIds)
    {
        var bicycle = await _repository.GetWithImagesAsync(bicycleId)
            ?? throw new KeyNotFoundException($"Bicycle with ID {bicycleId} not found.");

        var images = bicycle.Images ?? new List<BicycleImage>();

        // Assign sort order following the requested sequence; any image not
        // listed keeps a stable order after the explicitly ordered ones.
        var position = 0;
        foreach (var imageId in orderedImageIds)
        {
            var image = images.FirstOrDefault(i => i.Id == imageId);
            if (image != null)
                image.SortOrder = position++;
        }
        foreach (var image in images.Where(i => !orderedImageIds.Contains(i.Id)).OrderBy(i => i.SortOrder))
            image.SortOrder = position++;

        await _repository.UpdateAsync(bicycle);

        return images.OrderBy(i => i.SortOrder).Select(i => i.ToDto());
    }

    public async Task<int> GetNextLagernummerAsync()
    {
        var max = await _repository.GetMaxLagernummerAsync();
        return (max ?? 0) + 1;
    }

    public async Task<IEnumerable<BicycleDto>> GetAvailableForPeriodAsync(DateOnly start, DateOnly end)
    {
        var rentalBusyIds = await _rentalRepository.GetBusyBicycleIdsForPeriodAsync(start, end);
        var bookingBusyIds = await _bookingRepository.GetBusyBicycleIdsForPeriodAsync(start, end);
        var allBusyIds = new HashSet<int>(rentalBusyIds.Concat(bookingBusyIds));

        // GetRentableBicyclesAsync lädt die Bilder mit (Include). Die Fahrradauswahl
        // im Mietvertragsformular zeigt ein Vorschaubild je Rad — ohne die Bilder
        // hier müsste sie jedes Rad einzeln nachladen.
        var bikes = await _repository.GetRentableBicyclesAsync();

        // Children's bikes are generic/pooled listings — they stay available even
        // when an overlapping rental/booking exists; the physical bike is assigned
        // manually in the shop. So they are never filtered out as "busy".
        return bikes
            .Where(b => !(b.Marke == "Zubehör" && b.Modell == "Direktverkauf" && b.Rahmennummer != null && b.Rahmennummer.StartsWith("ACC-")))
            .Where(b => BicycleCategory.IsChildrens(b.Art, b.Fahrradtyp) || !allBusyIds.Contains(b.Id))
            .OrderByDescending(b => BicycleNaming.IsEbike(b.Fahrradtyp))
            .ThenBy(b => BicycleNaming.SortKey(b.Marke), BicycleNaming.NameComparer)
            .ThenBy(b => b.Modell, BicycleNaming.NameComparer)
            .Select(b => b.ToDto());
    }

    public async Task<IEnumerable<BusyPeriodDto>> GetBusyPeriodsAsync(int bicycleId)
    {
        var result = new List<BusyPeriodDto>();

        // Children's bikes are generic/pooled listings — several interchangeable
        // physical bikes behind one ad — so they are never "busy": the concrete bike
        // is assigned in the shop. Report no busy periods so calendars stay open.
        var bicycle = await _repository.GetByIdAsync(bicycleId);
        if (bicycle != null && BicycleCategory.IsChildrens(bicycle.Art, bicycle.Fahrradtyp))
            return result;

        // Active rentals (Mietvertrag) — include only the bike line matching this bicycle
        var allRentals = await _rentalRepository.GetAllAsync();
        foreach (var rental in allRentals.Where(r => r.Status == RentalStatus.Active))
        {
            foreach (var rentalBike in rental.Bikes.Where(rb => rb.BicycleId == bicycleId))
            {
                result.Add(new BusyPeriodDto(rentalBike.StartDatum.Date, rentalBike.EndDatum.Date, "rental", rental.Id));
            }
        }

        // Approved bookings (Mietanfragen)
        var approvedBookings = await _bookingRepository.GetApprovedByBicycleIdAsync(bicycleId);
        result.AddRange(approvedBookings.Select(b =>
        {
            var bk = b.Bikes.FirstOrDefault(bk => bk.BicycleId == bicycleId);
            return new BusyPeriodDto(
                (bk?.StartDatum ?? b.StartDatum).Date,
                (bk?.EndDatum ?? b.EndDatum).Date,
                "booking",
                b.Id);
        }));

        // Pending booking requests (not processed yet)
        var pendingBookings = await _bookingRepository.GetPendingByBicycleIdAsync(bicycleId);
        result.AddRange(pendingBookings.Select(b =>
        {
            var bk = b.Bikes.FirstOrDefault(bk => bk.BicycleId == bicycleId);
            return new BusyPeriodDto(
                (bk?.StartDatum ?? b.StartDatum).Date,
                (bk?.EndDatum ?? b.EndDatum).Date,
                "pending",
                b.Id);
        }));

        return result;
    }

    /// <summary>
    /// Batch variant of <see cref="GetBusyPeriodsAsync"/>: computes busy periods for
    /// many bikes in a fixed number of queries (instead of one round-trip per bike),
    /// returning a map keyed by bicycle id. Used by the booking calendar.
    /// </summary>
    public async Task<Dictionary<int, List<BusyPeriodDto>>> GetBusyPeriodsForBikesAsync(IEnumerable<int> bicycleIds)
    {
        var result = bicycleIds.Distinct().ToDictionary(id => id, _ => new List<BusyPeriodDto>());

        void Add(int bikeId, DateTime start, DateTime end, string type, int referenceId)
        {
            if (result.TryGetValue(bikeId, out var list))
                list.Add(new BusyPeriodDto(start.Date, end.Date, type, referenceId));
        }

        // Active rentals (Mietvertrag) — loaded once for all bikes
        var allRentals = await _rentalRepository.GetAllAsync();
        foreach (var rental in allRentals.Where(r => r.Status == RentalStatus.Active))
            foreach (var rentalBike in rental.Bikes)
                Add(rentalBike.BicycleId, rentalBike.StartDatum, rentalBike.EndDatum, "rental", rental.Id);

        // Bookings (approved + pending) — loaded once for all bikes
        var bookings = await _bookingRepository.GetByStatusesWithBikesAsync(
            new[] { RentalBookingStatus.Approved, RentalBookingStatus.Pending });
        foreach (var booking in bookings)
        {
            var type = booking.Status == RentalBookingStatus.Approved ? "booking" : "pending";
            if (booking.Bikes.Any())
            {
                foreach (var bk in booking.Bikes)
                    Add(bk.BicycleId, bk.StartDatum, bk.EndDatum, type, booking.Id);
            }
            else
            {
                // Legacy single-bike booking (no Bikes entries)
                Add(booking.BicycleId, booking.StartDatum, booking.EndDatum, type, booking.Id);
            }
        }

        return result;
    }
}
