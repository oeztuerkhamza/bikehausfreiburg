# syntax=docker/dockerfile:1.7
# =============================================
# Stage 1: Build Angular Admin SPA
# =============================================
FROM node:20-alpine AS build
WORKDIR /app

ENV LANG=C.UTF-8
ENV LC_ALL=C.UTF-8

COPY package*.json ./
RUN --mount=type=cache,target=/root/.npm npm ci

COPY . .
RUN npm run build -- --configuration production

# =============================================
# Stage 2: Serve via nginx
# =============================================
FROM nginx:alpine AS production

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/bike-haus.client/browser /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget -q -O /dev/null http://localhost/ || exit 1
