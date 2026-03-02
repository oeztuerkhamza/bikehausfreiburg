# Bike Haus Freiburg - Public Homepage

Public website for Bike Haus Freiburg, serving the customer-facing storefront at `bikehausfreiburg.com`.

## Tech Stack

- Angular 17 (Standalone Components)
- Signal-based state management
- Dark theme design system
- Multi-language support (DE/FR/TR)

## Development

```bash
# Install dependencies
npm install

# Start dev server (requires API running at localhost:5196)
npm start
# or
ng serve --open

# Build for production
npm run build -- --configuration production
```

## Deployment

This repo uses GitHub Actions for continuous deployment.

### Auto-Deploy

Push to `main` branch triggers:

1. Build Angular app
2. SCP to `/opt/bikehaus/homepage-dist/` on server
3. Reload nginx

### GitHub Secrets Required

| Secret           | Value           |
| ---------------- | --------------- |
| `SERVER_HOST`    | Netcup VPS IP   |
| `SERVER_USER`    | `root`          |
| `SERVER_SSH_KEY` | SSH private key |

### Manual Deploy

```bash
npm run build -- --configuration production
scp -r dist/bike-haus.homepage/browser/* root@YOUR_SERVER:/opt/bikehaus/homepage-dist/
ssh root@YOUR_SERVER "docker exec bikehaus-nginx nginx -s reload"
```

## Project Structure

```
src/
├── app/
│   ├── components/     # Shared components (navbar, footer, bike-card)
│   ├── pages/          # Route pages (home, showroom, about, contact, etc.)
│   ├── services/       # API, Translation, ShopInfo services
│   └── models/         # TypeScript interfaces
├── assets/             # Static assets (logo, images)
└── environments/       # Environment configs
```

## Related Repositories

- [bikehausfreiburg](https://github.com/YOUR_USERNAME/bikehausfreiburg) - API + Admin Panel
