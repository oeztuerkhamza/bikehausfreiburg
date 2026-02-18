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
        // Database - PostgreSQL for production (connection string contains "postgres"), SQLite for development
        var connectionString = configuration.GetConnectionString("DefaultConnection") ?? "";
        var isPostgres = connectionString.Contains("postgres", StringComparison.OrdinalIgnoreCase)
                      || connectionString.Contains("postgresql", StringComparison.OrdinalIgnoreCase);

        services.AddDbContext<BikeHausDbContext>(options =>
        {
            if (isPostgres)
            {
                options.UseNpgsql(connectionString);
            }
            else
            {
                options.UseSqlite(connectionString);
            }
        });

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
        services.AddScoped<IAuthService, BikeHaus.Infrastructure.Services.AuthService>();
        services.AddScoped<IPdfService, PdfService>();

        // File Storage - Supabase Storage for production, local filesystem for development
        var supabaseUrl = configuration["Supabase:Url"];
        var supabaseKey = configuration["Supabase:ServiceKey"];
        var bucketName = configuration["Supabase:BucketName"] ?? "documents";

        if (!string.IsNullOrEmpty(supabaseUrl) && !string.IsNullOrEmpty(supabaseKey))
        {
            services.AddScoped<IFileStorageService>(sp =>
                new SupabaseStorageService(supabaseUrl, supabaseKey, bucketName));
        }
        else
        {
            services.AddScoped<IFileStorageService>(sp =>
            {
                var basePath = Path.Combine(Directory.GetCurrentDirectory(), "uploads");
                return new FileStorageService(basePath);
            });
        }

        return services;
    }
}
