# Multi-stage Dockerfile for Node.js + SurrealDB 1.x
# Optimized for Railway deployment

# =============================================================================
# Stage 1: Build stage
# =============================================================================
FROM node:20-alpine AS builder

# Install git, curl, ffmpeg, and build tools (required for some npm packages and torge/reliq)
RUN apk add --no-cache git curl make gcc musl-dev ffmpeg

# Install reliq (HTML parsing library - must be installed before torge)
RUN git clone https://github.com/TUVIMEN/reliq.git /tmp/reliq && \
    cd /tmp/reliq && \
    make && \
    make install && \
    rm -rf /tmp/reliq

# Install torge (shell script tool for web scraping)
RUN git clone https://github.com/TUVIMEN/torge.git /tmp/torge && \
    cp /tmp/torge/torge /usr/local/bin/torge && \
    chmod +x /usr/local/bin/torge && \
    rm -rf /tmp/torge

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy package files first for better caching
COPY package.json pnpm-lock.yaml* ./

# Install ALL dependencies (including dev for build)
RUN pnpm install --frozen-lockfile || pnpm install

# Copy source code
COPY . .

# Build the application (if needed)
RUN pnpm run build || true

# =============================================================================
# Stage 2: Production stage with SurrealDB
# Using Debian-based image for glibc compatibility with SurrealDB
# =============================================================================
FROM node:20-slim AS production

# Set SurrealDB version
ENV SURREAL_VERSION=v1.5.5

# Install required packages for SurrealDB, Redis, process management, and build tools
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    bash \
    supervisor \
    ca-certificates \
    git \
    make \
    gcc \
    libc6-dev \
    ffmpeg \
    bzip2 \
    redis-server \
    && rm -rf /var/lib/apt/lists/*

# Install reliq (HTML parsing library - must be installed before torge)
RUN git clone https://github.com/TUVIMEN/reliq.git /tmp/reliq && \
    cd /tmp/reliq && \
    make && \
    make install && \
    rm -rf /tmp/reliq

# Install torge (shell script tool for web scraping)
RUN git clone https://github.com/TUVIMEN/torge.git /tmp/torge && \
    cp /tmp/torge/torge /usr/local/bin/torge && \
    chmod +x /usr/local/bin/torge && \
    rm -rf /tmp/torge

# Download and install SurrealDB directly from GitHub releases
RUN ARCH=$(dpkg --print-architecture) && \
    if [ "$ARCH" = "amd64" ]; then SURREAL_ARCH="linux-amd64"; \
    elif [ "$ARCH" = "arm64" ]; then SURREAL_ARCH="linux-arm64"; \
    else echo "Unsupported architecture: $ARCH" && exit 1; fi && \
    curl -L -o /tmp/surreal.tgz "https://github.com/surrealdb/surrealdb/releases/download/${SURREAL_VERSION}/surreal-${SURREAL_VERSION}.${SURREAL_ARCH}.tgz" && \
    tar -xzf /tmp/surreal.tgz -C /usr/local/bin && \
    chmod +x /usr/local/bin/surreal && \
    rm /tmp/surreal.tgz

# Verify SurrealDB installation
RUN surreal version

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy everything from builder stage (includes node_modules with all deps)
COPY --from=builder /app .

# Remove any .env files that might have been copied (they should be excluded by .dockerignore but just in case)
RUN rm -f /app/.env* 2>/dev/null || true

# Create data directory for SurrealDB
RUN mkdir -p /data/db

# Create supervisor configuration directory
RUN mkdir -p /etc/supervisor/conf.d

# Copy Docker configuration files (overwrite from builder)
COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY docker/docker-entrypoint.sh /app/docker-entrypoint.sh
COPY docker/run-migrations.sh /app/docker/run-migrations.sh

# Make scripts executable
RUN chmod +x /app/docker-entrypoint.sh /app/docker/run-migrations.sh

# Expose ports
# PORT is the Node.js application port (Railway will set this)
# DB_PORT is internal SurrealDB port
EXPOSE 8080

# Health check - increased start-period to allow time for SurrealDB + migrations + Node.js startup
HEALTHCHECK --interval=30s --timeout=30s --start-period=120s --retries=10 \
    CMD curl -f http://localhost:${PORT:-8080}/ || exit 1

# Set entrypoint
ENTRYPOINT ["/app/docker-entrypoint.sh"]