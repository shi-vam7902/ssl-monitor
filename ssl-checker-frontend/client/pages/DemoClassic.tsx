import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  LogOut, 
  RefreshCw, 
  Settings, 
  Home,
  CheckCircle,
  Clock,
  XCircle,
  Monitor
} from 'lucide-react';

export default function DemoClassic() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { user, logout } = useAuth();

  const mockData = [
    {
      id: '1',
      domain: 'example.com',
      expiryDate: '2024-03-15T10:30:00Z',
      status: 'valid',
      lastChecked: '2024-01-15T09:00:00Z',
      daysUntilExpiry: 60,
      issuer: 'Let\'s Encrypt'
    },
    {
      id: '2',
      domain: 'api.example.com',
      expiryDate: '2024-02-01T14:22:00Z',
      status: 'expiring_soon',
      lastChecked: '2024-01-15T09:15:00Z',
      daysUntilExpiry: 17,
      issuer: 'DigiCert'
    },
    {
      id: '3',
      domain: 'old.example.com',
      expiryDate: '2024-01-10T08:00:00Z',
      status: 'expired',
      lastChecked: '2024-01-15T09:30:00Z',
      daysUntilExpiry: -5,
      issuer: 'Comodo'
    }
  ];

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast({ title: 'Logged out', description: 'You have been successfully logged out.' });
    } catch (err) {
      console.error('Error logging out:', err);
      toast({ title: 'Logout failed', description: 'Could not log out properly.', variant: 'destructive' });
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

  const getStatusBadge = (status: string, days?: number) => {
    switch (status) {
      case 'valid':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Valid</Badge>;
      case 'expiring_soon':
        return <Badge className="bg-orange-100 text-orange-800 border-orange-200">Expires in {days}d</Badge>;
      case 'expired':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Expired</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg border-r border-slate-200">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">SSL Monitor</h1>
              <p className="text-xs text-slate-500">Classic Dashboard</p>
            </div>
          </div>
          
          <nav className="space-y-2">
            <Button variant="ghost" className="w-full justify-start bg-blue-50 text-blue-700 hover:bg-blue-100">
              <Home className="w-4 h-4 mr-3" />
              Dashboard
            </Button>
            <Button variant="ghost" className="w-full justify-start text-slate-600 hover:bg-slate-50">
              <Monitor className="w-4 h-4 mr-3" />
              Domains
            </Button>
            <Button variant="ghost" className="w-full justify-start text-slate-600 hover:bg-slate-50">
              <Settings className="w-4 h-4 mr-3" />
              Settings
            </Button>
          </nav>
        </div>
        
        <div className="absolute bottom-0 left-0 w-64 p-6 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-slate-600">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <div className="text-sm">
                <p className="font-medium text-slate-700">{user?.email || 'user@ssl.com'}</p>
                <p className="text-xs text-slate-500">{user?.role?.name || 'User'}</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleLogout}
              className="text-slate-500 hover:text-red-600"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="bg-white shadow-sm border-b border-slate-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">SSL Certificates</h2>
              <p className="text-slate-600">Monitor and manage your SSL certificates</p>
            </div>
            <Button 
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </header>

        {/* Stats Cards */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Domains</CardTitle>
                <Monitor className="h-4 w-4 text-slate-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">5</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Valid</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">2</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
                <Clock className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">2</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Expired</CardTitle>
                <XCircle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">1</div>
              </CardContent>
            </Card>
          </div>

          {/* SSL Certificates Table */}
          <Card>
            <CardHeader>
              <CardTitle>SSL Certificates</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Domain</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Expiry Date</TableHead>
                    <TableHead>Issuer</TableHead>
                    <TableHead>Last Checked</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockData.map((alert) => (
                    <TableRow key={alert.id}>
                      <TableCell className="font-medium">
                        {alert.domain}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(alert.status, alert.daysUntilExpiry)}
                      </TableCell>
                      <TableCell>
                        {formatDate(alert.expiryDate)}
                      </TableCell>
                      <TableCell>{alert.issuer}</TableCell>
                      <TableCell className="text-slate-500">
                        {formatDate(alert.lastChecked)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
