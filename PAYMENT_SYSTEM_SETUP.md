# 💳 Bike Haus Freiburg — Payment System Setup Guide

## 📋 Überblick

Diese Dokumentation beschreibt die Implementierung eines PCI DSS-konformen Zahlungssystems für Bike Haus Freiburg basierend auf:

- **Frontend**: Angular 17+ (Standalone Components)
- **Backend**: ASP.NET Core 8
- **Payment Provider**: Mollie (oder Stripe)
- **Sicherheit**: Zero-Trust Architecture, OWASP Top 10 Prevention

---

## 🔧 Backend Setup

### 1. Environment Variables (appsettings.json)

```json
{
  "Mollie": {
    "ApiKey": "live_xxxxxxxxxxxx", // ← Production API Key aus Mollie Dashboard
    "WebhookSecret": "webhook_secret_xxxx",
    "TestMode": false
  },
  "Jwt": {
    "Key": "your-256bit-secret-key-min-32-chars",
    "Issuer": "BikeHausFreiburg",
    "Audience": "BikeHausApp"
  },
  "AllowedOrigins": [
    "https://bikehausfreiburg.com",
    "https://www.bikehausfreiburg.com"
  ]
}
```

### 2. Secrets Management (Production)

**❌ NICHT in appsettings.json:**

```json
{
  "Mollie": {
    "ApiKey": "live_xxxx" // ← NIEMALS hier
  }
}
```

**✅ Azure Key Vault oder Docker Secrets:**

```bash
# Docker / Kubernetes
export MOLLIE_API_KEY="live_xxxx"
export MOLLIE_WEBHOOK_SECRET="webhook_xxxx"

# Azure Key Vault (Program.cs)
builder.Configuration.AddAzureKeyVault(
    new Uri(config["KeyVault:Uri"]),
    new DefaultAzureCredential());
```

### 3. Database Migration

```bash
# Migration erstellen
dotnet ef migrations add AddPaymentSystem --project BikeHaus.Infrastructure

# Anwenden
dotnet ef database update --project BikeHaus.Infrastructure

# Produktions-Deployment
# In Kubernetes oder Docker: AUTO_MIGRATE=true
```

### 4. Service Registration (Program.cs)

Alle Payment-Services sind bereits in Program.cs registriert:

- `IPaymentService` → `MolliePaymentService`
- `IPricingService` → `PricingService`
- `IPaymentAuditLogger` → `PaymentAuditLogger`
- `IWebhookValidator` → `WebhookValidator`
- `IIdempotencyService` → `IdempotencyService`

### 5. Mollie Webhook Configuration

**In Mollie Dashboard:**

1. Settings → Webhooks
2. Add webhook:
   - URL: `https://api.bikehausfreiburg.com/api/payment/webhook/mollie`
   - Events: `payment.created`, `payment.updated`
3. Copy Webhook Secret → Environment Variable

---

## 🎨 Frontend Setup

### 1. Environment Configuration

```typescript
// environments/environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5000/api',
};

// environments/environment.prod.ts
export const environment = {
  production: true,
  apiUrl: 'https://api.bikehausfreiburg.com/api',
};
```

### 2. HTTP Interceptor für CSRF

```typescript
import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
} from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class CsrfInterceptor implements HttpInterceptor {
  intercept(
    req: HttpRequest<any>,
    next: HttpHandler,
  ): Observable<HttpEvent<any>> {
    const csrfToken = this.getCsrfToken();
    if (csrfToken) {
      req = req.clone({
        setHeaders: {
          'X-XSRF-TOKEN': csrfToken,
        },
      });
    }
    return next.handle(req);
  }

  private getCsrfToken(): string {
    // ASP.NET Core setzt CSRF Cookie automatisch
    const name = 'XSRF-TOKEN';
    let cookieValue = '';
    if (document.cookie && document.cookie !== '') {
      const cookies = document.cookie.split(';');
      for (let cookie of cookies) {
        cookie = cookie.trim();
        if (cookie.substring(0, name.length + 1) === name + '=') {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }
    return cookieValue;
  }
}
```

### 3. App Configuration

```typescript
// app.config.ts
import { ApplicationConfig } from '@angular/core';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { CsrfInterceptor } from './interceptors/csrf.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    // ... andere Provider
    {
      provide: HTTP_INTERCEPTORS,
      useClass: CsrfInterceptor,
      multi: true,
    },
  ],
};
```

---

## 🔐 Security Checklist

### Production Deployment

- [ ] TLS 1.3 aktiviert, TLS 1.0/1.1 deaktiviert
- [ ] HSTS Header gesetzt (max-age=31536000)
- [ ] CSP (Content Security Policy) Header konfiguriert
- [ ] CORS nur für eigene Domain(n) erlaubt
- [ ] API Keys in Environment Variables / Key Vault
- [ ] Webhook Signature Validation aktiv
- [ ] Rate Limiting aktiviert (5 req/min pro IP)
- [ ] Input Validation für alle Endpoints
- [ ] Audit Logging für alle Zahlungen
- [ ] Datenbank: Logs sind INSERT-only
- [ ] IP-Adressen gehasht (GDPR)
- [ ] Keine Stack Traces in Error Messages
- [ ] 3D Secure 2 (Mollie default) aktiv

### Development Setup

```bash
# Dependencies
dotnet add package Mollie.Api.Client
dotnet add package FluentValidation
dotnet add package Microsoft.EntityFrameworkCore

# Angular
npm install uuid
```

---

## 📊 API Endpoints

### Payment Management

| Endpoint                      | Method | Auth        | Rate Limit | Description    |
| ----------------------------- | ------ | ----------- | ---------- | -------------- |
| `/api/payment/create`         | POST   | JWT         | 5/min      | Ödeme erzeugen |
| `/api/payment/status/{id}`    | GET    | JWT         | -          | Ödeme-Status   |
| `/api/payment/refund`         | POST   | JWT (Admin) | -          | Rückzahlung    |
| `/api/payment/webhook/mollie` | POST   | No          | -          | Mollie Webhook |
| `/api/payment/pricing`        | GET    | No          | -          | Preis-Info     |
| `/api/payment/health`         | GET    | No          | -          | Health Check   |

### Headers

```
X-XSRF-TOKEN: {csrf-token}        # CSRF Protection
Idempotency-Key: {uuid}            # Duplicate Prevention
Authorization: Bearer {jwt-token}  # Authentication
```

---

## 💰 Pricing Rules (EU Compliance)

| Method | Surcharge | Discount | Legal   |
| ------ | --------- | -------- | ------- |
| Karte  | 0%        | -        | PSD2 ✅ |
| SEPA   | -         | 0.5%     | PSD2 ✅ |
| PayPal | 2.9%      | -        | Erlaubt |
| Klarna | 3%        | -        | BNPL    |
| iDEAL  | 0%        | -        | EU ✅   |

---

## 🧪 Testing

### Unit Tests

```csharp
[Fact]
public async Task CreatePayment_WithValidRequest_ReturnsCheckoutUrl()
{
    var request = new CreatePaymentRequest
    {
        OnlineSaleId = Guid.NewGuid(),
        Method = PaymentMethodType.CreditCard
    };

    var result = await _paymentService.CreatePaymentAsync(
        request, "user-123", "192.168.1.1", "Mozilla/5.0");

    Assert.NotNull(result.CheckoutUrl);
    Assert.NotEmpty(result.ExternalPaymentId);
}
```

### Integration Tests

```bash
# Test gegen Mollie Test API
dotnet test --filter Category=PaymentIntegration
```

### E2E Tests (Angular)

```bash
npm run e2e -- --spec=checkout.spec.ts
```

---

## 📈 Monitoring & Logging

### Audit Trail

```sql
-- Alle Zahlungsaktionen einsehen
SELECT * FROM PaymentAuditLogs
WHERE Timestamp > DATEADD(DAY, -7, GETDATE())
ORDER BY Timestamp DESC;

-- Verdächtige Aktivitäten
SELECT * FROM PaymentAuditLogs
WHERE Event = 'SuspiciousActivity'
AND IsSuccess = 0;
```

### Alerts

```yaml
# Prometheus Rules
- alert: HighPaymentFailureRate
  expr: rate(payment_failures_total[5m]) > 0.1
  for: 5m
  annotations:
    summary: '{{ $value }}% Zahlungsausfälle in letzten 5min'
```

---

## 🚨 Troubleshooting

### Problem: "Invalid webhook signature"

**Lösung:**

- Webhook Secret in Mollie Dashboard kopieren
- In Environment Variable `MOLLIE_WEBHOOK_SECRET` setzen
- API Service neu starten

### Problem: "Rate limit exceeded"

**Lösung:**

- Client wartet 1 Minute vor nächstem Versuch
- Idempotency-Key neu generieren
- Audit Log prüfen

### Problem: "Payment not found in database"

**Lösung:**

- Check: OnlineSale-ID gültig?
- Check: Migration erfolgreich?
- Webhook Retry in Mollie Dashboard

---

## 📞 Support

- Mollie Documentation: https://docs.mollie.com
- ASP.NET Core Security: https://learn.microsoft.com/en-us/aspnet/core/security
- PCI DSS Compliance: https://www.pcisecuritystandards.org
- OWASP Top 10: https://owasp.org/Top10/

---

**Version**: 1.0  
**Datum**: 2026-05-13  
**Status**: Production Ready ✅
