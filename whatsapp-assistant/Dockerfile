# WhatsApp asistanı — Node + sistem Chromium (whatsapp-web.js/puppeteer için)
FROM node:20-bookworm-slim

ENV NODE_ENV=production \
    PUPPETEER_SKIP_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium \
    WWEBJS_DATA_PATH=/app/data/wwebjs_auth

# Chromium + yazı tipleri + gerekli sistem kütüphaneleri
RUN apt-get update && apt-get install -y --no-install-recommends \
    chromium \
    fonts-liberation \
    fonts-noto-color-emoji \
    ca-certificates \
    dumb-init \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Bağımlılıklar (puppeteer kendi Chromium'unu indirmez — üstteki env)
COPY package.json ./
RUN npm install --omit=dev --no-audit --no-fund

# Uygulama kaynağı
COPY src ./src
COPY public ./public

# Oturum + veri kalıcı olsun diye volume
RUN mkdir -p /app/data
VOLUME ["/app/data"]

EXPOSE 3000
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "src/index.js"]
