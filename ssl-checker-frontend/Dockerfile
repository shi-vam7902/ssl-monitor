# Frontend Dockerfile for SSL Monitor

# Stage 1: Build stage
FROM node:20-alpine AS build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies with legacy peer deps to handle conflicts
RUN npm ci --legacy-peer-deps

# Copy source code
COPY . .

# Environment file will be mounted by docker-compose

# Build the application
RUN npm run build

# Stage 2: Production stage with nginx
FROM nginx:alpine AS production

# Copy built application from build stage
COPY --from=build /app/dist/spa /usr/share/nginx/html

# Copy nginx configuration
COPY nginx-frontend.conf /etc/nginx/nginx.conf

# Create nginx user if it doesn't exist
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Change ownership of the nginx directory
RUN chown -R nextjs:nodejs /usr/share/nginx/html && \
    chown -R nextjs:nodejs /var/cache/nginx && \
    chown -R nextjs:nodejs /var/log/nginx && \
    chown -R nextjs:nodejs /etc/nginx/conf.d

# Run as root for nginx (will fix permissions later)
# USER nextjs

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
