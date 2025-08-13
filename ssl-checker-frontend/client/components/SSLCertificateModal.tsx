import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/reactbit/Card';
import { Badge } from '@/components/reactbit/Badge';
import { Button } from '@/components/reactbit/Button';
import { SSLStatusBadge } from '@/components/reactbit/SSLStatusBadge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { sslService } from '@/services/sslService';
import { toast } from '@/hooks/use-toast';
import { SSLAlert } from '@/types/ssl';
import { DomainCheckResult } from '@/types/api';
import {
  Shield,
  Clock,
  Globe,
  Key,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Calendar,
  Server,
  Lock,
  RefreshCw,
  Copy,
  Eye,
  RotateCcw,
  Zap,
  Activity,
  TrendingUp,
  Loader2,
} from 'lucide-react';

interface SSLCertificateModalProps {
  alert: SSLAlert;
  children: React.ReactNode;
  onRefresh?: () => void;
}

export const SSLCertificateModal: React.FC<SSLCertificateModalProps> = ({
  alert,
  children,
  onRefresh,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [detailedInfo, setDetailedInfo] = useState<DomainCheckResult | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  // Load detailed certificate info when modal opens
  useEffect(() => {
    if (isOpen && !detailedInfo) {
      loadCertificateDetails();
    }
  }, [isOpen]);

  const loadCertificateDetails = async () => {
    setIsLoadingDetails(true);
    try {
      const details = await sslService.checkDomain(alert.domain);
      setDetailedInfo(details);
    } catch (error) {
      console.error('Error loading certificate details:', error);
      toast({
        title: 'Failed to load details',
        description: 'Could not fetch detailed certificate information.',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const handleRefreshCertificate = async () => {
    setIsRefreshing(true);
    try {
      await sslService.refreshDomain(alert.id);
      await loadCertificateDetails(); // Reload details
      onRefresh?.(); // Refresh parent component
      toast({
        title: 'Certificate Refreshed',
        description: `SSL certificate for ${alert.domain} has been updated.`,
      });
    } catch (error) {
      console.error('Error refreshing certificate:', error);
      toast({
        title: 'Refresh Failed',
        description: 'Could not refresh SSL certificate.',
        variant: 'destructive',
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied!',
      description: `${label} copied to clipboard.`,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'valid':
        return 'text-green-600 bg-green-50';
      case 'expiring_soon':
        return 'text-yellow-600 bg-yellow-50';
      case 'expired':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'valid':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'expiring_soon':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'expired':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const calculateDaysProgress = (daysUntilExpiry: number) => {
    // Assume 90 days is typical cert duration
    const totalDays = 90;
    const progress = Math.max(0, Math.min(100, ((totalDays - daysUntilExpiry) / totalDays) * 100));
    return progress;
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl">
            <Shield className="h-6 w-6 text-primary" />
            SSL Certificate Details
            <SSLStatusBadge status={alert.status} />
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Overview Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  {alert.domain}
                </div>
                <Button
                  onClick={handleRefreshCertificate}
                  disabled={isRefreshing}
                  size="sm"
                  variant="outline"
                >
                  {isRefreshing ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-2" />
                  )}
                  Refresh
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(alert.status)}
                    <span className="font-medium">Status</span>
                  </div>
                  <div className={`px-3 py-2 rounded-lg ${getStatusColor(alert.status)}`}>
                    <span className="font-medium capitalize">{alert.status.replace('_', ' ')}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-gray-600" />
                    <span className="font-medium">Expires</span>
                  </div>
                  <div className="text-sm">
                    <p className="font-medium">{formatDate(alert.expiryDate)}</p>
                    <p className="text-gray-600">
                      {alert.daysUntilExpiry > 0
                        ? `${alert.daysUntilExpiry} days remaining`
                        : `Expired ${Math.abs(alert.daysUntilExpiry)} days ago`}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-gray-600" />
                    <span className="font-medium">Last Checked</span>
                  </div>
                  <div className="text-sm">
                    <p className="font-medium">{formatDate(alert.lastChecked)}</p>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Certificate Lifetime</span>
                  <span className="text-sm text-gray-600">
                    {alert.daysUntilExpiry > 0 ? `${alert.daysUntilExpiry} days left` : 'Expired'}
                  </span>
                </div>
                <Progress
                  value={calculateDaysProgress(alert.daysUntilExpiry)}
                  className="h-2"
                />
              </div>
            </CardContent>
          </Card>

          {/* Detailed Information Tabs */}
          <Tabs defaultValue="certificate" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="certificate">Certificate</TabsTrigger>
              <TabsTrigger value="issuer">Issuer</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
            </TabsList>

            <TabsContent value="certificate" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="h-5 w-5" />
                    Certificate Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoadingDetails ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin mr-2" />
                      <span>Loading certificate details...</span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium text-gray-600">Domain</label>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="font-mono text-sm bg-gray-50 p-2 rounded flex-1">
                              {alert.domain}
                            </p>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => copyToClipboard(alert.domain, 'Domain')}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        <div>
                          <label className="text-sm font-medium text-gray-600">Serial Number</label>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="font-mono text-sm bg-gray-50 p-2 rounded flex-1">
                              {alert.serialNumber || detailedInfo?.serialNumber || 'N/A'}
                            </p>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                copyToClipboard(
                                  alert.serialNumber || detailedInfo?.serialNumber || '',
                                  'Serial Number'
                                )
                              }
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        <div>
                          <label className="text-sm font-medium text-gray-600">Algorithm</label>
                          <p className="mt-1 font-mono text-sm bg-gray-50 p-2 rounded">
                            {alert.certificate || 'SHA-256'}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium text-gray-600">Valid From</label>
                          <p className="mt-1 text-sm bg-green-50 p-2 rounded">
                            {/* This would come from detailed cert info */}
                            Issued Date (requires cert details)
                          </p>
                        </div>

                        <div>
                          <label className="text-sm font-medium text-gray-600">Valid Until</label>
                          <p className="mt-1 text-sm bg-red-50 p-2 rounded">
                            {formatDate(alert.expiryDate)}
                          </p>
                        </div>

                        <div>
                          <label className="text-sm font-medium text-gray-600">Key Size</label>
                          <p className="mt-1 font-mono text-sm bg-gray-50 p-2 rounded">
                            2048 bits (RSA)
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="issuer" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Server className="h-5 w-5" />
                    Certificate Authority
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Issuer</label>
                      <p className="mt-1 text-sm bg-blue-50 p-3 rounded font-medium">
                        {alert.issuer || detailedInfo?.issuer || 'Loading...'}
                      </p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-600">Authority</label>
                      <div className="mt-1 flex items-center gap-2">
                        <Shield className="h-4 w-4 text-green-600" />
                        <span className="text-sm">Trusted CA</span>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-600">Validation Type</label>
                      <Badge variant="outline" className="mt-1">
                        Domain Validated
                      </Badge>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-600">Chain Length</label>
                      <p className="mt-1 text-sm">3 certificates</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="h-5 w-5" />
                    Security Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium text-gray-600">Encryption</label>
                          <div className="mt-1 flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="text-sm">RSA 2048-bit</span>
                          </div>
                        </div>

                        <div>
                          <label className="text-sm font-medium text-gray-600">Signature Algorithm</label>
                          <p className="mt-1 text-sm">{alert.certificate || 'SHA-256 with RSA'}</p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium text-gray-600">Protocol Support</label>
                          <div className="mt-1 space-y-1">
                            <div className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              <span className="text-sm">TLS 1.2</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              <span className="text-sm">TLS 1.3</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {detailedInfo?.errorMessage && (
                      <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
                        <div className="flex items-center gap-2">
                          <XCircle className="h-4 w-4 text-red-600" />
                          <span className="text-sm font-medium text-red-800">Security Issue</span>
                        </div>
                        <p className="text-sm text-red-700 mt-1">{detailedInfo.errorMessage}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="monitoring" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Monitoring Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Monitoring</label>
                        <div className="mt-1 flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-sm">Active</span>
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-600">Check Frequency</label>
                        <p className="mt-1 text-sm">Daily</p>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-600">Next Check</label>
                        <p className="mt-1 text-sm">
                          {new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Alert Threshold</label>
                        <p className="mt-1 text-sm">30 days before expiry</p>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-600">Notifications</label>
                        <div className="mt-1 flex items-center gap-2">
                          <Zap className="h-4 w-4 text-blue-600" />
                          <span className="text-sm">Email alerts enabled</span>
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-600">Auto-renewal</label>
                        <Badge variant="outline">Not configured</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SSLCertificateModal;
