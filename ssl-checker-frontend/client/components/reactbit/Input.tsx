import React from 'react';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const inputVariants = cva(
  "flex w-full rounded-lg border bg-background px-3 py-2 text-sm transition-all duration-200 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "border-input focus-visible:ring-ring hover:border-ring/50",
        success: "border-green-300 focus-visible:ring-green-500 focus-visible:border-green-500",
        error: "border-red-300 focus-visible:ring-red-500 focus-visible:border-red-500 bg-red-50/50",
        warning: "border-orange-300 focus-visible:ring-orange-500 focus-visible:border-orange-500",
        ghost: "border-transparent bg-muted/30 hover:bg-muted/50 focus-visible:bg-background focus-visible:border-input",
      },
      size: {
        sm: "h-8 px-2 text-xs",
        default: "h-10 px-3",
        lg: "h-12 px-4 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  helperText?: string;
  label?: string;
  error?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    variant, 
    size, 
    type, 
    icon, 
    iconPosition = 'left',
    loading = false,
    helperText,
    label,
    error,
    ...props 
  }, ref) => {
    const hasIcon = icon || loading;
    const effectiveVariant = error ? 'error' : variant;

    return (
      <div className="w-full">
        {label && (
          <label className="text-sm font-medium text-foreground mb-1.5 block">
            {label}
          </label>
        )}
        <div className="relative">
          {hasIcon && iconPosition === 'left' && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {loading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                icon
              )}
            </div>
          )}
          <input
            type={type}
            className={cn(
              inputVariants({ variant: effectiveVariant, size }),
              hasIcon && iconPosition === 'left' && "pl-10",
              hasIcon && iconPosition === 'right' && "pr-10",
              className
            )}
            ref={ref}
            {...props}
          />
          {hasIcon && iconPosition === 'right' && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {loading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                icon
              )}
            </div>
          )}
        </div>
        {(error || helperText) && (
          <p className={cn(
            "text-xs mt-1.5",
            error ? "text-red-500" : "text-muted-foreground"
          )}>
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input, inputVariants };
