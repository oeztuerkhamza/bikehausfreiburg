# =============================================
# Stage 1: Build Angular Frontend
# =============================================
FROM node:20-alpine AS frontend-build
WORKDIR /app/client

COPY BikeHaus.Client/package*.json ./
RUN npm ci

COPY BikeHaus.Client/ ./
RUN npm run build -- --configuration production

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

RUN dotnet restore

# Copy all source code and publish
COPY . .
RUN dotnet publish BikeHaus.API/BikeHaus.API.csproj -c Release -o /app/publish --no-restore

# =============================================
# Stage 3: Final Runtime Image
# =============================================
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app

# Install curl for health checks
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Copy published API
COPY --from=api-build /app/publish .

# Copy Angular build output to wwwroot
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
