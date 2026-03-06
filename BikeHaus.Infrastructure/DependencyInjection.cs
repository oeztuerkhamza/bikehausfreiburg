using BikeHaus.Application.Interfaces;
using BikeHaus.Domain.Interfaces;
using BikeHaus.Infrastructure.Data;
using BikeHaus.Infrastructure.Repositories;
using BikeHaus.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace BikeHaus.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        // Database
        services.AddDbContext<BikeHausDbContext>(options =>
            options.UseSqlite(
                configuration.GetConnectionString("DefaultConnection")));

        // Repositories
        services.AddScoped(typeof(IRepository<>), typeof(Repository<>));
        services.AddScoped<IBicycleRepository, BicycleRepository>();
        services.AddScoped<ICustomerRepository, CustomerRepository>();
        services.AddScoped<IPurchaseRepository, PurchaseRepository>();
        services.AddScoped<ISaleRepository, SaleRepository>();
        services.AddScoped<IDocumentRepository, DocumentRepository>();
        services.AddScoped<IReturnRepository, ReturnRepository>();
        services.AddScoped<IShopSettingsRepository, ShopSettingsRepository>();
        services.AddScoped<IAccessoryCatalogRepository, AccessoryCatalogRepository>();
        services.AddScoped<IReservationRepository, ReservationRepository>();
        services.AddScoped<IExpenseRepository, ExpenseRepository>();
        services.AddScoped<IKleinanzeigenListingRepository, KleinanzeigenListingRepository>();
        services.AddScoped<INeueFahrradRepository, NeueFahrradRepository>();
        services.AddScoped<IRepairShowcaseRepository, RepairShowcaseRepository>();
        services.AddScoped<IHomepageAccessoryRepository, HomepageAccessoryRepository>();

        // Services
        services.AddScoped<IBicycleService, BikeHaus.Application.Services.BicycleService>();
        services.AddScoped<ICustomerService, BikeHaus.Application.Services.CustomerService>();
        services.AddScoped<IPurchaseService, BikeHaus.Application.Services.PurchaseService>();
        services.AddScoped<ISaleService, BikeHaus.Application.Services.SaleService>();
        services.AddScoped<IDocumentService, BikeHaus.Application.Services.DocumentService>();
        services.AddScoped<IDashboardService, BikeHaus.Application.Services.DashboardService>();
        services.AddScoped<IStatisticsService, BikeHaus.Application.Services.StatisticsService>();
        services.AddScoped<IReturnService, BikeHaus.Application.Services.ReturnService>();
        services.AddScoped<IShopSettingsService, BikeHaus.Application.Services.ShopSettingsService>();
        services.AddScoped<IAccessoryCatalogService, BikeHaus.Application.Services.AccessoryCatalogService>();
        services.AddScoped<IReservationService, BikeHaus.Application.Services.ReservationService>();
        services.AddScoped<IExpenseService, BikeHaus.Application.Services.ExpenseService>();
        services.AddScoped<IKleinanzeigenService, BikeHaus.Application.Services.KleinanzeigenService>();
        services.AddScoped<INeueFahrradService, BikeHaus.Application.Services.NeueFahrradService>();
        services.AddScoped<IRepairShowcaseService, BikeHaus.Application.Services.RepairShowcaseService>();
        services.AddScoped<IHomepageAccessoryService, BikeHaus.Application.Services.HomepageAccessoryService>();
        services.AddScoped<IInvoiceRepository, BikeHaus.Infrastructure.Repositories.InvoiceRepository>();
        services.AddScoped<IInvoiceService, BikeHaus.Application.Services.InvoiceService>();
        services.AddScoped<IKleinanzeigenScraperService, KleinanzeigenScraperService>();
        services.AddSingleton<KleinanzeigenSyncCoordinator>();
        services.AddScoped<IArchiveService, BikeHaus.Application.Services.ArchiveService>();
        services.AddScoped<IAuthService, BikeHaus.Infrastructure.Services.AuthService>();
        services.AddScoped<IPdfService, PdfService>();
        services.AddScoped<IExportService>(sp =>
        {
            var uploadsPath = configuration["FileStorage:BasePath"]
                ?? Path.Combine(Directory.GetCurrentDirectory(), "uploads");
            if (!Path.IsPathRooted(uploadsPath))
                uploadsPath = Path.Combine(Directory.GetCurrentDirectory(), uploadsPath);
            return new BikeHaus.Application.Services.ExportService(
                sp.GetRequiredService<IPurchaseRepository>(),
                sp.GetRequiredService<ISaleRepository>(),
                sp.GetRequiredService<IReturnRepository>(),
                sp.GetRequiredService<IExpenseRepository>(),
                sp.GetRequiredService<IInvoiceRepository>(),
                sp.GetRequiredService<IPdfService>(),
                uploadsPath);
        });
        services.AddScoped<IFileStorageService>(sp =>
        {
            var basePath = configuration["FileStorage:BasePath"]
                ?? Path.Combine(Directory.GetCurrentDirectory(), "uploads");
            if (!Path.IsPathRooted(basePath))
                basePath = Path.Combine(Directory.GetCurrentDirectory(), basePath);
            return new FileStorageService(basePath);
        });

        services.AddScoped<IBackupService>(sp =>
        {
            var dbContext = sp.GetRequiredService<BikeHausDbContext>();
            var uploadsPath = configuration["FileStorage:BasePath"]
                ?? Path.Combine(Directory.GetCurrentDirectory(), "uploads");
            if (!Path.IsPathRooted(uploadsPath))
                uploadsPath = Path.Combine(Directory.GetCurrentDirectory(), uploadsPath);

            // Extract DB path from connection string
            var connString = configuration.GetConnectionString("DefaultConnection") ?? "";
            var dbPath = connString.Replace("Data Source=", "").Trim();
            if (!Path.IsPathRooted(dbPath))
                dbPath = Path.Combine(Directory.GetCurrentDirectory(), dbPath);

            return new BackupService(dbContext, uploadsPath, dbPath);
        });

        return services;
    }
}
