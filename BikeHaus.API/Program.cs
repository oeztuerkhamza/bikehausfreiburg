using System;
using System.Text;
using BikeHaus.Application.Interfaces;
using BikeHaus.Infrastructure;
using BikeHaus.Infrastructure.Data;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.ResponseCompression;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
        options.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
    });

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "Bike Haus Freiburg API", Version = "v1" });
});

// CORS for Angular
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngular", policy =>
    {
        if (builder.Environment.IsDevelopment())
        {
            // Allow any localhost origin (any port) during development
            policy.SetIsOriginAllowed(origin =>
            {
                try
                {
                    var host = new Uri(origin).Host;
                    return host == "localhost" || host == "127.0.0.1" || host == "::1";
                }
                catch
                {
                    return false;
                }
            })
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
        }
        else
        {
            // Production: restrict to configured origins
            var allowedOrigins = builder.Configuration.GetSection("AllowedOrigins").Get<string[]>()
                ?? new[] { "https://bikehausfreiburg.com", "https://www.bikehausfreiburg.com" };

            policy.WithOrigins(allowedOrigins)
                  .WithMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                  .WithHeaders("Content-Type", "Authorization", "X-XSRF-TOKEN", "Idempotency-Key")
                  .AllowCredentials();
        }
    });
});

// JWT Authentication
var jwtKey = builder.Configuration["Jwt:Key"] ?? throw new InvalidOperationException("Jwt:Key must be configured");
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"] ?? "BikeHausFreiburg",
            ValidAudience = builder.Configuration["Jwt:Audience"] ?? "BikeHausApp",
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
        };
    });
builder.Services.AddAuthorization();

// Infrastructure DI
builder.Services.AddInfrastructure(builder.Configuration);

// 💳 PAYMENT SERVICES CONFIGURATION
// Register all payment-related services
builder.Services.AddScoped<IPaymentService, BikeHaus.Infrastructure.Services.MolliePaymentService>();
builder.Services.AddScoped<IPricingService, BikeHaus.Infrastructure.Services.PricingService>();
builder.Services.AddScoped<IPaymentAuditLogger, BikeHaus.Infrastructure.Services.PaymentAuditLogger>();
builder.Services.AddScoped<IWebhookValidator, BikeHaus.Infrastructure.Services.WebhookValidator>();
builder.Services.AddScoped<IIdempotencyService, BikeHaus.Infrastructure.Services.IdempotencyService>();
builder.Services.AddScoped<IMolliePaymentClient, BikeHaus.Infrastructure.Services.MolliePaymentClient>();
builder.Services.AddScoped<ICsrfTokenService, BikeHaus.Infrastructure.Services.CsrfTokenService>();

// HttpClient for Mollie API
builder.Services.AddHttpClient<BikeHaus.Infrastructure.Services.MolliePaymentClient>();
builder.Services.AddHttpClient("MollieApi");
builder.Services.AddScoped<Mollie.Api.Client.Abstract.IPaymentClient>(sp =>
{
    var apiKey = builder.Configuration["Mollie:ApiKey"]
        ?? throw new InvalidOperationException("Mollie:ApiKey must be configured");
    var httpClient = sp.GetRequiredService<IHttpClientFactory>().CreateClient("MollieApi");
    return new Mollie.Api.Client.PaymentClient(apiKey, httpClient);
});

// FluentValidation for payment DTOs
builder.Services.AddScoped<FluentValidation.IValidator<BikeHaus.Application.DTOs.CreatePaymentRequest>,
    BikeHaus.Application.Validators.CreatePaymentRequestValidator>();
builder.Services.AddScoped<FluentValidation.IValidator<BikeHaus.Application.DTOs.RefundRequest>,
    BikeHaus.Application.Validators.RefundRequestValidator>();

// Payment Security Filters
builder.Services.AddScoped<BikeHaus.API.Filters.IdempotencyFilter>();
builder.Services.AddScoped<BikeHaus.API.Filters.PaymentRateLimitFilter>();
builder.Services.AddScoped<BikeHaus.API.Filters.PaymentAdminAuthorizationFilter>();

// Anti-forgery (CSRF) token protection
builder.Services.AddAntiforgery(options =>
{
    options.HeaderName = "X-XSRF-TOKEN";
    options.Cookie.SecurePolicy = Microsoft.AspNetCore.Http.CookieSecurePolicy.Always;
    options.Cookie.SameSite = Microsoft.AspNetCore.Http.SameSiteMode.Strict;
    options.Cookie.HttpOnly = true;
});

// Response Compression (Brotli + Gzip for API responses)
builder.Services.AddResponseCompression(options =>
{
    options.EnableForHttps = true;
    options.Providers.Add<BrotliCompressionProvider>();
    options.Providers.Add<GzipCompressionProvider>();
    options.MimeTypes = ResponseCompressionDefaults.MimeTypes.Concat(
        new[] { "application/json", "application/xml", "text/xml" });
});
builder.Services.Configure<BrotliCompressionProviderOptions>(options =>
{
    options.Level = System.IO.Compression.CompressionLevel.Fastest;
});

// Kleinanzeigen background sync service (runs every 4 hours)
builder.Services.AddHostedService<BikeHaus.Infrastructure.Services.KleinanzeigenSyncBackgroundService>();

var app = builder.Build();

// Configure the HTTP request pipeline.

// 🔒 SECURITY HEADERS (PCI DSS & OWASP Compliance)
app.Use(async (context, next) =>
{
    // HSTS (HTTP Strict Transport Security)
    context.Response.Headers.Append("Strict-Transport-Security",
        "max-age=31536000; includeSubDomains; preload");

    // CSP (Content Security Policy) — prevent XSS
    context.Response.Headers.Append("Content-Security-Policy",
        "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
        "style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; " +
        "font-src 'self' data:; connect-src 'self' https://www.mollie.com; " +
        "frame-ancestors 'none'; base-uri 'self';");

    // X-Content-Type-Options — prevent MIME sniffing
    context.Response.Headers.Append("X-Content-Type-Options", "nosniff");

    // X-Frame-Options — prevent clickjacking
    context.Response.Headers.Append("X-Frame-Options", "DENY");

    // X-XSS-Protection — legacy XSS protection
    context.Response.Headers.Append("X-XSS-Protection", "1; mode=block");

    // Referrer-Policy
    context.Response.Headers.Append("Referrer-Policy", "strict-origin-when-cross-origin");

    // Permissions-Policy (feature policy)
    context.Response.Headers.Append("Permissions-Policy",
        "geolocation=(), microphone=(), camera=(), payment=()");

    // Remove server header
    context.Response.Headers.Remove("Server");
    context.Response.Headers.Remove("X-Powered-By");

    await next();
});

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "Bike Haus Freiburg API v1"));
}
else
{
    // Production: only allow HTTPS
    app.UseHttpsRedirection();
}

// CORS — restrictive policy
app.UseCors("AllowAngular");
app.UseResponseCompression();

// Ensure uploads directory exists
var uploadsPath = app.Environment.IsDevelopment()
    ? Path.Combine(app.Environment.ContentRootPath, "uploads")
    : (builder.Configuration["FileStorage:BasePath"] ?? "/app/data/uploads");
if (!Directory.Exists(uploadsPath))
    Directory.CreateDirectory(uploadsPath);

// In production, serve Angular SPA from wwwroot
if (!app.Environment.IsDevelopment())
{
    app.UseDefaultFiles();
    app.UseStaticFiles();
}

// Serve uploads folder as static files (for images)
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new Microsoft.Extensions.FileProviders.PhysicalFileProvider(uploadsPath),
    RequestPath = "/uploads"
});

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// SPA fallback: serve index.html for non-API routes in production
if (!app.Environment.IsDevelopment())
{
    app.MapFallbackToFile("index.html");
}

// Auto-migrate database and seed default user
{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<BikeHausDbContext>();
    db.Database.Migrate();

    var authService = scope.ServiceProvider.GetRequiredService<IAuthService>();
    await authService.SeedDefaultUserAsync();
}

await app.RunAsync();
