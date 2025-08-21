# SSL Monitor - Separate Docker Services

This guide explains how to deploy the SSL Monitor application using separate Docker containers for frontend and backend services.

## Architecture

- **Frontend Container**: React SPA served by nginx on port 80
- **Backend Container**: Node.js API running on port 5003
- **Network**: Both containers communicate via Docker network
- **Optional Services**: MongoDB and Redis for data storage and caching

## Quick Start

### 1. Build and Run Separate Services

```bash
# Build and start all services
docker-compose -f docker-compose.separate.yml up --build

# Run in background
docker-compose -f docker-compose.separate.yml up -d --build

# With MongoDB included
docker-compose -f docker-compose.separate.yml --profile with-db up --build

# With MongoDB and Redis
docker-compose -f docker-compose.separate.yml --profile with-db --profile with-cache up --build
```

### 2. Access the Application

- **Frontend**: http://localhost
- **Backend API**: http://localhost:5003
- **Swagger Docs**: http://localhost:5003/swagger
- **Health Check**: http://localhost/health

## Individual Service Deployment

### Backend Only

```bash
# Build backend image
docker build -t ssl-monitor-backend:latest ./ssl-checker-backend

# Run backend container
docker run -d \
  --name ssl-monitor-backend \
  -p 5003:5003 \
  -v $(pwd)/logs/backend:/app/logs \
  ssl-monitor-backend:latest
```

### Frontend Only

```bash
# Build frontend image
docker build -t ssl-monitor-frontend:latest ./ssl-checker-frontend

# Run frontend container
docker run -d \
  --name ssl-monitor-frontend \
  -p 80:80 \
  ssl-monitor-frontend:latest
```

## Service Configuration

### Backend Service

**File**: `ssl-checker-backend/Dockerfile`
- Multi-stage build with Node.js 20 Alpine
- PM2 for process management
- Health checks included
- Production-optimized

**Environment**: Create `ssl-checker-backend/.env.production`
```bash
NODE_ENV=production
APP_URL=http://localhost:5003
PORT=5003
CREDENTIALS=true
ORIGIN=http://localhost
MONGO_DB_URL=mongodb://root:password@mongodb:27017/ssl-monitor?authSource=admin
# ... other settings
```

### Frontend Service

**File**: `ssl-checker-frontend/Dockerfile`
- Multi-stage build with Node.js 20 Alpine + nginx
- Non-root user for security
- Static file serving with nginx
- API proxy configuration

**Environment**: Create `ssl-checker-frontend/.env.production`
```bash
VITE_API_BASE_URL=http://localhost/api
```

**Nginx Config**: `ssl-checker-frontend/nginx-frontend.conf`
- Serves React SPA
- Proxies `/api/*` to backend
- Handles CORS and security headers
- Static file caching

## Docker Compose Configuration

### Services

1. **backend**: Node.js API service
2. **frontend**: React SPA with nginx
3. **mongodb**: Database (optional)
4. **redis**: Caching (optional)

### Networks

- `ssl-monitor-network`: Bridge network for inter-service communication

### Volumes

- `mongodb_data`: Persistent MongoDB data
- `redis_data`: Persistent Redis data
- `./logs/backend`: Backend logs

## Development Workflow

### 1. Local Development

```bash
# Start backend only
docker-compose -f docker-compose.separate.yml up backend

# Start frontend only
docker-compose -f docker-compose.separate.yml up frontend

# Start with database
docker-compose -f docker-compose.separate.yml --profile with-db up backend mongodb
```

### 2. Production Deployment

```bash
# Build production images
docker-compose -f docker-compose.separate.yml build

# Deploy with all services
docker-compose -f docker-compose.separate.yml --profile with-db up -d
```

## Monitoring and Logs

### View Service Logs

```bash
# All services
docker-compose -f docker-compose.separate.yml logs -f

# Specific service
docker-compose -f docker-compose.separate.yml logs -f backend
docker-compose -f docker-compose.separate.yml logs -f frontend

# Individual containers
docker logs ssl-monitor-backend
docker logs ssl-monitor-frontend
```

### Health Checks

```bash
# Check service health
docker-compose -f docker-compose.separate.yml ps

# Manual health checks
curl http://localhost/health          # Frontend
curl http://localhost:5003/api/health # Backend
```

## Scaling

### Horizontal Scaling

```bash
# Scale backend services
docker-compose -f docker-compose.separate.yml up -d --scale backend=3

# Scale frontend services (with load balancer)
docker-compose -f docker-compose.separate.yml up -d --scale frontend=2
```

### Load Balancer Setup

For production scaling, consider using:
- **nginx** as reverse proxy/load balancer
- **HAProxy** for advanced load balancing
- **Traefik** for automatic service discovery

## Troubleshooting

### Common Issues

1. **Service Communication**
   ```bash
   # Check network connectivity
   docker network ls
   docker network inspect ssl-monitor_ssl-monitor-network
   
   # Test service communication
   docker exec ssl-monitor-frontend ping backend
   ```

2. **Port Conflicts**
   ```bash
   # Check port usage
   sudo netstat -tlnp | grep :80
   sudo netstat -tlnp | grep :5003
   
   # Stop conflicting services
   sudo systemctl stop nginx
   ```

3. **Build Failures**
   ```bash
   # Clean build
   docker-compose -f docker-compose.separate.yml down
   docker system prune -f
   docker-compose -f docker-compose.separate.yml up --build
   ```

### Debug Mode

```bash
# Run with debug output
docker-compose -f docker-compose.separate.yml up

# Access container shells
docker exec -it ssl-monitor-backend sh
docker exec -it ssl-monitor-frontend sh

# Check processes
docker exec ssl-monitor-backend pm2 status
docker exec ssl-monitor-frontend nginx -t
```

## Security Considerations

1. **Container Security**
   - Non-root users in containers
   - Minimal base images (Alpine)
   - Regular security updates

2. **Network Security**
   - Isolated Docker networks
   - Only expose necessary ports
   - Use secrets for sensitive data

3. **Application Security**
   - Environment variables for configuration
   - HTTPS in production
   - Input validation and sanitization

## Performance Optimization

1. **Image Optimization**
   - Multi-stage builds
   - Layer caching
   - Minimal dependencies

2. **Runtime Optimization**
   - Resource limits
   - Health checks
   - Proper logging

3. **Network Optimization**
   - Service discovery
   - Load balancing
   - Connection pooling

## Migration from Combined Setup

If you're migrating from the combined Docker setup:

1. **Update Environment Files**
   ```bash
   # Backend
   cp ssl-checker-backend/.env.development ssl-checker-backend/.env.production
   
   # Frontend
   cp ssl-checker-frontend/.env ssl-checker-frontend/.env.production
   ```

2. **Update API URLs**
   - Frontend: `VITE_API_BASE_URL=http://localhost/api`
   - Backend: `ORIGIN=http://localhost`

3. **Deploy Services**
   ```bash
   docker-compose -f docker-compose.separate.yml up --build
   ```
