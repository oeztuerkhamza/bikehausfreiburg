---
description: Reset the admin user's password (writes to local SQLite DB)
---

Run `dotnet run --project ResetPw`. This rewrites the password hash in the `Users` table of `BikeHaus.API/BikeHausFreiburg.db`. Read the console output and report the resulting credentials. Warn the user that this only affects the local DB, not the production Docker volume.
