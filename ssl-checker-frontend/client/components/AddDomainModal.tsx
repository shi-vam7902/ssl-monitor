import React, { useState } from 'react';
import { Button } from '@/components/reactbit/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/reactbit/Card';
import { Input } from '@/components/reactbit/Input';
import { Badge } from '@/components/reactbit/Badge';
import { sslService } from '@/services/sslService';
import { DomainCheckResult } from '@/types/ssl';
import { toast } from '@/hooks/use-toast';
import { 
  X, 
  Plus, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  Loader2,
  Shield,
  Calendar,
  Building
} from 'lucide-react';

interface AddDomainModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AddDomainModal: React.FC<AddDomainModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [domain, setDomain] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [checkResult, setCheckResult] = useState<DomainCheckResult | null>(null);
  const [error, setError] = useState('');

  const validateDomain = (domain: string): boolean => {
    const domainRegex = /^([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;
    return domainRegex.test(domain);
  };

  const handleCheckDomain = async () => {
    if (!domain.trim()) {
      setError('Please enter a domain name');
      return;
    }

    if (!validateDomain(domain)) {
      setError('Please enter a valid domain name (e.g., example.com)');
      return;
    }

    setIsChecking(true);
    setError('');
    setCheckResult(null);

    try {
      const result = await sslService.checkDomain(domain);
      setCheckResult(result);
      toast({ title: 'Domain checked', description: `${domain} status: ${result.status}` });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to check domain');
      toast({ title: 'Check failed', description: 'Unable to check domain SSL.', variant: 'destructive' as any });
    } finally {
      setIsChecking(false);
    }
  };

  const handleAddDomain = async () => {
    if (!checkResult) return;

    setIsAdding(true);
    try {
      await sslService.createAlert({ domain });
      onSuccess();
      onClose();
      setDomain('');
      setCheckResult(null);
      setError('');
      toast({ title: 'Domain added', description: `${domain} is now being monitored` });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add domain');
      toast({ title: 'Add failed', description: 'Unable to add domain.', variant: 'destructive' as any });
    } finally {
      setIsAdding(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'valid':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'expiring':
        return <Clock className="w-5 h-5 text-orange-600" />;
      case 'expired':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'valid':
        return <Badge variant="success">Valid</Badge>;
      case 'expiring':
        return <Badge variant="warning">Expiring Soon</Badge>;
      case 'expired':
        return <Badge variant="destructive">Expired</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl border-0 shadow-2xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Add New SSL Domain
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Domain Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Domain Name
            </label>
            <div className="flex gap-2">
              <Input
                placeholder="Enter domain (e.g., example.com)"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleCheckDomain()}
                className="flex-1"
              />
              <Button
                onClick={handleCheckDomain}
                loading={isChecking}
                disabled={!domain.trim()}
                size="sm"
              >
                {isChecking ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4" />
                )}
                Check
              </Button>
            </div>
            {error && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {error}
              </p>
            )}
          </div>

          {/* Domain Check Result */}
          {checkResult && (
            <div className="space-y-4">
              <div className="p-4 bg-muted/30 rounded-xl border border-border/50">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-foreground flex items-center gap-2">
                    {getStatusIcon(checkResult.status)}
                    {checkResult.domain}
                  </h3>
                  {getStatusBadge(checkResult.status)}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Expiry Date:</span>
                      <span className="font-medium">
                        {new Date(checkResult.expiryDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Days Remaining:</span>
                      <Badge
                        variant={
                          checkResult.daysRemaining < 0 ? 'destructive' :
                          checkResult.daysRemaining < 30 ? 'warning' :
                          'success'
                        }
                        size="sm"
                      >
                        {checkResult.daysRemaining < 0 ? 
                          `${Math.abs(checkResult.daysRemaining)} days ago` : 
                          `${checkResult.daysRemaining} days`
                        }
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Building className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Issuer:</span>
                      <span className="font-medium">{checkResult.issuer}</span>
                    </div>
                    
                    {checkResult.serialNumber && (
                      <div className="flex items-center gap-2 text-sm">
                        <Shield className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Serial:</span>
                        <span className="font-mono text-xs bg-muted px-2 py-1 rounded">
                          {checkResult.serialNumber.slice(0, 16)}...
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                {checkResult.errorMessage && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-700 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      {checkResult.errorMessage}
                    </p>
                  </div>
                )}
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={handleAddDomain}
                  loading={isAdding}
                  disabled={!checkResult.isValid}
                  className="flex-1"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add to Monitoring
                </Button>
                <Button
                  variant="outline"
                  onClick={onClose}
                  disabled={isAdding}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
