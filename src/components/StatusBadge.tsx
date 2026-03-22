import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: string;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  className?: string;
}

const variantStyles = {
  default: 'bg-muted text-muted-foreground',
  success: 'bg-success/10 text-success border-success/20',
  warning: 'bg-warning/10 text-warning border-warning/20',
  error: 'bg-destructive/10 text-destructive border-destructive/20',
  info: 'bg-primary/10 text-primary border-primary/20',
};

export function StatusBadge({ status, variant = 'default', className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        variantStyles[variant],
        className
      )}
    >
      {status}
    </span>
  );
}

// Helper function to get variant based on status text
export function getStatusVariant(status: string): StatusBadgeProps['variant'] {
  const statusLower = status.toLowerCase();
  if (['active', 'open', 'vacant', 'available'].includes(statusLower)) {
    return 'success';
  }
  if (['placed', 'occupied', 'closed', 'filled'].includes(statusLower)) {
    return 'info';
  }
  if (['pending', 'in progress', 'sent for interview', 'interview'].includes(statusLower)) {
    return 'warning';
  }
  if (['rejected', 'cancelled'].includes(statusLower)) {
    return 'error';
  }
  return 'default';
}
