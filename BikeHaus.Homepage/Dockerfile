# Stage 1: Build
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Production SSR Server
FROM node:20-alpine AS production
WORKDIR /app

# Copy built output
COPY --from=build /app/dist/bike-haus.homepage ./dist/bike-haus.homepage

ENV NODE_ENV=production
ENV PORT=4000

EXPOSE 4000

CMD ["node", "dist/bike-haus.homepage/server/server.mjs"]
