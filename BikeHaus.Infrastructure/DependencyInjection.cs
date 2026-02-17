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
        services.AddScoped<IPdfService, PdfService>();
        services.AddScoped<IFileStorageService>(sp =>
        {
            var basePath = Path.Combine(Directory.GetCurrentDirectory(), "uploads");
            return new FileStorageService(basePath);
        });

        return services;
    }
}
