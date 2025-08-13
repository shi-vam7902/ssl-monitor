import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/reactbit/Button';
import { Input } from '@/components/reactbit/Input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/reactbit/Card';
import { Badge } from '@/components/reactbit/Badge';
import { ThemeSelector } from '@/components/reactbit/ThemeSelector';
import { Shield, Mail, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const { theme } = useTheme();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      setIsSuccess(true);
    } catch (error) {
      setError('Failed to send reset email. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getThemeGradient = () => {
    switch (theme) {
      case 'dark':
        return 'from-slate-900 to-slate-800';
      case 'company':
        return 'from-blue-50 to-blue-100';
      case 'ssl-monitor':
        return 'from-slate-50 to-blue-50';
      default:
        return 'from-slate-50 to-slate-100';
    }
  };

  if (isSuccess) {
    return (
      <div className={`min-h-screen bg-gradient-to-br ${getThemeGradient()} flex items-center justify-center p-4 relative`}>
        <div className="absolute top-4 right-4">
          <ThemeSelector compact />
        </div>

        <Card variant="elevated" className="w-full max-w-md backdrop-blur-sm border-0" animated>
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-xl">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-foreground">Check Your Email</CardTitle>
              <CardDescription className="text-base mt-3">
                We've sent a password reset link to{' '}
                <span className="font-medium text-primary">{email}</span>
              </CardDescription>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                Didn't receive the email? Check your spam folder or try again.
              </p>
              
              <Button
                variant="outline"
                onClick={() => setIsSuccess(false)}
                className="w-full"
              >
                Try Different Email
              </Button>
              
              <Link to="/login">
                <Button variant="ghost" className="w-full">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Login
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

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
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-foreground bg-clip-text text-transparent">
              Reset Password
            </CardTitle>
            <CardDescription className="text-base mt-3">
              Enter your email address and we'll send you a link to reset your password.
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
              helperText="We'll send reset instructions to this email"
            />
            
            <Button
              type="submit"
              variant="default"
              size="lg"
              loading={isSubmitting}
              disabled={!email}
              className="w-full bg-gradient-to-r from-primary to-primary-foreground shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5 transition-all duration-300"
            >
              {isSubmitting ? 'Sending...' : 'Send Reset Link'}
            </Button>
          </form>
          
          <div className="text-center">
            <Link to="/login">
              <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Login
              </Button>
            </Link>
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
