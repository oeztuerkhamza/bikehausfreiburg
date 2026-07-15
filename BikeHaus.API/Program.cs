using System.Text;
using Mollie.Api.Client;
using Mollie.Api.Client.Abstract;
using BikeHaus.Application.Interfaces;
using BikeHaus.Infrastructure;
using BikeHaus.Infrastructure.Data;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.ResponseCompression;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

// Allow larger multipart uploads (full-resolution phone photos). The client
// downscales images before upload, but this is the safety net so an
// occasional large original isn't hard-rejected. Kept in sync with nginx
// `client_max_body_size 50M`.
const long MaxUploadBytes = 52_428_800; // 50 MB
builder.WebHost.ConfigureKestrel(options =>
    options.Limits.MaxRequestBodySize = MaxUploadBytes);
builder.Services.Configure<Microsoft.AspNetCore.Http.Features.FormOptions>(options =>
{
    options.MultipartBodyLengthLimit = MaxUploadBytes;
});

// Add services to the container.
builder.Services.AddControllers()
    .ConfigureApiBehaviorOptions(options =>
    {
        // Auto model-validation (e.g. [OptionalEmailAddress]) returns a body the
        // Angular forms already understand: { message, errors }. Without this the
        // default ValidationProblemDetails has no "message" field, so the UI would
        // only show a generic fallback instead of the precise reason.
        options.InvalidModelStateResponseFactory = context =>
        {
            var message = context.ModelState.Values
                .SelectMany(v => v.Errors)
                .Select(e => e.ErrorMessage)
                .FirstOrDefault(m => !string.IsNullOrWhiteSpace(m)) ?? "Ungültige Eingabe.";

            var errors = context.ModelState
                .Where(kvp => kvp.Value!.Errors.Count > 0)
                .ToDictionary(
                    kvp => kvp.Key,
                    kvp => kvp.Value!.Errors.Select(e => e.ErrorMessage).ToArray());

            // Expose under both keys: different Angular forms read either
            // err.error.message or err.error.error.
            return new Microsoft.AspNetCore.Mvc.BadRequestObjectResult(new { message, error = message, errors });
        };
    })
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
            policy.WithOrigins("http://localhost:4200", "http://localhost:4300")
                  .AllowAnyHeader()
                  .AllowAnyMethod()
                  .AllowCredentials();
        }
        else
        {
            policy.AllowAnyOrigin()
                  .AllowAnyHeader()
                  .AllowAnyMethod();
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

// Mollie payment
var mollieApiKey = builder.Configuration["Mollie:ApiKey"] ?? "";
builder.Services.AddTransient<IPaymentClient>(_ => new PaymentClient(mollieApiKey));

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

// Automatic Google-review request ~4h after each Sale/Rental
builder.Services.AddHostedService<BikeHaus.Infrastructure.Services.ReviewAutomationBackgroundService>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "Bike Haus Freiburg API v1"));
}

app.UseCors("AllowAngular");

// Global exception guard. Without this an unhandled exception produces an empty
// 500 whose response is missing the CORS headers, so the browser misreports it
// as a generic "blocked by CORS / No Access-Control-Allow-Origin" failure and
// the real cause stays hidden from the frontend. Sitting inside UseCors, the
// CORS OnStarting callback still fires here, so the JSON error keeps its headers.
app.Use(async (context, next) =>
{
    try
    {
        await next();
    }
    catch (Exception ex)
    {
        app.Logger.LogError(ex, "Unhandled exception for {Method} {Path}",
            context.Request.Method, context.Request.Path);

        if (!context.Response.HasStarted)
        {
            context.Response.StatusCode = StatusCodes.Status500InternalServerError;
            context.Response.ContentType = "application/json";
            const string message = "Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es erneut.";
            await context.Response.WriteAsJsonAsync(new { message, error = message });
        }
    }
});

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
