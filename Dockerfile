# syntax=docker/dockerfile:1.7
# =============================================
# Stage 1: Playwright Chromium — pulled from the official Playwright image.
# No download at build time; Docker layer cache handles re-use automatically.
# =============================================
FROM mcr.microsoft.com/playwright/dotnet:v1.49.0-noble AS playwright-cache

# =============================================
# Stage 2: Build .NET API
# =============================================
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS api-build
WORKDIR /src

# Copy solution and project files first (for better caching)
COPY BikeHausFreiburg.sln ./
COPY BikeHaus.API/BikeHaus.API.csproj BikeHaus.API/
COPY BikeHaus.Application/BikeHaus.Application.csproj BikeHaus.Application/
COPY BikeHaus.Domain/BikeHaus.Domain.csproj BikeHaus.Domain/
COPY BikeHaus.Infrastructure/BikeHaus.Infrastructure.csproj BikeHaus.Infrastructure/

# Cache NuGet packages — only re-downloads if csproj files changed
RUN --mount=type=cache,target=/root/.nuget/packages \
    dotnet restore BikeHaus.API/BikeHaus.API.csproj -r linux-x64

# Copy backend source only (Client lives in its own image)
COPY BikeHaus.API/ BikeHaus.API/
COPY BikeHaus.Application/ BikeHaus.Application/
COPY BikeHaus.Domain/ BikeHaus.Domain/
COPY BikeHaus.Infrastructure/ BikeHaus.Infrastructure/

RUN --mount=type=cache,target=/root/.nuget/packages \
    dotnet publish BikeHaus.API/BikeHaus.API.csproj \
        -c Release -r linux-x64 --no-self-contained \
        -o /app/publish --no-restore

# =============================================
# Stage 3: Final Runtime Image
# =============================================
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app

# Install curl for health checks + Playwright/Chromium dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    libnss3 \
    libnspr4 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libdbus-1-3 \
    libxkbcommon0 \
    libatspi2.0-0 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxrandr2 \
    libgbm1 \
    libpango-1.0-0 \
    libcairo2 \
    libasound2 \
    libwayland-client0 \
    fonts-liberation \
    xdg-utils \
    wget \
    && rm -rf /var/lib/apt/lists/*

# Copy Playwright browsers from the official Playwright image
ENV PLAYWRIGHT_BROWSERS_PATH=/app/.playwright
COPY --from=playwright-cache /ms-playwright /app/.playwright

# Copy published API
COPY --from=api-build /app/publish .

# Create data directory for SQLite and uploads
RUN mkdir -p /app/data/uploads

# Set environment
ENV ASPNETCORE_ENVIRONMENT=Production
ENV ASPNETCORE_URLS=http://+:5000

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD curl -f http://localhost:5000/api/settings || exit 1

ENTRYPOINT ["dotnet", "BikeHaus.API.dll"]
