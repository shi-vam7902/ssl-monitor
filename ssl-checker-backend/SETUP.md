# SSL Monitor Backend Setup Guide

## ✅ Status: All TypeScript errors fixed and build successful!

## 🚀 Getting Started

### 1. Install MongoDB

**Option A: Using Docker (Recommended)**
```bash
docker run -d --name mongodb -p 27017:27017 mongo:latest
```

**Option B: Native Installation (Ubuntu/Debian)**
```bash
sudo apt update
sudo apt install -y mongodb
sudo systemctl start mongodb
sudo systemctl enable mongodb
```

### 2. Create Environment File

Create `.env.development` file with this content:

```env
# Environment Configuration
NODE_ENV=development
PORT=5001

# MongoDB Configuration
MONGO_DB_URL=mongodb://localhost:27017/ssl-monitor

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here-change-this-in-production
JWT_EXPIRES_IN=7d

# Email Configuration (Configure with your email provider)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=your-email@gmail.com

# Application Configuration
APP_URL=http://localhost:5001
ORIGIN=http://localhost:3000,http://localhost:3001
CREDENTIALS=true

# Logging
LOG_DIR=./logs

# SSL Check Configuration
SSL_CHECK_INTERVAL_HOURS=24
SSL_ALERT_THRESHOLD_DAYS=30
```

### 3. Start the Application

```bash
npm run start:dev
```

### 4. Access the API

- **API Base URL:** `http://localhost:5001/api`
- **Swagger Documentation:** `http://localhost:5001/swagger`

### 5. Default Super Admin Account

After the database seeds, use these credentials:
- **Email:** `superadmin@sslmonitor.com`
- **Password:** `SuperAdmin123!`

⚠️ **Change this password after first login!**

## 📊 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/create-user` - Create user (SUPER_ADMIN)
- `GET /api/auth/profile` - Get user profile

### SSL Monitoring
- `GET /api/alerts` - Get monitored domains
- `POST /api/alerts` - Add domain to monitor (SUPER_ADMIN)
- `POST /api/alerts/check-domain` - Check single domain SSL
- `GET /api/alerts/dashboard/stats` - Dashboard statistics

### User Management
- `GET /api/users` - Get all users (SUPER_ADMIN)
- `POST /api/users` - Create user (SUPER_ADMIN)

## 🔧 Features Implemented

✅ **MongoDB Integration** - Mongoose schemas and connection  
✅ **JWT Authentication** - Secure token-based auth  
✅ **Role-Based Access Control** - SUPER_ADMIN and ADMIN roles  
✅ **SSL Certificate Monitoring** - Automatic domain SSL checking  
✅ **Email Alerts** - Notifications for expiring certificates  
✅ **Cron Jobs** - Scheduled SSL certificate checks  
✅ **Dashboard Statistics** - Real-time monitoring overview  
✅ **API Documentation** - Complete Swagger documentation  
✅ **Database Seeding** - Auto-initialization with default data  

## 🛠 Troubleshooting

### MongoDB Connection Issues
```bash
# Check if MongoDB is running
sudo systemctl status mongodb
# Or for Docker
docker ps | grep mongodb
```

### Port Already in Use
```bash
# Kill process on port 5001
sudo lsof -t -i:5001 | xargs kill
```

### Environment Variables
Make sure your `.env.development` file exists and has all required variables.

## 📈 Next Steps

1. Configure email settings for SSL alerts
2. Set up SSL domains to monitor
3. Configure cron job schedules as needed
4. Set up production environment
5. Deploy to your preferred hosting platform

The SSL Monitor backend is now ready for use! 🎉
