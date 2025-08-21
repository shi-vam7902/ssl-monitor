# SSL Monitor - Docker Deployment Guide

This guide explains how to deploy the SSL Monitor application using Docker with nginx serving the frontend and the Node.js backend running behind it.

## Architecture

- **Frontend**: React SPA served by nginx on port 80
- **Backend**: Node.js API running on port 5003
- **Reverse Proxy**: nginx proxies `/api/*` requests to the backend
- **Process Manager**: Supervisor manages both nginx and backend processes

## Quick Start

### 1. Build and Run with Docker Compose

```bash
# Build and start the application
docker-compose up --build

# Run in background
docker-compose up -d --build
```

### 2. Access the Application

- **Frontend**: http://localhost
- **Backend API**: http://localhost:5003
- **Swagger Docs**: http://localhost/swagger
- **Health Check**: http://localhost/health

### 3. With MongoDB (Optional)

```bash
# Start with MongoDB included
docker-compose --profile with-db up --build
```

## Manual Docker Build

### 1. Build the Image

```bash
docker build -t ssl-monitor:latest .
```

### 2. Run the Container

```bash
docker run -d \
  --name ssl-monitor \
  -p 80:80 \
  -p 5003:5003 \
  ssl-monitor:latest
```

## Environment Configuration

### Backend Environment

Create `/ssl-checker-backend/.env.production`:

```bash
NODE_ENV=production
APP_URL=http://localhost:5003
PORT=5003
CREDENTIALS=true
ORIGIN=http://localhost

# MongoDB Configuration
MONGO_DB_URL=mongodb://root:password@mongodb:27017/ssl-monitor?authSource=admin

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Email Configuration
SMTP_MAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM=your-email@gmail.com

# Other configurations...
```

### Frontend Environment

Create `/ssl-checker-frontend/.env.production`:

```bash
VITE_API_BASE_URL=http://localhost/api
```

## Docker Configuration Files

### Dockerfile
Multi-stage build that:
1. Builds the backend Node.js application
2. Builds the frontend React application
3. Creates production image with nginx and supervisor

### nginx.conf
- Serves frontend static files
- Proxies `/api/*` requests to backend
- Handles CORS and security headers
- Includes rate limiting and compression

### supervisord.conf
Manages both nginx and backend processes:
- nginx: Serves frontend and proxies API requests
- backend: Runs the Node.js API server

## Production Deployment

### 1. Environment Setup

```bash
# Copy and configure environment files
cp ssl-checker-backend/.env.development ssl-checker-backend/.env.production
cp ssl-checker-frontend/.env ssl-checker-frontend/.env.production

# Edit the production environment files with your settings
```

### 2. Build Production Image

```bash
docker build -t ssl-monitor:production .
```

### 3. Deploy

```bash
# Using docker-compose
docker-compose -f docker-compose.yml up -d

# Or manually
docker run -d \
  --name ssl-monitor-prod \
  -p 80:80 \
  -p 5003:5003 \
  --restart unless-stopped \
  ssl-monitor:production
```

## Monitoring and Logs

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f ssl-monitor

# Direct container logs
docker logs ssl-monitor
```

### Health Check

```bash
# Check application health
curl http://localhost/health

# Check backend directly
curl http://localhost:5003/api/health
```

## Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Check what's using the ports
   sudo netstat -tlnp | grep :80
   sudo netstat -tlnp | grep :5003
   
   # Stop conflicting services
   sudo systemctl stop nginx  # if nginx is running
   ```

2. **Build Failures**
   ```bash
   # Clean build
   docker-compose down
   docker system prune -f
   docker-compose up --build
   ```

3. **CORS Issues**
   - Ensure `ORIGIN` in backend environment matches your frontend URL
   - Check nginx CORS configuration in `nginx.conf`

4. **Database Connection**
   - Verify MongoDB URL in backend environment
   - Check if MongoDB container is running (if using Docker)

### Debug Mode

```bash
# Run with debug output
docker-compose up --build

# Access container shell
docker exec -it ssl-monitor sh

# Check processes inside container
supervisorctl status
```

## Security Considerations

1. **Environment Variables**: Never commit sensitive data to version control
2. **JWT Secret**: Use a strong, unique secret in production
3. **Database**: Use strong passwords and restrict network access
4. **HTTPS**: Configure SSL/TLS for production deployments
5. **Firewall**: Only expose necessary ports

## Performance Optimization

1. **Image Size**: Multi-stage build reduces final image size
2. **Caching**: Static assets are cached by nginx
3. **Compression**: Gzip compression enabled for text files
4. **Rate Limiting**: API requests are rate-limited to prevent abuse

## Scaling

For horizontal scaling, consider:
- Using a load balancer (nginx, HAProxy)
- Running multiple backend instances
- Using external MongoDB cluster
- Implementing Redis for session management
