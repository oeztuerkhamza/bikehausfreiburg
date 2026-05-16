---
description: Start API + both Angular dev servers locally (no Docker)
---

Start three background processes in parallel:
1. `dotnet run --project BikeHaus.API` (API at :5196)
2. `npm start` in `BikeHaus.Client/` (admin SPA at :4200)
3. `npm start` in `BikeHaus.Homepage/` (public site at :4300)

Use Bash with `run_in_background: true` for each. After kicking them off, briefly summarize what's starting where. Don't poll/wait — the user will tell you when something needs attention.
