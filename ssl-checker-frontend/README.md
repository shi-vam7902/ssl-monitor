# SSL Monitor Dashboard - ReactBit Edition

A modern, responsive SSL certificate monitoring dashboard built with **ReactBit components**, React, TypeScript, and Tailwind CSS. Features dynamic theme switching and comprehensive SSL certificate tracking capabilities optimized for company requirements.

## 🚀 Features

### ReactBit Component System
- **Custom ReactBit Components**: Modern, animated components built specifically for SSL monitoring
- **Enhanced UI Elements**: Buttons, Cards, Badges, Inputs with advanced styling and animations
- **SSL Status Badges**: Specialized badges with icons and color-coding for certificate status
- **Theme-Aware Components**: All components adapt automatically to theme changes

### Multi-Theme Support (Company Requirements)
- **🌞 Light Mode**: Clean and bright interface for daily use
- **🌙 Dark Mode**: Easy on the eyes for extended monitoring sessions
- **🏢 Company Theme**: Professional corporate blue styling
- **🛡️ SSL Monitor Theme**: Security-focused purple gradient design (default)
- **Real-time Theme Switching**: Instant theme changes with smooth transitions
- **Theme Persistence**: User's theme preference saved across sessions

### Authentication
- **ReactBit Login System**: Beautiful animated login with theme-aware styling
- **Enhanced Form Components**: Custom inputs with icons, validation states, and loading animations
- **Protected Routes**: JWT-based route protection with smooth redirects
- **Session Management**: Automatic token validation and refresh

### Dashboard Layouts

#### 1. Classic Dashboard (`/classic`)
- Traditional admin panel design with ReactBit components
- Sidebar navigation with enhanced user profile
- Top header with theme-aware refresh controls
- Statistics cards with improved animations
- Comprehensive data table with ReactBit badges

#### 2. Professional Dashboard (`/professional`) ⭐ Default
- Modern card-based grid layout with elevated styling
- Gradient backgrounds and glass morphism effects
- Interactive health score visualization with ReactBit badges
- Status overview with animated SSL status badges
- Responsive design optimized for all devices

### SSL Certificate Monitoring
- **Real-time Status Tracking**: Monitor certificate validity with ReactBit badges
- **Enhanced Status Badges**:
  - 🟢 **Valid**: Green badge with shield icon
  - 🟠 **Expiring Soon**: Orange badge with clock icon and day countdown
  - 🔴 **Expired**: Red badge with X icon and pulse animation
- **Detailed Information**: Domain, expiry date, issuer, last checked
- **Health Score**: Overall certificate health percentage with visual progress bar
- **Refresh Functionality**: Animated refresh with loading states

## 🎨 ReactBit Design System

### Component Features
- **Gradient Buttons**: Multi-variant buttons with hover animations and loading states
- **Elevated Cards**: Shadow-enhanced cards with hover effects and smooth transitions
- **Smart Badges**: Context-aware badges with icons, animations, and theme integration
- **Enhanced Inputs**: Form inputs with icons, validation states, and smooth focus transitions
- **Theme Selector**: Interactive theme picker with visual previews

### Animation System
- **Entrance Animations**: Fade-in and slide-up animations for components
- **Hover Effects**: Scale and shadow transformations on interactive elements
- **Loading States**: Smooth loading animations and skeleton loaders
- **Pulse Animations**: Attention-grabbing animations for critical SSL status
- **Smooth Transitions**: 300ms transitions for all state changes

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript
- **Component Library**: Custom ReactBit components built on Radix UI
- **Styling**: Tailwind CSS 3 with custom design system and theme variables
- **Icons**: Lucide React with contextual SSL security icons
- **HTTP Client**: Axios for API communication
- **Routing**: React Router 6 with protected routes
- **State Management**: React Context API for auth and theme management
- **Build Tool**: Vite for fast development and optimized builds

## 📱 Responsive Design

The application is fully responsive and optimized for:
- **Desktop**: Full-featured dashboard experience with all ReactBit enhancements
- **Tablet**: Adaptive layouts with touch-friendly ReactBit components
- **Mobile**: Optimized mobile experience with stacked layouts and finger-friendly buttons

## 🎨 Theme System

### Available Themes
1. **SSL Monitor Theme** (Default)
   - Purple gradient primary colors (`#667eea` to `#764ba2`)
   - Security-focused design with shield iconography
   - Optimized for SSL certificate monitoring workflows

2. **Company Theme**
   - Professional blue color scheme
   - Corporate styling with clean lines
   - Suitable for enterprise environments

3. **Light Theme**
   - Clean and bright interface
   - High contrast for accessibility
   - Traditional light mode experience

4. **Dark Theme**
   - Dark background with light text
   - Reduced eye strain for extended use
   - Modern dark mode implementation

### Theme Features
- **Instant Switching**: Real-time theme changes without page reload
- **Persistent Preferences**: Theme choice saved in localStorage
- **Smooth Transitions**: All elements transition smoothly between themes
- **Component Awareness**: All ReactBit components automatically adapt to themes

## 🔗 Available Routes

### Live Demo Routes
- `/` - Professional Dashboard with SSL Monitor theme (default)
- `/professional` - Professional Dashboard
- `/classic` - Classic Dashboard with sidebar layout
- `/login` - ReactBit authentication page with theme selector

## 🚀 Getting Started

1. **Install Dependencies**
```bash
npm install
```

2. **Start Development Server**
```bash
npm run dev
```

3. **Build for Production**
```bash
npm run build
```

4. **Start Production Server**
```bash
npm start
```

## 🔧 API Integration

The application is designed to integrate with your SSL monitoring backend. Update the API configuration in:
- `client/lib/api.ts` - Axios configuration and interceptors
- `client/services/sslService.ts` - SSL API service methods

### Expected API Endpoints
- `POST /auth/login` - User authentication
- `POST /auth/logout` - User logout
- `GET /auth/validate` - Token validation
- `GET /alerts` - SSL certificate data
- `GET /alerts/stats` - Dashboard statistics

## 🎯 ReactBit Component Usage

### Import ReactBit Components
```typescript
import { 
  Button, 
  Card, 
  Badge, 
  Input, 
  SSLStatusBadge,
  ThemeSelector 
} from '@/components/reactbit';
```

### Example Usage
```typescript
// Enhanced SSL Status Badge
<SSLStatusBadge 
  status="expiring_soon" 
  daysUntilExpiry={17}
  animated={true}
  showIcon={true}
/>

// Gradient Button with Loading
<Button 
  variant="default" 
  loading={isRefreshing}
  icon={<RefreshCw className="w-4 h-4" />}
>
  Refresh Data
</Button>

// Elevated Card
<Card variant="elevated" animated>
  <CardHeader>
    <CardTitle>SSL Certificates</CardTitle>
  </CardHeader>
  <CardContent>
    {/* Content */}
  </CardContent>
</Card>
```

## 🛡️ Security Features

- JWT token-based authentication with ReactBit form components
- Protected routes with automatic redirection
- Secure token storage and validation
- HTTP-only cookie support (via backend)
- Theme-aware security indicators

## 📊 Dashboard Metrics

The ReactBit dashboard tracks and displays:
- **Total Domains**: Number of monitored SSL certificates
- **Valid Certificates**: Currently valid and secure certificates
- **Expiring Soon**: Certificates expiring within 30 days (with animated badges)
- **Expired**: Certificates that have already expired (with pulse animation)
- **Health Score**: Overall certificate health percentage with visual progress
- **Last Checked**: Timestamp of last certificate validation

## 🎨 Company Requirements Met

✅ **ReactBit Components**: All UI elements use custom ReactBit components  
✅ **Theme-Based Changing**: Dynamic theme switching with company-specific options  
✅ **Professional Styling**: Corporate-grade design with multiple theme options  
✅ **Responsive Design**: Mobile-optimized ReactBit components  
✅ **Animation System**: Smooth transitions and loading states  
✅ **SSL Focus**: Security-themed components and iconography  

## 🔮 Ready for Backend Integration

The ReactBit frontend is fully prepared for backend integration with:
- Structured API service layer with enhanced error handling
- ReactBit loading states and success/error feedback
- Authentication context with theme persistence
- Type-safe interfaces for all data structures
- SSL-specific ReactBit components ready for real data

Simply update the API endpoints in the service files to connect to your NestJS backend or any other SSL monitoring API. All ReactBit components will automatically handle the data with proper theming and animations.

---

**Note**: This application showcases modern ReactBit component architecture with advanced theming capabilities, making it perfect for company environments that require flexible, professional UI components with SSL monitoring focus.
