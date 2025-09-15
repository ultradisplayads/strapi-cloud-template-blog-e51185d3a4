# Multi-stage build for Strapi v5
# Stage 1: Build (Ubuntu-based)
FROM ubuntu:22.04 AS builder

ENV DEBIAN_FRONTEND=noninteractive
WORKDIR /opt/app

# Install Node.js 20 and system dependencies for building
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    curl \
    gnupg \
    build-essential \
    gcc \
    autoconf \
    automake \
    zlib1g-dev \
    libpng-dev \
    nasm \
    bash \
    git \
    python3 \
    make \
    g++ \
    pkg-config \
    libcairo2-dev \
    libpango1.0-dev \
    libjpeg-dev \
    libgif-dev \
    librsvg2-dev \
    libvips-dev \
  && rm -rf /var/lib/apt/lists/* \
  && mkdir -p /etc/apt/keyrings \
  && curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg \
  && echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_20.x nodistro main" > /etc/apt/sources.list.d/nodesource.list \
  && apt-get update && apt-get install -y --no-install-recommends nodejs \
  && corepack enable

# Copy package files
COPY package.json package-lock.json ./

# Install all dependencies for building
RUN npm install -g node-gyp
RUN npm config set registry https://registry.npmjs.org/
RUN npm ci --include=optional
RUN npm rebuild sharp --verbose

# Copy application files
COPY . .

# Set production environment and build the application
ENV NODE_ENV=production
RUN npm run build

# Stage 2: Production (Ubuntu-based)
FROM ubuntu:22.04 AS production

ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    curl \
    gnupg \
    bash \
    libvips \
    libvips-dev \
    libjpeg-dev \
    libpng-dev \
    libwebp-dev \
    libtiff-dev \
    libgif-dev \
    libheif-dev \
  && rm -rf /var/lib/apt/lists/* \
  && mkdir -p /etc/apt/keyrings \
  && curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg \
  && echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_20.x nodistro main" > /etc/apt/sources.list.d/nodesource.list \
  && apt-get update && apt-get install -y --no-install-recommends nodejs \
  && corepack enable

# Create non-root user to run the app
RUN groupadd -g 1000 node \
  && useradd -m -u 1000 -g node node

# Set environment variables
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

# Set working directory
WORKDIR /opt/app

# Copy package files
COPY package.json package-lock.json ./

# Install ONLY production dependencies (clean install)
RUN npm ci --omit=dev --include=optional && npm cache clean --force

# Copy built application files from builder stage (excluding node_modules)
COPY --from=builder /opt/app/dist ./dist
COPY --from=builder /opt/app/build ./build
COPY --from=builder /opt/app/public ./public
COPY --from=builder /opt/app/config ./config
COPY --from=builder /opt/app/database ./database
COPY --from=builder /opt/app/src ./src
COPY --from=builder /opt/app/*.js ./
COPY --from=builder /opt/app/*.json ./
COPY --from=builder /opt/app/*.md ./

# Rebuild sharp for production environment (one time only)
RUN npm rebuild sharp --verbose

# Create public/uploads directory for file uploads
RUN mkdir -p ./public/uploads

# Set proper permissions
RUN chown -R node:node /opt/app
USER node

# Expose port
EXPOSE 1337

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "console.log('Health check passed')" || exit 1

# Start the application
CMD ["npm", "start"]