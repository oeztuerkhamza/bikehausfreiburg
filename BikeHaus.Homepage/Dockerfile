# syntax=docker/dockerfile:1.7
# =============================================
# Homepage SSR runtime — expects prebuilt dist/
# Build is performed by the GitHub Actions runner
# (faster CPU/RAM than VPS, full npm cache).
# =============================================
FROM node:20-alpine AS production
WORKDIR /app

# Copy the prebuilt Angular SSR output. Server bundle is fully self-contained
# (all dependencies bundled by Angular CLI), so no node_modules is required.
COPY dist/bike-haus.homepage ./dist/bike-haus.homepage

ENV NODE_ENV=production
ENV PORT=4000

EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget -q -O /dev/null http://localhost:4000/ || exit 1

CMD ["node", "dist/bike-haus.homepage/server/server.mjs"]
