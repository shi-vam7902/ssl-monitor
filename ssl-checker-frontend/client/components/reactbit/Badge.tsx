import React from 'react';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full border text-xs font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground shadow-md hover:shadow-lg",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground shadow-md hover:shadow-lg",
        outline: "border-border text-foreground hover:bg-accent hover:text-accent-foreground",
        success: "border-transparent bg-green-500 text-white shadow-md hover:bg-green-600 hover:shadow-lg",
        warning: "border-transparent bg-orange-500 text-white shadow-md hover:bg-orange-600 hover:shadow-lg",
        info: "border-transparent bg-blue-500 text-white shadow-md hover:bg-blue-600 hover:shadow-lg",
        gradient: "border-transparent bg-gradient-to-r from-primary to-primary-foreground text-white shadow-md hover:shadow-lg",
        glass: "border-white/20 bg-white/10 backdrop-blur-sm text-foreground hover:bg-white/20",
      },
      size: {
        sm: "px-2 py-0.5 text-xs",
        default: "px-2.5 py-1 text-xs",
        lg: "px-3 py-1.5 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  pulse?: boolean;
  glow?: boolean;
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ 
    className, 
    variant, 
    size, 
    icon, 
    iconPosition = 'left',
    pulse = false,
    glow = false,
    children,
    ...props 
  }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          badgeVariants({ variant, size }),
          pulse && "animate-pulse",
          glow && "shadow-lg shadow-current/25",
          className
        )}
        {...props}
      >
        {icon && iconPosition === 'left' && (
          <span className="mr-1 flex items-center">{icon}</span>
        )}
        {children}
        {icon && iconPosition === 'right' && (
          <span className="ml-1 flex items-center">{icon}</span>
        )}
      </div>
    );
  }
);

Badge.displayName = "Badge";

export { Badge, badgeVariants };
