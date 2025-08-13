import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/reactbit/Button';
import { Input } from '@/components/reactbit/Input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/reactbit/Card';
import { Badge } from '@/components/reactbit/Badge';
import { ThemeSelector } from '@/components/reactbit/ThemeSelector';
import { Shield, Lock, Eye, EyeOff, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';

export default function ChangePassword() {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSuccess, setIsSuccess] = useState(false);
  
  const { theme } = useTheme();
  const navigate = useNavigate();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.currentPassword) newErrors.currentPassword = 'Current password is required';
    if (!formData.newPassword) newErrors.newPassword = 'New password is required';
    else if (formData.newPassword.length < 8) newErrors.newPassword = 'Password must be at least 8 characters';
    else if (formData.newPassword === formData.currentPassword) newErrors.newPassword = 'New password must be different from current password';

    if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm your new password';
    else if (formData.newPassword !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      setIsSuccess(true);
      
      // Redirect after success
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (error) {
      setErrors({ submit: 'Failed to change password. Please try again.' });
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
              <CardTitle className="text-2xl font-bold text-foreground">Password Changed!</CardTitle>
              <CardDescription className="text-base mt-3">
                Your password has been successfully updated. You'll be redirected to the dashboard shortly.
              </CardDescription>
            </div>
          </CardHeader>
          
          <CardContent className="text-center">
            <Badge variant="success" size="lg" className="animate-pulse">
              Redirecting to Dashboard...
            </Badge>
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
              Change Password
            </CardTitle>
            <CardDescription className="text-base mt-3">
              Update your password to keep your account secure
            </CardDescription>
            <Badge variant="gradient" size="sm" className="mt-2">
              {theme.charAt(0).toUpperCase() + theme.slice(1).replace('-', ' ')} Theme
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {errors.submit && (
            <Card variant="outlined" className="border-red-200 bg-red-50/50">
              <CardContent className="p-3">
                <div className="flex items-center gap-2 text-red-700">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <p className="text-sm font-medium">{errors.submit}</p>
                </div>
              </CardContent>
            </Card>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="relative">
              <Input
                label="Current Password"
                type={showPasswords.current ? 'text' : 'password'}
                value={formData.currentPassword}
                onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                placeholder="Enter current password"
                required
                icon={<Lock className="w-4 h-4" />}
                error={errors.currentPassword}
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('current')}
                className="absolute right-3 top-9 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            
            <div className="relative">
              <Input
                label="New Password"
                type={showPasswords.new ? 'text' : 'password'}
                value={formData.newPassword}
                onChange={(e) => handleInputChange('newPassword', e.target.value)}
                placeholder="Enter new password"
                required
                icon={<Lock className="w-4 h-4" />}
                error={errors.newPassword}
                helperText="At least 8 characters, different from current password"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('new')}
                className="absolute right-3 top-9 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            
            <div className="relative">
              <Input
                label="Confirm New Password"
                type={showPasswords.confirm ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                placeholder="Confirm new password"
                required
                icon={<Lock className="w-4 h-4" />}
                error={errors.confirmPassword}
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('confirm')}
                className="absolute right-3 top-9 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            
            <Button
              type="submit"
              variant="default"
              size="lg"
              loading={isSubmitting}
              disabled={!formData.currentPassword || !formData.newPassword || !formData.confirmPassword}
              className="w-full bg-gradient-to-r from-primary to-primary-foreground shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5 transition-all duration-300"
            >
              {isSubmitting ? 'Updating Password...' : 'Update Password'}
            </Button>
          </form>
          
          <div className="text-center">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/dashboard')}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
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
