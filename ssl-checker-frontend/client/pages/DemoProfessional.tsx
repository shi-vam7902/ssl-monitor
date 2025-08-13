import React, { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/reactbit/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/reactbit/Card';
import { Badge } from '@/components/reactbit/Badge';
import { SSLStatusBadge } from '@/components/reactbit/SSLStatusBadge';
// Theme controls removed per request
import { AddDomainModal } from '@/components/AddDomainModal';
import { ExpiredHistoryModal } from '@/components/ExpiredHistoryModal';
import { SSLCertificateModal } from '@/components/SSLCertificateModal';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { sslService } from '@/services/sslService';
import { toast } from '@/hooks/use-toast';
import { SSLAlert, DashboardStats } from '@/types/ssl';
import { 
  Shield, 
  LogOut, 
  RefreshCw, 
  CheckCircle,  
  Clock,
  XCircle,
  Monitor,
  TrendingUp,
  Activity,
  
  
  Plus,
  History,
  Trash2,
  Loader2,
  AlertCircle,
  Eye
} from 'lucide-react';

type Theme = 'dark' | 'company' | 'ssl-monitor';

export default function DemoProfessional() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const [environmentFilter, setEnvironmentFilter] = useState<'all' | 'development' | 'staging' | 'production'>('all');
  const [showAddDomainModal, setShowAddDomainModal] = useState(false);
  const [showExpiredHistoryModal, setShowExpiredHistoryModal] = useState(false);
  const [alerts, setAlerts] = useState<SSLAlert[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalDomains: 0,
    validCertificates: 0,
    expiringSoon: 0,
    expired: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const { theme } = useTheme();
  const { user, logout } = useAuth();

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, [environmentFilter]);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      loadData();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const [alertsData, statsData] = await Promise.all([
        sslService.getAlerts(environmentFilter === 'all' ? undefined : { environment: environmentFilter } as any),
        sslService.getSSLStatsByEnvironment(environmentFilter === 'all' ? undefined : environmentFilter)
      ]);
      
      setAlerts(alertsData);
      setStats(statsData);
      if (alertsData.length === 0) {
        toast({ title: 'No domains yet', description: 'Use "Add New Domain" to start monitoring.' });
      }
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load SSL data');
      toast({ title: 'Load failed', description: 'Could not load data from server.', variant: 'destructive' as any });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await sslService.refreshAllDomains();
      await loadData();
      toast({ title: 'Refreshed', description: 'All domains have been rechecked.' });
    } catch (err) {
      console.error('Error refreshing:', err);
      setError('Failed to refresh SSL data');
      toast({ title: 'Refresh failed', description: 'Unable to recheck domains.', variant: 'destructive' as any });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleDeleteAlert = async (id: string) => {
    if (!confirm('Are you sure you want to remove this domain from monitoring?')) {
      return;
    }

    try {
      await sslService.deleteAlert(id);
      await loadData();
      toast({ title: 'Removed', description: 'Domain removed from monitoring.' });
    } catch (err) {
      console.error('Error deleting alert:', err);
      setError('Failed to delete domain');
      toast({ title: 'Remove failed', description: 'Unable to remove domain.', variant: 'destructive' as any });
    }
  };

  const handleRefreshDomain = async (id: string) => {
    try {
      await sslService.refreshDomain(id);
      await loadData();
      toast({ title: 'Rechecked', description: 'Domain was successfully rechecked.' });
    } catch (err) {
      console.error('Error refreshing domain:', err);
      setError('Failed to refresh domain');
      toast({ title: 'Recheck failed', description: 'Unable to recheck domain.', variant: 'destructive' as any });
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast({ title: 'Logged out', description: 'You have been successfully logged out.' });
    } catch (err) {
      console.error('Error logging out:', err);
      toast({ title: 'Logout failed', description: 'Could not log out properly.', variant: 'destructive' as any });
    }
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

  const validCerts = alerts.filter(cert => cert.status === 'valid').length;
  const totalCerts = alerts.length;
  const healthScore = totalCerts > 0 ? Math.round((validCerts / totalCerts) * 100) : 0;

  const getThemeGradient = () => {
    switch (theme) {
      case 'dark':
        return 'from-slate-900 to-slate-800';
      case 'company' as Theme :
        return 'from-blue-50 to-blue-100';
      case 'ssl-monitor' as Theme:
        return 'from-slate-50 to-blue-50';
      default:
        return 'from-slate-50 to-blue-50';
    }
  };

  if (isLoading) {
    return (
      <div className={`min-h-screen bg-gradient-to-br ${getThemeGradient()} flex items-center justify-center`}>
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading SSL Monitor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br ${getThemeGradient()}`}>
      {/* Top Navigation */}
      <header className="bg-card/80 backdrop-blur-sm shadow-sm border-b border-border/50 sticky top-0 z-50">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-foreground rounded-xl flex items-center justify-center shadow-lg">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">SSL Monitor</h1>
                <p className="text-sm text-muted-foreground">Professional Dashboard</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-sm text-muted-foreground hidden md:block">
                IST: {new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute:'2-digit', second: '2-digit', year:'numeric', month:'short', day:'numeric' })}
              </div>
              
              <Button 
                onClick={handleRefresh}
                loading={isRefreshing}
                size="sm"
                variant="default"
                className="shadow-lg"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh All
              </Button>
              
              <div className="flex items-center gap-2 pl-4 border-l border-border">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-foreground rounded-full flex items-center justify-center shadow-md">
                  <span className="text-sm font-medium text-white">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <div className="flex flex-col text-xs">
                  <span className="font-medium">{user?.name || 'User'}</span>
                  <span className="text-muted-foreground">{user?.role?.name || 'Role'}</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleLogout}
                  className="text-muted-foreground hover:text-destructive"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Left Sidebar */}
      <aside className="fixed left-0 top-[72px] bottom-0 w-64 border-r border-border/50 bg-card/60 backdrop-blur-sm hidden md:block">
        <div className="p-4 space-y-6">
          <div>
            <h3 className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Servers Environment</h3>
            <div className="space-y-2">
              {(['all','development','staging','production'] as const).map((env) => (
                <button
                  key={env}
                  onClick={() => setEnvironmentFilter(env)}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm ${environmentFilter === env ? 'bg-primary/10 text-primary' : 'hover:bg-muted/40'}`}
                >
                  {env[0].toUpperCase() + env.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Company</h3>
            <div className="space-y-2">
              <button className="w-full text-left px-3 py-2 rounded-md text-sm hover:bg-muted/40">Overview</button>
              <button className="w-full text-left px-3 py-2 rounded-md text-sm hover:bg-muted/40">Teams</button>
              <button className="w-full text-left px-3 py-2 rounded-md text-sm hover:bg-muted/40">Settings</button>
            </div>
          </div>
          <div>
            <h3 className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Help & Support</h3>
            <div className="space-y-2">
              <a href="https://letsencrypt.org/docs/" target="_blank" className="block px-3 py-2 rounded-md text-sm hover:bg-muted/40">SSL Docs</a>
              <a href="https://developer.mozilla.org/en-US/docs/Web/Security/Transport_Layer_Security" target="_blank" className="block px-3 py-2 rounded-md text-sm hover:bg-muted/40">TLS Guide</a>
              <a href="mailto:support@example.com" className="block px-3 py-2 rounded-md text-sm hover:bg-muted/40">Contact Support</a>
            </div>
          </div>
        </div>
      </aside>

      {/* Add Domain Modal */}
      <AddDomainModal
        isOpen={showAddDomainModal}
        onClose={() => setShowAddDomainModal(false)}
        onSuccess={loadData}
      />

      {/* Expired History Modal */}
      <ExpiredHistoryModal
        isOpen={showExpiredHistoryModal}
        onClose={() => setShowExpiredHistoryModal(false)}
      />

      <div className="md:ml-64 p-8 space-y-8">
        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-red-700">{error}</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setError('')}
              className="ml-auto"
            >
              ✕
            </Button>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => setShowAddDomainModal(true)}
              size="lg"
              className="shadow-lg"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add New Domain
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowExpiredHistoryModal(true)}
              size="lg"
            >
              <History className="w-5 h-5 mr-2" />
              Expired History
            </Button>
          </div>
          
          <div className="text-sm text-muted-foreground">
            Last updated: {new Date().toLocaleTimeString()}
          </div>
        </div>

        {/* Health Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
          <Card variant="elevated" animated className="border-0 shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Domains</CardTitle>
              <div className="p-3 bg-primary/10 rounded-lg">
                <Monitor className="h-6 w-6 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-foreground">{stats.totalDomains}</div>
              <p className="text-sm text-muted-foreground mt-2">SSL certificates monitored</p>
            </CardContent>
          </Card>
          
          <Card variant="elevated" animated className="border-0 shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-sm font-medium text-muted-foreground">Valid Certificates</CardTitle>
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-green-600">{stats.validCertificates}</div>
              <p className="text-sm text-muted-foreground mt-2">Active and secure</p>
            </CardContent>
          </Card>
          
          <Card variant="elevated" animated className="border-0 shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-sm font-medium text-muted-foreground">Expiring Soon</CardTitle>
              <div className="p-3 bg-orange-100 rounded-lg">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-orange-600">{stats.expiringSoon}</div>
              <p className="text-sm text-muted-foreground mt-2">Requires attention</p>
            </CardContent>
          </Card>
          
          <Card variant="elevated" animated className="border-0 shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-sm font-medium text-muted-foreground">Expired</CardTitle>
              <div className="p-3 bg-red-100 rounded-lg">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-red-600">{stats.expired}</div>
              <p className="text-sm text-muted-foreground mt-2">Immediate action needed</p>
            </CardContent>
          </Card>
        </div>

        {environmentFilter === 'all' && (
          <Card variant="elevated" animated className="border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">Environment Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Development</p>
                  <p className="text-2xl font-semibold">{(stats as any)?.byEnvironment?.development ?? 0}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Staging</p>
                  <p className="text-2xl font-semibold">{(stats as any)?.byEnvironment?.staging ?? 0}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Production</p>
                  <p className="text-2xl font-semibold">{(stats as any)?.byEnvironment?.production ?? 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Status Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card variant="elevated" className="lg:col-span-2 border-0 shadow-xl" animated>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Activity className="w-6 h-6 text-primary" />
                SSL Certificate Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {alerts.slice(0, 3).map((alert) => (
                  <div key={alert.id} className="flex items-center justify-between p-6 bg-muted/30 rounded-xl hover:bg-muted/50 transition-all duration-200">
                    <div className="flex items-center gap-4">
                      <div className="w-3 h-3 rounded-full bg-gradient-to-br from-primary to-primary-foreground shadow-md"></div>
                      <div>
                        <p className="font-medium text-foreground text-lg">{alert.domain}</p>
                        <p className="text-sm text-muted-foreground">
                          Expires {formatDate(alert.expiryDate)}
                          {alert.environment ? ` • ${alert.environment}` : ''}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <SSLStatusBadge 
                        status={alert.status} 
                        daysUntilExpiry={alert.daysUntilExpiry}
                        animated
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRefreshDomain(alert.id)}
                        className="text-muted-foreground"
                      >
                        Renew
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRefreshDomain(alert.id)}
                        className="text-muted-foreground hover:text-primary"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card variant="elevated" className="border-0 shadow-xl" animated>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <TrendingUp className="w-6 h-6 text-green-600" />
                Health Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-5xl font-bold text-green-600 mb-4">
                  {healthScore}%
                </div>
                <p className="text-sm text-muted-foreground mb-6">Overall certificate health</p>
                <div className="w-full bg-muted/30 rounded-full h-3 mb-4">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-500 shadow-sm"
                    style={{ width: `${healthScore}%` }}
                  ></div>
                </div>
                <Badge variant="success" size="sm" className="text-sm px-4 py-2">
                  {healthScore >= 75 ? 'Excellent' : healthScore >= 50 ? 'Good' : 'Needs Attention'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Certificate Table */}
        <Card variant="elevated" className="border-0 shadow-xl" animated>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Shield className="w-6 h-6 text-primary" />
              All SSL Certificates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/50">
                    <TableHead className="font-semibold text-base">Domain</TableHead>
                    <TableHead className="font-semibold text-base">Status</TableHead>
                    <TableHead className="font-semibold text-base">Expiry Date</TableHead>
                    <TableHead className="font-semibold text-base">Days Until Expiry</TableHead>
                    <TableHead className="font-semibold text-base">Issuer</TableHead>
                    <TableHead className="font-semibold text-base">Last Checked</TableHead>
                    <TableHead className="font-semibold text-base">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {alerts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-12">
                        <div className="flex flex-col items-center gap-4 text-muted-foreground">
                          <Shield className="w-12 h-12" />
                          <p className="text-lg">No SSL certificates found</p>
                          <p className="text-sm">Add your first domain to start monitoring</p>
                          <Button
                            onClick={() => setShowAddDomainModal(true)}
                            size="sm"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Domain
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    alerts.map((alert) => (
                      <TableRow key={alert.id} className="group border-border/30 hover:bg-muted/20 transition-colors">
                        <TableCell className="font-medium text-foreground">
                          <SSLCertificateModal alert={alert} onRefresh={loadData}>
                            <button className="flex items-center gap-3 hover:text-primary transition-colors cursor-pointer w-full text-left">
                              <div className="w-2 h-2 rounded-full bg-gradient-to-br from-primary to-primary-foreground shadow-sm"></div>
                              <span className="text-base hover:underline">{alert.domain}</span>
                              <Eye className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity ml-auto" />
                            </button>
                          </SSLCertificateModal>
                        </TableCell>
                        <TableCell>
                          <SSLStatusBadge 
                            status={alert.status} 
                            daysUntilExpiry={alert.daysUntilExpiry}
                            animated
                          />
                        </TableCell>
                        <TableCell className="text-muted-foreground text-base">
                          {formatDate(alert.expiryDate)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              alert.daysUntilExpiry < 0 ? 'destructive' :
                              alert.daysUntilExpiry < 30 ? 'warning' :
                              'success'
                            }
                            size="sm"
                          >
                            {alert.daysUntilExpiry < 0 ? 
                              `${Math.abs(alert.daysUntilExpiry)} days ago` : 
                              `${alert.daysUntilExpiry} days`
                            }
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-base">{alert.issuer}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {formatDate(alert.lastChecked)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRefreshDomain(alert.id)}
                              className="text-muted-foreground hover:text-primary"
                            >
                              <RefreshCw className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteAlert(alert.id)}
                              className="text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
