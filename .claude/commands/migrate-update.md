---
description: Apply pending EF Core migrations to the local SQLite DB
---

Run:
```powershell
dotnet ef database update --project BikeHaus.Infrastructure --startup-project BikeHaus.API
```

This updates `BikeHaus.API/BikeHausFreiburg.db` to the latest migration. Note that the API auto-migrates on startup as well, so this is mainly for explicit verification. If the update fails, report the EF Core error verbatim.
