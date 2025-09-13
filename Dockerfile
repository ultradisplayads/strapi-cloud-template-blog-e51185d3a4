# ================================
# Stage 1: Builder
# ================================
FROM node:20-bullseye-slim AS builder

WORKDIR /opt/app

# Install build tools (only for compiling deps)
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 make g++ libcairo2-dev libpango1.0-dev libjpeg-dev \
    libgif-dev librsvg2-dev libvips-dev git \
  && rm -rf /var/lib/apt/lists/*

# Copy only package files first (to cache dependencies)
COPY package.json package-lock.json ./

# Install dependencies including optional (sharp, etc.)
RUN npm ci --include=optional

# Copy rest of the app
COPY . .

# Build admin panel
RUN npm run build

# ================================
# Stage 2: Production
# ================================
FROM node:20-bullseye-slim AS production

WORKDIR /opt/app

# Install runtime dependencies (lighter than builder)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libvips libvips-dev \
  && rm -rf /var/lib/apt/lists/*

# Copy only production dependencies from builder
COPY --from=builder /opt/app/node_modules ./node_modules
COPY --from=builder /opt/app/package*.json ./

# Copy built app from builder
COPY --from=builder /opt/app ./

# Create uploads folder
RUN mkdir -p ./public/uploads

# Health check
COPY healthcheck.js ./

# Non-root user
RUN groupadd -g 1000 node \
  && useradd -m -u 1000 -g node node \
  && chown -R node:node /opt/app
USER node

# Expose Strapi port
EXPOSE 1337

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js || exit 1

# Run Strapi + News script together
CMD ["sh", "-c", "npm run start & npm run news:start"]
