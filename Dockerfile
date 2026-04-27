# =============================================
# Stage 1a: Frontend Dependencies
# =============================================
FROM node:20-alpine AS frontend-deps
WORKDIR /app/client
COPY BikeHaus.Client/package*.json ./
RUN npm ci --prefer-offline --no-audit

# =============================================
# Stage 1b: Build Angular Frontend
# =============================================
FROM frontend-deps AS frontend-build
COPY BikeHaus.Client/ ./
RUN npm run build -- --configuration production

# =============================================
# Stage 2a: .NET Dependencies
# =============================================
FROM mcr.microsoft.com/dotnet/sdk:9.0-alpine AS dotnet-deps
WORKDIR /src
COPY BikeHausFreiburg.sln ./
COPY BikeHaus.API/BikeHaus.API.csproj BikeHaus.API/
COPY BikeHaus.Application/BikeHaus.Application.csproj BikeHaus.Application/
COPY BikeHaus.Domain/BikeHaus.Domain.csproj BikeHaus.Domain/
COPY BikeHaus.Infrastructure/BikeHaus.Infrastructure.csproj BikeHaus.Infrastructure/
RUN dotnet restore

# =============================================
# Stage 2b: Build .NET API
# =============================================
FROM dotnet-deps AS api-build
COPY . .
RUN dotnet publish BikeHaus.API/BikeHaus.API.csproj -c Release -o /app/publish --no-restore

# =============================================
# Stage 2c: Playwright Browsers (Slim)
# =============================================
FROM api-build AS playwright-setup
ENV PLAYWRIGHT_BROWSERS_PATH=/app/pw-browsers
RUN pwsh /app/publish/playwright.ps1 install chromium --with-deps

# =============================================
# Stage 3: Final Runtime Image
# =============================================
FROM mcr.microsoft.com/dotnet/aspnet:9.0-alpine AS runtime
WORKDIR /app

# Install only minimal runtime dependencies for Playwright + curl
RUN apk add --no-cache \
    curl \
    libunwind \
    icu-libs \
    libstdc++ \
    libnss \
    nspr \
    atk \
    dbus-libs \
    libxkbcommon \
    libxcomposite \
    libxdamage \
    libxfixes \
    libxrandr \
    libgbm \
    pango \
    cairo \
    alsa-lib \
    mesa-gbm

# Copy published API
COPY --from=playwright-setup /app/publish .

# Copy Playwright browsers from setup stage
ENV PLAYWRIGHT_BROWSERS_PATH=/app/.playwright
COPY --from=playwright-setup /app/pw-browsers /app/.playwright

# Copy Angular build output to wwwroot (admin panel)
COPY --from=frontend-build /app/client/dist/bike-haus.client/browser ./wwwroot

# Create data directory for SQLite and uploads
RUN mkdir -p /app/data/uploads

# Set environment
ENV ASPNETCORE_ENVIRONMENT=Production
ENV ASPNETCORE_URLS=http://+:5000

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD curl -f http://localhost:5000/api/settings || exit 1

ENTRYPOINT ["dotnet", "BikeHaus.API.dll"]
