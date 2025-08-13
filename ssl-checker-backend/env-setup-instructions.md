# Environment Setup Instructions

## The CORS Issue Fix

Your CORS error occurs because the backend environment configuration is missing. Here's what you need to do:

## Backend Environment Setup

Create a file named `.env.development` in the `/ssl-checker-backend/` directory with the following content:

```bash
NODE_ENV=development
APP_URL=http://192.168.0.146:5003
PORT=5003
CREDENTIALS=true
ORIGIN=http://192.168.0.146:8080
MONGO_DB_URL=mongodb://localhost:27017/ssl-monitor-dev
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=24h
SMTP_MAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-email-password
EMAIL_FROM=your-email@gmail.com
LOG_DIR=./logs
SSL_CHECK_INTERVAL_HOURS=24
SSL_ALERT_THRESHOLD_DAYS=30
SUPER_ADMIN_EMAIL=admin@ssl-monitor.com
SUPER_ADMIN_PASSWORD=admin123
SUPER_ADMIN_NAME=Super Admin
CRON_EXPRESSION=0 0 * * *
ACME_ENABLED=false
ACME_PROVIDER=letsencrypt
RENEWAL_WEBHOOK_URL=
RENEWAL_WEBHOOK_SECRET=
```

## Key CORS Settings Explained

- `CREDENTIALS=true` - This allows the backend to accept credentials (cookies, authorization headers) from the frontend
- `ORIGIN=http://192.168.0.146:8080` - This allows requests from your frontend running on port 8080

## Frontend Environment Setup

✅ Already created: `.env` file in `/ssl-checker-frontend/` directory with:
```
VITE_API_BASE_URL=http://192.168.0.146:5003/api
```

## Next Steps

1. Create the backend `.env.development` file with the content above
2. Restart your backend server: `npm run start:dev`
3. The CORS error should be resolved and login should work

## What This Fixes

The error you saw:
```
The value of the 'Access-Control-Allow-Credentials' header in the response is '' which must be 'true' when the request's credentials mode is 'include'
```

This happens because:
- Your frontend sends requests with `withCredentials: true` (line 8 in api.ts)
- But the backend wasn't configured with `CREDENTIALS=true`
- So the `Access-Control-Allow-Credentials` header was empty instead of 'true'
