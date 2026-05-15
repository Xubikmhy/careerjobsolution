import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface StatusBadgeProps {
  status: string;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  className?: string;
  /** Optional tooltip content (e.g. "Last contact: 2d ago") */
  tooltip?: ReactNode;
}

const variantStyles = {
  default: 'bg-muted text-muted-foreground border-muted-foreground/20',
  success: 'bg-success/10 text-success border-success/20',
  warning: 'bg-warning/10 text-warning border-warning/20',
  error: 'bg-destructive/10 text-destructive border-destructive/20',
  info: 'bg-primary/10 text-primary border-primary/20',
};

const dotStyles = {
  default: 'bg-muted-foreground/60',
  success: 'bg-success',
  warning: 'bg-warning',
  error: 'bg-destructive',
  info: 'bg-primary',
};

export function StatusBadge({ status, variant = 'default', className, tooltip }: StatusBadgeProps) {
  const badge = (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border whitespace-nowrap',
        variantStyles[variant],
        className
      )}
    >
      <span className={cn('inline-block h-1.5 w-1.5 rounded-full', dotStyles[variant])} aria-hidden />
      {status}
    </span>
  );

  if (!tooltip) return badge;

  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex">{badge}</span>
        </TooltipTrigger>
        <TooltipContent>{tooltip}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Subtle row/card tint per status for at-a-glance scanning
export function getStatusTint(status: string): string {
  const v = getStatusVariant(status);
  switch (v) {
    case 'success': return 'bg-success/[0.04] hover:bg-success/[0.08]';
    case 'warning': return 'bg-warning/[0.05] hover:bg-warning/[0.10]';
    case 'error':   return 'bg-destructive/[0.04] hover:bg-destructive/[0.08]';
    case 'info':    return 'bg-primary/[0.04] hover:bg-primary/[0.08]';
    default:        return 'bg-muted/30 hover:bg-muted/50';
  }
}

// Border tint variant for cards
export function getStatusBorderTint(status: string): string {
  const v = getStatusVariant(status);
  switch (v) {
    case 'success': return 'border-success/30';
    case 'warning': return 'border-warning/30';
    case 'error':   return 'border-destructive/30';
    case 'info':    return 'border-primary/30';
    default:        return 'border-border';
  }
}

// Helper function to get variant based on status text
export function getStatusVariant(status: string): StatusBadgeProps['variant'] {
  const statusLower = (status || '').toLowerCase();
  if (['active', 'open', 'vacant', 'available'].includes(statusLower)) {
    return 'success';
  }
  if (['placed', 'occupied', 'closed', 'filled', 'fulfilled'].includes(statusLower)) {
    return 'info';
  }
  if (['pending', 'in progress', 'sent for interview', 'interview'].includes(statusLower)) {
    return 'warning';
  }
  if (['rejected', 'cancelled', 'expired'].includes(statusLower)) {
    return 'error';
  }
  if (['inactive'].includes(statusLower)) {
    return 'default';
  }
  return 'default';
}
