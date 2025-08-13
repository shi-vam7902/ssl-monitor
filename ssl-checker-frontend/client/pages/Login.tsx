import React, { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/reactbit/Button';
import { Input } from '@/components/reactbit/Input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/reactbit/Card';
import { Badge } from '@/components/reactbit/Badge';
import { ThemeSelector } from '@/components/reactbit/ThemeSelector';
import { Shield, AlertCircle, Eye, EyeOff, Mail, Lock, Crown, User } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [loginType, setLoginType] = useState<'user' | 'admin'>('user');
  
  const { login, user } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await login(email, password);
      navigate('/dashboard', { replace: true });
    } catch (error: any) {
      setError(
        error?.response?.data?.message || 
        'Login failed. Please check your credentials.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const getThemeGradient = () => {
    switch (theme) {
      case 'dark':
        return 'from-slate-900 to-slate-800';
      case 'light':
        return 'from-slate-50 to-slate-100';
      default:
        return 'from-slate-50 to-slate-100';
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${getThemeGradient()} flex items-center justify-center p-4 relative`}>
      {/* Theme Selector */}
      <div className="absolute top-4 right-4">
        <ThemeSelector compact />
      </div>

      <Card 
        variant="elevated" 
        className="w-full max-w-md backdrop-blur-sm border-0"
        animated
      >
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary to-primary-foreground rounded-2xl flex items-center justify-center shadow-xl">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-foreground bg-clip-text text-transparent">
              SSL Monitor
            </CardTitle>
            <CardDescription className="text-base mt-3 font-medium">
              Sign in to access your SSL monitoring dashboard
            </CardDescription>
            <Badge variant="gradient" size="sm" className="mt-2">
              {theme.charAt(0).toUpperCase() + theme.slice(1).replace('-', ' ')} Theme
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {error && (
            <Card variant="outlined" className="border-red-200 bg-red-50/50">
              <CardContent className="p-3">
                <div className="flex items-center gap-2 text-red-700">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <p className="text-sm font-medium">{error}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Login Type Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground">Login Type</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setLoginType('user')}
                className={`p-3 rounded-xl border-2 transition-all duration-200 ${
                  loginType === 'user'
                    ? 'border-primary bg-primary/10 shadow-md'
                    : 'border-border/20 hover:border-primary/40'
                }`}
              >
                <div className="flex items-center gap-2 justify-center">
                  <User className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">User</span>
                </div>
              </button>
              
              <button
                type="button"
                onClick={() => setLoginType('admin')}
                className={`p-3 rounded-xl border-2 transition-all duration-200 ${
                  loginType === 'admin'
                    ? 'border-primary bg-primary/10 shadow-md'
                    : 'border-border/20 hover:border-primary/40'
                }`}
              >
                <div className="flex items-center gap-2 justify-center">
                  <Crown className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">Admin</span>
                </div>
              </button>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              icon={<Mail className="w-4 h-4" />}
              iconPosition="left"
              size="lg"
              className="transition-all duration-200"
            />
            
            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                icon={<Lock className="w-4 h-4" />}
                iconPosition="left"
                size="lg"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            <div className="text-right">
              <Link 
                to="/forgot-password" 
                className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            
            <Button
              type="submit"
              variant="default"
              size="lg"
              loading={isSubmitting}
              disabled={!email || !password}
              className="w-full bg-gradient-to-r from-primary to-primary-foreground shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5 transition-all duration-300"
              icon={loginType === 'admin' ? <Crown className="w-4 h-4" /> : undefined}
            >
              {isSubmitting ? 'Signing in...' : `Sign In ${loginType === 'admin' ? 'as Admin' : ''}`}
            </Button>
          </form>
          
          <div className="text-center space-y-3">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Link to="/signup" className="text-primary hover:text-primary/80 font-medium transition-colors">
                Sign up here
              </Link>
            </p>
            <Badge variant="ghost" size="sm">
              Secure Authentication
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Background decoration */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-1/2 -right-1/2 w-96 h-96 bg-gradient-to-bl from-primary/10 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute -bottom-1/2 -left-1/2 w-96 h-96 bg-gradient-to-tr from-primary/10 to-transparent rounded-full blur-3xl"></div>
      </div>
    </div>
  );
}
