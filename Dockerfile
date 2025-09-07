# Multi-stage build for Strapi v5
# Stage 1: Build (Ubuntu-based)
FROM ubuntu:22.04 AS builder

ENV DEBIAN_FRONTEND=noninteractive
ENV BETTER_SQLITE3_DISABLE_PREBUILD=1
ENV npm_config_build_from_source=true
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
    libsqlite3-dev \
    sqlite3 \
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
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN corepack enable pnpm
RUN pnpm config set network-timeout 1200000
RUN pnpm config set registry https://registry.npmjs.org/
RUN pnpm install --frozen-lockfile

# Copy application files
COPY . .

# Set production environment and build the application
ENV NODE_ENV=production
RUN pnpm build

# Stage 2: Production (Ubuntu-based)
FROM ubuntu:22.04 AS production

ENV DEBIAN_FRONTEND=noninteractive
ENV BETTER_SQLITE3_DISABLE_PREBUILD=1
ENV npm_config_build_from_source=true
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    curl \
    gnupg \
    bash \
    libvips \
    build-essential \
    gcc \
    g++ \
    make \
    python3 \
    pkg-config \
    libsqlite3-dev \
    sqlite3 \
  && rm -rf /var/lib/apt/lists/* \
  && mkdir -p /etc/apt/keyrings \
  && curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg \
  && echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_20.x nodistro main" > /etc/apt/sources.list.d/nodesource.list \
  && apt-get update && apt-get install -y --no-install-recommends nodejs \
  && corepack enable

# Create non-root user to run the app (match previous node image behavior)
RUN groupadd -g 1000 node \
  && useradd -m -u 1000 -g node node

# Set environment variables
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

# Set working directory
WORKDIR /opt/app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install production dependencies only
RUN corepack enable pnpm
RUN pnpm install --frozen-lockfile --prod

# Copy all built application files from builder stage
COPY --from=builder /opt/app ./

# Remove development files and reinstall production dependencies
RUN rm -rf node_modules
RUN pnpm install --frozen-lockfile --prod

# Rebuild native modules for the production environment
RUN pnpm rebuild better-sqlite3

# Create public/uploads directory for file uploads
RUN mkdir -p ./public/uploads

# Set proper permissions
RUN chown -R node:node /opt/app
USER node

# Expose port
EXPOSE 1337

# Start the application
CMD ["pnpm", "start"]