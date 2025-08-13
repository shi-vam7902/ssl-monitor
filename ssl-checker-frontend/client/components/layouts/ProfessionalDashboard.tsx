import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { SSLStatusBadge } from '@/components/SSLStatusBadge';
import { sslService } from '@/services/sslService';
import { SSLAlert, DashboardStats, DashboardLayout } from '@/types/ssl';
import { 
  Shield, 
  LogOut, 
  RefreshCw, 
  Settings, 
  CheckCircle,
  Clock,
  XCircle,
  Monitor,
  TrendingUp,
  Activity,
  AlertTriangle,
  Grid3X3
} from 'lucide-react';

interface ProfessionalDashboardProps {
  onLayoutChange: (layout: DashboardLayout) => void;
}

export const ProfessionalDashboard: React.FC<ProfessionalDashboardProps> = ({ onLayoutChange }) => {
  const { logout, user } = useAuth();
  const [alerts, setAlerts] = useState<SSLAlert[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [alertsData, statsData] = await Promise.all([
        sslService.getAlerts(),
        sslService.getDashboardStats()
      ]);
      setAlerts(alertsData);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
    setIsRefreshing(false);
  };

  const handleLogout = async () => {
    await logout();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusVariant = (status: SSLAlert['status']) => {
    switch (status) {
      case 'valid': return 'default';
      case 'expiring_soon': return 'secondary';
      case 'expired': return 'destructive';
      default: return 'outline';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Top Navigation */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-800">SSL Monitor</h1>
                  <p className="text-xs text-slate-500">Professional Dashboard</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button 
                variant="outline"
                size="sm"
                onClick={() => onLayoutChange('classic')}
                className="hidden md:flex"
              >
                <Grid3X3 className="w-4 h-4 mr-2" />
                Classic View
              </Button>
              
              <Button 
                onClick={handleRefresh}
                disabled={isRefreshing}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              
              <div className="flex items-center gap-2 pl-3 border-l border-slate-200">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-white">
                    {user?.email.charAt(0).toUpperCase()}
                  </span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleLogout}
                  className="text-slate-500 hover:text-red-600"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="p-6 space-y-6">
        {/* Health Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-blue-50/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Total Domains</CardTitle>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Monitor className="h-5 w-5 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-800">{stats?.totalDomains}</div>
              <p className="text-xs text-slate-500 mt-1">SSL certificates monitored</p>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-green-50/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Valid Certificates</CardTitle>
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{stats?.validCertificates}</div>
              <p className="text-xs text-slate-500 mt-1">Active and secure</p>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-orange-50/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Expiring Soon</CardTitle>
              <div className="p-2 bg-orange-100 rounded-lg">
                <Clock className="h-5 w-5 text-orange-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">{stats?.expiringSoon}</div>
              <p className="text-xs text-slate-500 mt-1">Requires attention</p>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-red-50/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Expired</CardTitle>
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{stats?.expired}</div>
              <p className="text-xs text-slate-500 mt-1">Immediate action needed</p>
            </CardContent>
          </Card>
        </div>

        {/* Status Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-600" />
                SSL Certificate Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {alerts.slice(0, 3).map((alert) => (
                  <div key={alert.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-gradient-to-br from-blue-500 to-purple-500"></div>
                      <div>
                        <p className="font-medium text-slate-800">{alert.domain}</p>
                        <p className="text-sm text-slate-500">Expires {formatDate(alert.expiryDate)}</p>
                      </div>
                    </div>
                    <SSLStatusBadge status={alert.status} daysUntilExpiry={alert.daysUntilExpiry} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                Health Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-4xl font-bold text-green-600 mb-2">
                  {Math.round(((stats?.validCertificates || 0) / (stats?.totalDomains || 1)) * 100)}%
                </div>
                <p className="text-sm text-slate-500 mb-4">Overall certificate health</p>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-500"
                    style={{ 
                      width: `${((stats?.validCertificates || 0) / (stats?.totalDomains || 1)) * 100}%` 
                    }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Certificate Table */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-600" />
              All SSL Certificates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-200">
                    <TableHead className="font-semibold">Domain</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Expiry Date</TableHead>
                    <TableHead className="font-semibold">Days Until Expiry</TableHead>
                    <TableHead className="font-semibold">Issuer</TableHead>
                    <TableHead className="font-semibold">Last Checked</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {alerts.map((alert) => (
                    <TableRow key={alert.id} className="border-slate-100 hover:bg-slate-50/50">
                      <TableCell className="font-medium text-slate-800">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-gradient-to-br from-blue-500 to-purple-500"></div>
                          {alert.domain}
                        </div>
                      </TableCell>
                      <TableCell>
                        <SSLStatusBadge 
                          status={alert.status} 
                          daysUntilExpiry={alert.daysUntilExpiry}
                        />
                      </TableCell>
                      <TableCell className="text-slate-600">
                        {formatDate(alert.expiryDate)}
                      </TableCell>
                      <TableCell>
                        <span className={`font-medium ${
                          alert.daysUntilExpiry < 0 ? 'text-red-600' :
                          alert.daysUntilExpiry < 30 ? 'text-orange-600' :
                          'text-green-600'
                        }`}>
                          {alert.daysUntilExpiry < 0 ? 
                            `${Math.abs(alert.daysUntilExpiry)} days ago` : 
                            `${alert.daysUntilExpiry} days`
                          }
                        </span>
                      </TableCell>
                      <TableCell className="text-slate-600">{alert.issuer}</TableCell>
                      <TableCell className="text-slate-500 text-sm">
                        {formatDate(alert.lastChecked)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
