# SSL Certificate Monitor

A comprehensive SSL certificate monitoring system built with NestJS backend and React frontend. Monitor SSL certificates, get email alerts before expiration, and manage certificates with an intuitive dashboard.

## 🚀 Features

### Backend Features
- **SSL Certificate Monitoring**: Automated SSL certificate checking for multiple domains
- **Email Alerts**: Configurable email notifications for expiring/expired certificates
- **User Management**: Role-based access control with SUPER_ADMIN and ADMIN roles
- **Manual Renewal**: Trigger SSL certificate renewal/recheck manually
- **Cron Jobs**: Scheduled SSL monitoring and alert notifications
- **RESTful API**: Complete CRUD operations for SSL records and users
- **Database Seeding**: Automatic setup of default roles and super admin user

### Frontend Features
- **Modern UI**: Light-blue theme with rounded shadow cards
- **Dashboard**: Overview of SSL certificate status and statistics
- **SSL Management**: Add, edit, delete, and renew SSL certificates
- **User Management**: Create and manage users (SUPER_ADMIN only)
- **Alerts Log**: View SSL certificate alert history
- **Settings**: Configure application settings
- **Responsive Design**: Works on desktop and mobile devices

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn package manager

## 🛠️ Installation & Setup

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd ssl-checker-backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create environment file:**
   ```bash
   cp .env.example .env
   ```

4. **Configure environment variables in `.env`:**
   ```env
   # Database
   MONGO_DB_URI=mongodb://localhost:27017/ssl_checker
   
   # JWT
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRES_IN=24h
   
   # Super Admin
   SUPER_ADMIN_EMAIL=admin@example.com
   SUPER_ADMIN_PASSWORD=Admin#1234
   
   # SMTP Email
   SMTP_HOST=smtp.example.com
   SMTP_PORT=587
   SMTP_USER=smtp-user
   SMTP_PASS=smtp-pass
   SMTP_FROM=noreply@sslmonitor.com
   
   # Cron Schedule (runs daily at midnight)
   CRON_EXPRESSION=0 0 * * *
   ```

5. **Start MongoDB:**
   ```bash
   # Using Docker
   docker run -d -p 27017:27017 --name mongodb mongo:latest
   
   # Or start your local MongoDB service
   sudo systemctl start mongodb
   ```

6. **Start the backend server:**
   ```bash
   # Development mode
   npm run start:dev
   
   # Production mode
   npm run build
   npm run start:prod
   ```

7. **Seed the database (optional):**
   ```bash
   # The database will be automatically seeded on first startup
   # Or manually trigger seeding via API: POST /seeding/seed
   ```

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd ssl-checker-frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure API URL (if needed):**
   - Update `client/lib/api.ts` with your backend URL
   - Default: `http://localhost:3000`

4. **Start the frontend development server:**
   ```bash
   npm run dev
   ```

5. **Build for production:**
   ```bash
   npm run build
   ```

## 🔧 Configuration

### Environment Variables

#### Required Variables
- `MONGO_DB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT token generation
- `SUPER_ADMIN_EMAIL`: Default super admin email
- `SUPER_ADMIN_PASSWORD`: Default super admin password

#### Optional Variables
- `SMTP_*`: Email configuration for alerts
- `CRON_EXPRESSION`: Schedule for SSL monitoring (default: daily at midnight)
- `SSL_ALERT_THRESHOLD_DAYS`: Days before expiry to send alerts (default: 30)
- `ACME_*`: Configuration for automatic certificate renewal (future feature)

### Default Credentials
- **Email**: `admin@example.com` (or your configured `SUPER_ADMIN_EMAIL`)
- **Password**: `Admin#1234` (or your configured `SUPER_ADMIN_PASSWORD`)

⚠️ **Important**: Change the default credentials after first login!

## 📚 API Documentation

### Authentication
- `POST /auth/login` - Login with email/password
- `POST /auth/logout` - Logout current session

### SSL Management
- `POST /ssl` - Add domain to monitor
- `GET /ssl` - List SSL records (paginated)
- `GET /ssl/:id` - Get specific SSL record
- `PUT /ssl/:id` - Update SSL record
- `DELETE /ssl/:id` - Delete SSL record
- `POST /ssl/:id/renew` - Manual SSL renewal/recheck
- `GET /ssl/stats` - Dashboard statistics

### User Management (SUPER_ADMIN only)
- `POST /users` - Create new user
- `GET /users` - List users (paginated)
- `GET /users/:id` - Get specific user
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Deactivate user
- `GET /users/stats` - User statistics

### Database Seeding
- `POST /seeding/seed` - Initialize database
- `POST /seeding/reset` - Reset and reseed database

## 📮 Postman Collection

Import the provided Postman collection for easy API testing:

1. **Import Collection**: `SSL_Checker_API.postman_collection.json`
2. **Import Environment**: `SSL_Checker_Environment.postman_environment.json`
3. **Set Variables**:
   - `BASE_URL`: Your backend URL (e.g., `http://localhost:3000`)
   - `JWT_TOKEN`: Will be auto-set after login

### Using the Collection
1. Run the **Login** request first to authenticate
2. The JWT token will be automatically set for subsequent requests
3. Update placeholder IDs (USER_ID, SSL_RECORD_ID, etc.) with actual values from responses

## 🔄 SSL Monitoring

### How It Works
1. **Add Domains**: Add domains to monitor via API or frontend
2. **Automated Checking**: Cron job checks all domains based on `CRON_EXPRESSION`
3. **Status Updates**: SSL certificate status is updated in the database
4. **Email Alerts**: Notifications sent for expiring/expired certificates
5. **Manual Actions**: Users can manually trigger certificate checks/renewals

### Alert Thresholds
- **30 days**: First warning
- **15 days**: Second warning  
- **7 days**: Final warning
- **1 day**: Urgent alert
- **Expired**: Critical alert

### Manual Renewal
The manual renewal feature provides:
- **Certificate Recheck**: Updates certificate information from current certificate
- **Extensible Architecture**: Ready for ACME/Let's Encrypt integration
- **Status Tracking**: Records renewal attempts and results

## 🎨 Frontend Theme

The frontend uses a light-blue theme with:
- **Primary Color**: `#2EA7FF` (lightish-blue)
- **Cards**: Rounded corners with subtle shadows
- **Design**: Modern, clean, and responsive
- **Components**: Reusable UI components with consistent styling

## 🏗️ Architecture

### Backend Architecture
```
src/
├── config/           # Configuration and validation
├── constants/        # Application constants and permissions
├── middleware/       # JWT, RBAC, logging middleware
├── modules/          # Feature modules
│   ├── auth/         # Authentication
│   ├── ssl/          # SSL certificate management
│   ├── user/         # User management
│   ├── role/         # Role management
│   ├── cron-jobs/    # Scheduled tasks
│   └── seeding/      # Database seeding
├── schemas/          # MongoDB schemas
├── services/         # Shared services
└── utils/            # Utility functions
```

### Frontend Architecture
```
client/
├── components/       # React components
├── contexts/         # React contexts (Auth, Theme)
├── hooks/           # Custom React hooks
├── lib/             # Utility libraries
├── pages/           # Page components
├── services/        # API services
└── types/           # TypeScript types
```

## 🔐 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access Control**: SUPER_ADMIN and ADMIN roles
- **Password Hashing**: bcrypt with salt rounds
- **Input Validation**: Comprehensive validation using class-validator
- **CORS Protection**: Configurable CORS settings
- **Rate Limiting**: Protection against brute force attacks

## 🧪 Testing

### Backend Testing
```bash
cd ssl-checker-backend

# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

### Frontend Testing
```bash
cd ssl-checker-frontend

# Run tests
npm run test

# Run tests with coverage
npm run test:coverage
```

## 📈 Monitoring & Logging

- **Request Logging**: All API requests are logged
- **Error Handling**: Comprehensive error handling with proper HTTP status codes
- **Health Checks**: Built-in health check endpoints
- **Performance Monitoring**: Request timing and performance metrics

## 🚀 Deployment

### Backend Deployment
1. **Build the application:**
   ```bash
   npm run build
   ```

2. **Set production environment variables**

3. **Start with PM2:**
   ```bash
   npm run deploy:prod
   ```

### Frontend Deployment
1. **Build for production:**
   ```bash
   npm run build
   ```

2. **Deploy to static hosting** (Netlify, Vercel, etc.)

### Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose up -d
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Review the Postman collection for API examples

## 🔮 Future Enhancements

- **ACME Integration**: Automatic certificate renewal via Let's Encrypt
- **Multi-tenant Support**: Support for multiple organizations
- **Advanced Reporting**: Detailed SSL certificate reports and analytics
- **Slack/Teams Integration**: Notifications via messaging platforms
- **Certificate Upload**: Support for uploading and monitoring custom certificates
- **API Rate Limiting**: Enhanced security with rate limiting
- **Audit Logs**: Comprehensive audit trail for all actions
