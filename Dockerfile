# =========================
# Stage 1: Build
# =========================
FROM ubuntu:22.04 AS builder

ENV DEBIAN_FRONTEND=noninteractive
WORKDIR /opt/app

# Install Node.js 20 and build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates curl gnupg build-essential gcc autoconf automake \
    zlib1g-dev libpng-dev nasm bash git python3 make g++ pkg-config \
    libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev libvips-dev \
  && rm -rf /var/lib/apt/lists/* \
  && mkdir -p /etc/apt/keyrings \
  && curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg \
  && echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_20.x nodistro main" \
     > /etc/apt/sources.list.d/nodesource.list \
  && apt-get update && apt-get install -y --no-install-recommends nodejs \
  && corepack enable

# Copy package files
COPY package.json package-lock.json ./

# Install deps
RUN npm install -g node-gyp \
  && npm config set registry https://registry.npmjs.org/ \
  && npm ci --include=optional \
  && npm rebuild sharp --verbose

# Copy full app
COPY . .

# Build for production
ENV NODE_ENV=production
RUN npm run build


# =========================
# Stage 2: Production
# =========================
FROM ubuntu:22.04 AS production

ENV DEBIAN_FRONTEND=noninteractive
WORKDIR /opt/app

# Install runtime dependencies + Node.js 20
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates curl gnupg bash \
    libvips libvips-dev libjpeg-dev libpng-dev libwebp-dev libtiff-dev \
    libgif-dev libheif-dev \
  && rm -rf /var/lib/apt/lists/* \
  && mkdir -p /etc/apt/keyrings \
  && curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg \
  && echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_20.x nodistro main" \
     > /etc/apt/sources.list.d/nodesource.list \
  && apt-get update && apt-get install -y --no-install-recommends nodejs \
  && corepack enable

# Copy package files
COPY package.json package-lock.json ./

# Install production-only dependencies
RUN npm ci --omit=dev && npm rebuild sharp --verbose

# Copy built app from builder stage
COPY --from=builder /opt/app ./

# Ensure uploads dir exists
RUN mkdir -p ./public/uploads

# Copy health check script
COPY healthcheck.js ./

# Create non-root user (skip if exists)
RUN id -u node &>/dev/null || (groupadd -g 1000 node && useradd -m -u 1000 -g node node)

# Set ownership
RUN chown -R node:node /opt/app
USER node

# Expose Strapi port
EXPOSE 1337

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node healthcheck.js

# Start Strapi + news cron script
CMD ["sh", "-c", "npm run start & npm run news:start"]
