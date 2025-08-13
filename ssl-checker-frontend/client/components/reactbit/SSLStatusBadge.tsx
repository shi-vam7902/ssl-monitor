import React from 'react';
import { Badge } from './Badge';
import { cn } from '@/lib/utils';
import { Shield, AlertTriangle, XCircle, Clock } from 'lucide-react';

export type SSLStatus = 'valid' | 'expiring_soon' | 'expired';

interface SSLStatusBadgeProps {
  status: SSLStatus;
  daysUntilExpiry?: number;
  animated?: boolean;
  showIcon?: boolean;
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}

export const SSLStatusBadge: React.FC<SSLStatusBadgeProps> = ({ 
  status, 
  daysUntilExpiry,
  animated = true,
  showIcon = true,
  size = 'default',
  className
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'valid':
        return {
          variant: 'success' as const,
          label: 'Valid',
          icon: <Shield className="w-3 h-3" />,
          glow: false,
          pulse: false
        };
      case 'expiring_soon':
        return {
          variant: 'warning' as const,
          label: daysUntilExpiry ? `Expires in ${daysUntilExpiry}d` : 'Expiring Soon',
          icon: <Clock className="w-3 h-3" />,
          glow: true,
          pulse: animated && daysUntilExpiry !== undefined && daysUntilExpiry <= 7
        };
      case 'expired':
        return {
          variant: 'destructive' as const,
          label: 'Expired',
          icon: <XCircle className="w-3 h-3" />,
          glow: true,
          pulse: animated
        };
      default:
        return {
          variant: 'outline' as const,
          label: 'Unknown',
          icon: <AlertTriangle className="w-3 h-3" />,
          glow: false,
          pulse: false
        };
    }
  };

  const config = getStatusConfig();

  return (
    <Badge 
      variant={config.variant}
      size={size}
      icon={showIcon ? config.icon : undefined}
      iconPosition="left"
      pulse={config.pulse}
      glow={config.glow}
      className={cn(
        "font-medium transition-all duration-300 select-none",
        animated && "hover:scale-105",
        className
      )}
    >
      {config.label}
    </Badge>
  );
};
