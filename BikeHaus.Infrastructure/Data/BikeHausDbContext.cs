using BikeHaus.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace BikeHaus.Infrastructure.Data;

public class BikeHausDbContext : DbContext
{
    public BikeHausDbContext(DbContextOptions<BikeHausDbContext> options) : base(options) { }

    public DbSet<Bicycle> Bicycles => Set<Bicycle>();
    public DbSet<Customer> Customers => Set<Customer>();
    public DbSet<Purchase> Purchases => Set<Purchase>();
    public DbSet<Sale> Sales => Set<Sale>();
    public DbSet<SaleAccessory> SaleAccessories => Set<SaleAccessory>();
    public DbSet<Return> Returns => Set<Return>();
    public DbSet<Document> Documents => Set<Document>();
    public DbSet<Signature> Signatures => Set<Signature>();
    public DbSet<ShopSettings> ShopSettings => Set<ShopSettings>();
    public DbSet<AccessoryCatalog> AccessoryCatalog => Set<AccessoryCatalog>();
    public DbSet<Reservation> Reservations => Set<Reservation>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // ── Bicycle Configuration ──
        modelBuilder.Entity<Bicycle>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Marke).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Modell).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Rahmennummer).IsRequired().HasMaxLength(50);
            entity.Property(e => e.Farbe).IsRequired().HasMaxLength(50);
            entity.Property(e => e.Reifengroesse).IsRequired().HasMaxLength(20);
            entity.Property(e => e.Beschreibung).HasMaxLength(500);
            entity.HasIndex(e => e.Rahmennummer);
        });

        // ── Customer Configuration ──
        modelBuilder.Entity<Customer>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Vorname).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Nachname).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Strasse).HasMaxLength(200);
            entity.Property(e => e.Hausnummer).HasMaxLength(10);
            entity.Property(e => e.PLZ).HasMaxLength(10);
            entity.Property(e => e.Stadt).HasMaxLength(100);
            entity.Property(e => e.Telefon).HasMaxLength(20);
            entity.Property(e => e.Email).HasMaxLength(200);
            entity.Ignore(e => e.FullName);
            entity.Ignore(e => e.FullAddress);
        });

        // ── Purchase Configuration ──
        modelBuilder.Entity<Purchase>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Preis).HasColumnType("decimal(18,2)");
            entity.Property(e => e.BelegNummer).IsRequired().HasMaxLength(20);
            entity.Property(e => e.Notizen).HasMaxLength(1000);

            entity.HasOne(e => e.Bicycle)
                .WithOne(b => b.Purchase)
                .HasForeignKey<Purchase>(e => e.BicycleId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Seller)
                .WithMany(c => c.Purchases)
                .HasForeignKey(e => e.SellerId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Signature)
                .WithOne(s => s.Purchase)
                .HasForeignKey<Signature>(s => s.PurchaseId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(e => e.BelegNummer).IsUnique();
        });

        // ── Sale Configuration ──
        modelBuilder.Entity<Sale>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Preis).HasColumnType("decimal(18,2)");
            entity.Property(e => e.BelegNummer).IsRequired().HasMaxLength(20);
            entity.Property(e => e.GarantieBedingungen).HasMaxLength(2000);
            entity.Property(e => e.Notizen).HasMaxLength(1000);

            entity.HasOne(e => e.Bicycle)
                .WithOne(b => b.Sale)
                .HasForeignKey<Sale>(e => e.BicycleId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Buyer)
                .WithMany(c => c.Sales)
                .HasForeignKey(e => e.BuyerId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Purchase)
                .WithOne(p => p.Sale)
                .HasForeignKey<Sale>(e => e.PurchaseId)
                .OnDelete(DeleteBehavior.SetNull);

            entity.HasOne(e => e.BuyerSignature)
                .WithOne()
                .HasForeignKey<Sale>(e => e.BuyerSignatureId)
                .OnDelete(DeleteBehavior.SetNull);

            entity.HasOne(e => e.SellerSignature)
                .WithOne()
                .HasForeignKey<Sale>(e => e.SellerSignatureId)
                .OnDelete(DeleteBehavior.SetNull);

            entity.HasIndex(e => e.BelegNummer).IsUnique();

            entity.Ignore(e => e.Gesamtbetrag); // Computed property
        });

        // ── SaleAccessory Configuration ──
        modelBuilder.Entity<SaleAccessory>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Bezeichnung).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Preis).HasColumnType("decimal(18,2)");
            entity.Property(e => e.Menge).IsRequired();

            entity.HasOne(e => e.Sale)
                .WithMany(s => s.Accessories)
                .HasForeignKey(e => e.SaleId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.Ignore(e => e.Gesamtpreis); // Computed property
        });

        // ── Signature Configuration ──
        modelBuilder.Entity<Signature>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.SignerName).IsRequired().HasMaxLength(200);
        });

        // ── Return Configuration ──
        modelBuilder.Entity<Return>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Erstattungsbetrag).HasColumnType("decimal(18,2)");
            entity.Property(e => e.BelegNummer).IsRequired().HasMaxLength(20);
            entity.Property(e => e.GrundDetails).HasMaxLength(1000);
            entity.Property(e => e.Notizen).HasMaxLength(1000);

            entity.HasOne(e => e.Sale)
                .WithMany()
                .HasForeignKey(e => e.SaleId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Bicycle)
                .WithMany()
                .HasForeignKey(e => e.BicycleId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Customer)
                .WithMany(c => c.Returns)
                .HasForeignKey(e => e.CustomerId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.CustomerSignature)
                .WithOne()
                .HasForeignKey<Return>(e => e.CustomerSignatureId)
                .OnDelete(DeleteBehavior.SetNull);

            entity.HasOne(e => e.ShopSignature)
                .WithOne()
                .HasForeignKey<Return>(e => e.ShopSignatureId)
                .OnDelete(DeleteBehavior.SetNull);

            entity.HasIndex(e => e.BelegNummer).IsUnique();
        });

        // ── Document Configuration ──
        modelBuilder.Entity<Document>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.FileName).IsRequired().HasMaxLength(255);
            entity.Property(e => e.FilePath).IsRequired().HasMaxLength(500);
            entity.Property(e => e.ContentType).IsRequired().HasMaxLength(100);

            entity.HasOne(e => e.Bicycle)
                .WithMany(b => b.Documents)
                .HasForeignKey(e => e.BicycleId)
                .OnDelete(DeleteBehavior.SetNull);

            entity.HasOne(e => e.Purchase)
                .WithMany(p => p.Documents)
                .HasForeignKey(e => e.PurchaseId)
                .OnDelete(DeleteBehavior.SetNull);

            entity.HasOne(e => e.Sale)
                .WithMany(s => s.Documents)
                .HasForeignKey(e => e.SaleId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        // ── ShopSettings Configuration ──
        modelBuilder.Entity<ShopSettings>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.ShopName).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Strasse).HasMaxLength(200);
            entity.Property(e => e.Hausnummer).HasMaxLength(10);
            entity.Property(e => e.PLZ).HasMaxLength(10);
            entity.Property(e => e.Stadt).HasMaxLength(100);
            entity.Property(e => e.Telefon).HasMaxLength(30);
            entity.Property(e => e.Email).HasMaxLength(200);
            entity.Property(e => e.Website).HasMaxLength(200);
            entity.Property(e => e.Steuernummer).HasMaxLength(50);
            entity.Property(e => e.UstIdNr).HasMaxLength(50);
            entity.Property(e => e.Bankname).HasMaxLength(100);
            entity.Property(e => e.IBAN).HasMaxLength(34);
            entity.Property(e => e.BIC).HasMaxLength(11);
            entity.Property(e => e.Oeffnungszeiten).HasMaxLength(500);
            entity.Property(e => e.Zusatzinfo).HasMaxLength(1000);
            entity.Ignore(e => e.FullAddress);
        });

        // ── Reservation Configuration ──
        modelBuilder.Entity<Reservation>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.ReservierungsNummer).IsRequired().HasMaxLength(20);
            entity.Property(e => e.Anzahlung).HasColumnType("decimal(18,2)");
            entity.Property(e => e.Notizen).HasMaxLength(1000);

            entity.HasOne(e => e.Bicycle)
                .WithOne(b => b.Reservation)
                .HasForeignKey<Reservation>(e => e.BicycleId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Customer)
                .WithMany(c => c.Reservations)
                .HasForeignKey(e => e.CustomerId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Sale)
                .WithOne()
                .HasForeignKey<Reservation>(e => e.SaleId)
                .OnDelete(DeleteBehavior.SetNull);

            entity.HasIndex(e => e.ReservierungsNummer).IsUnique();
        });
    }
}
