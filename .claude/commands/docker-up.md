---
description: Build and start the full Docker stack (production-like)
---

Run `docker compose up -d --build` from the repo root. This brings up all 5 services: bikehaus (API), client (admin SPA), homepage (SSR), nginx, certbot.

**Pre-check**: `BikeHaus.Homepage/Dockerfile` expects a prebuilt `dist/` folder. If it doesn't exist, first run `npm run build` inside `BikeHaus.Homepage/` (CI normally does this).

After `up -d` completes, run `docker compose ps` and report which containers are healthy. If any are restarting, show the last 30 log lines from that service via `docker compose logs --tail=30 <name>`.
