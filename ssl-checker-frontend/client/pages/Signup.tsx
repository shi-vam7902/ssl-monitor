import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/reactbit/Button';
import { Input } from '@/components/reactbit/Input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/reactbit/Card';
import { Badge } from '@/components/reactbit/Badge';
import { ThemeSelector } from '@/components/reactbit/ThemeSelector';
import { 
  Shield, 
  Mail, 
  Lock, 
  User, 
  Building, 
  Phone, 
  Eye, 
  EyeOff, 
  CheckCircle,
  AlertCircle 
} from 'lucide-react';

export default function Signup() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    accountType: 'individual' as 'individual' | 'company',
    companyName: '',
    companySize: '',
    phone: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const { theme } = useTheme();
  const navigate = useNavigate();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email format';

    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';

    if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
    else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';

    if (!formData.firstName) newErrors.firstName = 'First name is required';
    if (!formData.lastName) newErrors.lastName = 'Last name is required';

    if (formData.accountType === 'company') {
      if (!formData.companyName) newErrors.companyName = 'Company name is required';
      if (!formData.companySize) newErrors.companySize = 'Company size is required';
    }

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
      
      // Simulate successful signup
      alert('Account created successfully! Please check your email for verification.');
      navigate('/login');
    } catch (error) {
      setErrors({ submit: 'Failed to create account. Please try again.' });
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

  return (
    <div className={`min-h-screen bg-gradient-to-br ${getThemeGradient()} flex items-center justify-center p-4 relative`}>
      {/* Theme Selector */}
      <div className="absolute top-4 right-4">
        <ThemeSelector compact />
      </div>

      <Card 
        variant="elevated" 
        className="w-full max-w-2xl backdrop-blur-sm border-0"
        animated
      >
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary to-primary-foreground rounded-2xl flex items-center justify-center shadow-xl">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-foreground bg-clip-text text-transparent">
              Create Account
            </CardTitle>
            <CardDescription className="text-base mt-3 font-medium">
              Join SSL Monitor to secure your digital certificates
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

          {/* Account Type Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground">Account Type</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleInputChange('accountType', 'individual')}
                className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                  formData.accountType === 'individual'
                    ? 'border-primary bg-primary/10 shadow-md'
                    : 'border-border/20 hover:border-primary/40'
                }`}
              >
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-primary" />
                  <div className="text-left">
                    <p className="font-medium text-foreground">Individual</p>
                    <p className="text-xs text-muted-foreground">Personal account</p>
                  </div>
                </div>
              </button>
              
              <button
                type="button"
                onClick={() => handleInputChange('accountType', 'company')}
                className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                  formData.accountType === 'company'
                    ? 'border-primary bg-primary/10 shadow-md'
                    : 'border-border/20 hover:border-primary/40'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Building className="w-5 h-5 text-primary" />
                  <div className="text-left">
                    <p className="font-medium text-foreground">Company</p>
                    <p className="text-xs text-muted-foreground">Business account</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Personal Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="First Name"
                type="text"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                placeholder="John"
                required
                icon={<User className="w-4 h-4" />}
                error={errors.firstName}
              />
              
              <Input
                label="Last Name"
                type="text"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                placeholder="Doe"
                required
                icon={<User className="w-4 h-4" />}
                error={errors.lastName}
              />
            </div>

            {/* Company Information (if company account) */}
            {formData.accountType === 'company' && (
              <>
                <Input
                  label="Company Name"
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => handleInputChange('companyName', e.target.value)}
                  placeholder="Acme Corporation"
                  required
                  icon={<Building className="w-4 h-4" />}
                  error={errors.companyName}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">
                      Company Size
                    </label>
                    <select
                      value={formData.companySize}
                      onChange={(e) => handleInputChange('companySize', e.target.value)}
                      className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      required
                    >
                      <option value="">Select size</option>
                      <option value="1-10">1-10 employees</option>
                      <option value="11-50">11-50 employees</option>
                      <option value="51-200">51-200 employees</option>
                      <option value="201-1000">201-1000 employees</option>
                      <option value="1000+">1000+ employees</option>
                    </select>
                    {errors.companySize && (
                      <p className="text-xs mt-1.5 text-red-500">{errors.companySize}</p>
                    )}
                  </div>
                  
                  <Input
                    label="Phone Number"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="+1 (555) 123-4567"
                    icon={<Phone className="w-4 h-4" />}
                  />
                </div>
              </>
            )}

            <Input
              label="Email Address"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="john@company.com"
              required
              icon={<Mail className="w-4 h-4" />}
              error={errors.email}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="Create password"
                  required
                  icon={<Lock className="w-4 h-4" />}
                  error={errors.password}
                  helperText="At least 8 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-9 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              
              <div className="relative">
                <Input
                  label="Confirm Password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  placeholder="Confirm password"
                  required
                  icon={<Lock className="w-4 h-4" />}
                  error={errors.confirmPassword}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-9 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            
            <Button
              type="submit"
              variant="default"
              size="lg"
              loading={isSubmitting}
              className="w-full bg-gradient-to-r from-primary to-primary-foreground shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5 transition-all duration-300"
            >
              {isSubmitting ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>
          
          <div className="text-center space-y-3">
            <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link to="/login" className="text-primary hover:text-primary/80 font-medium transition-colors">
                Sign in here
              </Link>
            </p>
            <div className="flex items-center justify-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <Badge variant="ghost" size="sm">
                SSL Security Verified
              </Badge>
            </div>
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
