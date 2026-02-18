# Build stage
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy csproj files and restore
COPY BikeHaus.Domain/*.csproj BikeHaus.Domain/
COPY BikeHaus.Application/*.csproj BikeHaus.Application/
COPY BikeHaus.Infrastructure/*.csproj BikeHaus.Infrastructure/
COPY BikeHaus.API/*.csproj BikeHaus.API/
RUN dotnet restore BikeHaus.API/BikeHaus.API.csproj

# Copy everything and build
COPY . .
RUN dotnet publish BikeHaus.API/BikeHaus.API.csproj -c Release -o /app/publish

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app

# Install fonts for PDF generation
RUN apt-get update && apt-get install -y \
    libfontconfig1 \
    fonts-liberation \
    && rm -rf /var/lib/apt/lists/*

COPY --from=build /app/publish .

# Create uploads directory
RUN mkdir -p /app/uploads

# Expose port
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production

ENTRYPOINT ["dotnet", "BikeHaus.API.dll"]
