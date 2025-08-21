# Multi-stage Dockerfile for SSL Monitor (Frontend + Backend)

# Stage 1: Build Backend
FROM node:20-alpine AS backend-build

WORKDIR /app/backend

# Copy backend package files
COPY ssl-checker-backend/package*.json ./

# Install backend dependencies
RUN npm ci --only=production

# Copy backend source code
COPY ssl-checker-backend/ ./

# Copy environment file
COPY ssl-checker-backend/.env.development .env

# Build backend
RUN npm run build

# Stage 2: Build Frontend
FROM node:20-alpine AS frontend-build

WORKDIR /app/frontend

# Copy frontend package files
COPY ssl-checker-frontend/package*.json ./

# Install frontend dependencies
RUN npm ci

# Copy frontend source code
COPY ssl-checker-frontend/ ./

# Copy environment file
COPY ssl-checker-frontend/.env .env

# Build frontend
RUN npm run build

# Stage 3: Production Runtime
FROM node:20-alpine AS production

# Install nginx and other dependencies
RUN apk add --no-cache nginx supervisor

# Create necessary directories
RUN mkdir -p /var/log/nginx /var/log/supervisor /run/nginx

# Copy backend from build stage
WORKDIR /app/backend
COPY --from=backend-build /app/backend/dist ./dist
COPY --from=backend-build /app/backend/package*.json ./
COPY --from=backend-build /app/backend/node_modules ./node_modules
COPY --from=backend-build /app/backend/.env .env

# Copy frontend build to nginx serve directory
COPY --from=frontend-build /app/frontend/dist/spa /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy supervisor configuration
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Expose ports
EXPOSE 80 5003

# Start supervisor to manage both nginx and backend
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
