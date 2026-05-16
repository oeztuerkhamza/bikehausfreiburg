---
description: List all EF Core migrations with applied status
---

Run:
```powershell
dotnet ef migrations list --project BikeHaus.Infrastructure --startup-project BikeHaus.API
```

Report the output. Highlight any migrations marked as "(Pending)" — those are not yet applied to the local DB.
