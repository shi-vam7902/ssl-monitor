import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/reactbit/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/reactbit/Card';
import { Badge } from '@/components/reactbit/Badge';
import { ThemeSelector } from '@/components/reactbit/ThemeSelector';
import { Shield, Home, ArrowLeft, AlertTriangle } from 'lucide-react';

export default function NotFound() {
  const { theme } = useTheme();

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
        className="w-full max-w-md backdrop-blur-sm border-0 text-center"
        animated
      >
        <CardHeader className="space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-xl">
            <AlertTriangle className="w-8 h-8 text-white" />
          </div>
          <div>
            <CardTitle className="text-4xl font-bold text-foreground mb-2">404</CardTitle>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-foreground bg-clip-text text-transparent">
              Page Not Found
            </CardTitle>
            <CardDescription className="text-base mt-3">
              The page you're looking for doesn't exist or has been moved.
            </CardDescription>
            <Badge variant="warning" size="sm" className="mt-2">
              {theme.charAt(0).toUpperCase() + theme.slice(1).replace('-', ' ')} Theme
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <Link to="/dashboard">
              <Button
                variant="default"
                size="lg"
                className="w-full bg-gradient-to-r from-primary to-primary-foreground shadow-lg hover:shadow-xl"
                icon={<Home className="w-4 h-4" />}
              >
                Go to Dashboard
              </Button>
            </Link>
            
            <Link to="/login">
              <Button
                variant="outline"
                size="lg"
                className="w-full"
                icon={<Shield className="w-4 h-4" />}
              >
                Go to Login
              </Button>
            </Link>
            
            <Button
              variant="ghost"
              onClick={() => window.history.back()}
              className="w-full text-muted-foreground hover:text-foreground"
              icon={<ArrowLeft className="w-4 h-4" />}
            >
              Go Back
            </Button>
          </div>
          
          <div className="pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground">
              SSL Monitor Dashboard - Secure Certificate Management
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Background decoration */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-1/2 -right-1/2 w-96 h-96 bg-gradient-to-bl from-orange-500/10 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute -bottom-1/2 -left-1/2 w-96 h-96 bg-gradient-to-tr from-red-500/10 to-transparent rounded-full blur-3xl"></div>
      </div>
    </div>
  );
}
