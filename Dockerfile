# Creating multi-stage build for production
FROM node:22-alpine AS build

# Install build dependencies including dumb-init
RUN apk update && apk add --no-cache \
    build-base gcc autoconf automake zlib-dev libpng-dev vips-dev git \
    dumb-init > /dev/null 2>&1

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /opt/
COPY package.json package-lock.json ./
RUN npm install -g node-gyp
RUN npm config set fetch-retry-maxtimeout 600000 -g && npm install --only=production

ENV PATH=/opt/node_modules/.bin:$PATH

WORKDIR /opt/app
COPY . .
RUN npm run build

# Creating final production image
FROM node:22-alpine

# Install runtime dependencies
RUN apk add --no-cache vips-dev dumb-init

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

# Copy node_modules from build stage
WORKDIR /opt/
COPY --from=build /opt/node_modules ./node_modules

# Copy application from build stage
WORKDIR /opt/app
COPY --from=build /opt/app ./

ENV PATH=/opt/node_modules/.bin:$PATH

# Create uploads directory with proper permissions for the node user
RUN mkdir -p /opt/app/public/uploads && chown -R node:node /opt/app/public/uploads

# Ensure the node user owns the entire app directory
RUN chown -R node:node /opt/app

# Switch to non-root user
USER node

# Expose port
EXPOSE 1337

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node healthcheck.js || exit 1

# Start the application with dumb-init
CMD ["dumb-init", "npm", "run", "start"]