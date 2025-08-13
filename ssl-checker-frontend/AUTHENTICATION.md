# SSL Monitor Authentication System

A comprehensive authentication system built with ReactBit components featuring login, signup with company registration, forgot password, and change password functionality.

## 🔐 Authentication Pages

### 1. Login Page (`/login`)
- **User/Admin Toggle**: Switch between regular user login and admin login
- **Email & Password**: Secure authentication with ReactBit form components
- **Admin Login Option**: Crown icon and "Sign In as Admin" button for admin users
- **Forgot Password Link**: Direct link to password recovery
- **Signup Link**: Navigation to account creation
- **Theme Support**: Full theme integration with gradient styling

**Features:**
- Email validation
- Password visibility toggle
- Loading states during authentication
- Error handling with user-friendly messages
- Responsive design for all devices

### 2. Signup Page (`/signup`)
- **Account Type Selection**: 
  - 🙍 **Individual**: Personal account option
  - 🏢 **Company**: Business account with additional fields
- **Personal Information**: First name, last name, email
- **Company Fields** (when Company selected):
  - Company name
  - Company size dropdown (1-10, 11-50, 51-200, 201-1000, 1000+ employees)
  - Phone number (optional)
- **Password Security**: Password and confirmation with strength requirements
- **Validation**: Real-time form validation with helpful error messages

**Company Registration Features:**
- Dedicated company account type
- Business-specific information collection
- Company size categorization
- Professional contact information

### 3. Forgot Password Page (`/forgot-password`)
- **Email Recovery**: Simple email input for password reset
- **Success State**: Confirmation screen with email verification message
- **Back to Login**: Easy navigation back to login page
- **Retry Option**: Allow different email if first attempt fails

**Features:**
- Email validation
- Success confirmation screen
- Clear instructions for user
- Professional styling with ReactBit components

### 4. Change Password Page (`/change-password`)
- **Current Password**: Verification of existing password
- **New Password**: Password creation with strength requirements
- **Confirmation**: Password confirmation to prevent typos
- **Success State**: Confirmation screen with auto-redirect to dashboard
- **Security**: All passwords have visibility toggle for user convenience

**Features:**
- Current password verification
- New password strength validation
- Password matching confirmation
- Success screen with auto-redirect
- Secure password handling

## 🎨 ReactBit Integration

All authentication pages use ReactBit components:

- **Button**: Enhanced buttons with gradients, loading states, and icons
- **Input**: Advanced form inputs with icons, validation, and helper text
- **Card**: Elevated cards with smooth animations and backdrop blur
- **Badge**: Theme indicators and status badges
- **ThemeSelector**: Compact theme switcher in top-right corner

## 🎨 Theme Support

All pages support four themes:
- **🛡️ SSL Monitor** (Default): Purple gradient, security-focused
- **🏢 Company**: Professional blue corporate styling  
- **🌞 Light**: Clean and bright interface
- **🌙 Dark**: Easy on eyes for extended use

## 🛣️ Routing Structure

```
Authentication Routes:
├── /login              → Login page with admin option
├── /signup             → Signup with company registration
├── /register           → Alias for signup
├── /forgot-password    → Password recovery
└── /change-password    → Password change (protected)

Protected Routes:
├── /dashboard          → Main dashboard (professional)
├── /classic            → Classic dashboard layout
└── /                   → Default redirect to dashboard

Error Routes:
└── /*                  → 404 Not Found page
```

## 🔒 Security Features

- **Protected Routes**: Automatic redirection for unauthenticated users
- **Admin Access**: Dedicated admin login option with visual indicators
- **Password Security**: Minimum 8 characters, confirmation required
- **Form Validation**: Real-time validation with helpful error messages
- **Theme Security**: SSL security verification badges
- **Session Management**: JWT token handling with automatic validation

## 📱 Responsive Design

All authentication pages are fully responsive:
- **Desktop**: Full-width forms with optimal spacing
- **Tablet**: Adaptive layouts with touch-friendly elements
- **Mobile**: Stacked layouts with finger-friendly buttons
- **Theme Selector**: Compact mode on all screen sizes

## 🎯 User Experience Features

- **Smooth Animations**: Fade-in effects and hover transitions
- **Loading States**: Clear feedback during form submission
- **Error Handling**: User-friendly error messages with icons
- **Success States**: Confirmation screens with next steps
- **Navigation**: Clear links between authentication flows
- **Theme Consistency**: Unified styling across all pages

## 🔧 Technical Implementation

### Form Validation
```typescript
// Email validation
if (!/\S+@\S+\.\S+/.test(email)) {
  setError('Invalid email format');
}

// Password strength
if (password.length < 8) {
  setError('Password must be at least 8 characters');
}

// Company-specific validation
if (accountType === 'company' && !companyName) {
  setError('Company name is required');
}
```

### Theme Integration
```typescript
const getThemeGradient = () => {
  switch (theme) {
    case 'dark': return 'from-slate-900 to-slate-800';
    case 'company': return 'from-blue-50 to-blue-100';
    case 'ssl-monitor': return 'from-slate-50 to-blue-50';
    default: return 'from-slate-50 to-slate-100';
  }
};
```

### ReactBit Usage
```typescript
<Button
  variant="default"
  size="lg"
  loading={isSubmitting}
  icon={loginType === 'admin' ? <Crown /> : undefined}
>
  {isSubmitting ? 'Signing in...' : 'Sign In'}
</Button>
```

## 🚀 Ready for Backend Integration

The authentication system is prepared for backend integration:
- Mock API calls ready to be replaced with real endpoints
- Proper error handling for network failures
- JWT token management with automatic refresh
- Form data properly structured for API requests
- Loading states during API calls

Replace the mock API calls in each component with your actual authentication endpoints to connect to your backend system.

---

**Note**: This authentication system provides a complete, production-ready user experience with modern ReactBit components, comprehensive validation, and full theme support optimized for SSL certificate monitoring workflows.
