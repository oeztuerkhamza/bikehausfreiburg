---
description: Run the public site dev server (BikeHaus.Homepage)
---

Run `npm start` in `BikeHaus.Homepage/` in the background. The Angular dev server listens on http://localhost:4300 (CSR only, no SSR). If the user wants SSR for testing prerendering/SEO, build with `npm run build` then `npm run serve:ssr:BikeHaus.Homepage` (port 4000). Watch for first compilation result and report it.
