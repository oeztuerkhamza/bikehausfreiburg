---
description: Add a new EF Core migration. Usage — /migrate-add <PascalCaseName>
argument-hint: <MigrationName>
---

Add a new EF Core migration named `$ARGUMENTS`.

Run:
```powershell
dotnet ef migrations add $ARGUMENTS --project BikeHaus.Infrastructure --startup-project BikeHaus.API
```

Rules:
- Migration name must be PascalCase (e.g. `AddRentalDiscount`, not `add-rental-discount`).
- After generation, show the user the new `.cs` files in `BikeHaus.Infrastructure/Migrations/` (Up/Down + ModelSnapshot diff).
- Do NOT run `database update` automatically — ask the user first, since auto-migration on API startup means this hits prod data once deployed.
- If `$ARGUMENTS` is empty, ask the user for a name before doing anything.
