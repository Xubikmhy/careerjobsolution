import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  trend?: string;
  variant?: 'default' | 'primary' | 'success' | 'warning';
  className?: string;
}

const variantStyles = {
  default: 'bg-card border-border',
  primary: 'bg-card border-primary/20',
  success: 'bg-card border-success/20',
  warning: 'bg-card border-warning/20',
};

const iconVariantStyles = {
  default: 'bg-muted text-foreground',
  primary: 'gradient-primary text-primary-foreground',
  success: 'gradient-success text-success-foreground',
  warning: 'gradient-warning text-warning-foreground',
};

export function StatCard({ title, value, icon: Icon, trend, variant = 'default', className }: StatCardProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl border p-6 shadow-sm transition-all duration-300 hover:shadow-md animate-fade-in',
        variantStyles[variant],
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold tracking-tight text-foreground">{value}</p>
          {trend && (
            <p className="text-sm text-muted-foreground">{trend}</p>
          )}
        </div>
        <div className={cn('p-3 rounded-xl shadow-sm', iconVariantStyles[variant])}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}
