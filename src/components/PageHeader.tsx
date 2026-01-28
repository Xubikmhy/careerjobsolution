import { LucideIcon, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  action?: {
    label: string;
    onClick: () => void;
    icon?: LucideIcon;
  };
}

export function PageHeader({ title, description, icon: Icon, action }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
      <div className="flex items-center gap-4">
        {Icon && (
          <div className="p-3 rounded-xl gradient-primary shadow-glow">
            <Icon className="h-6 w-6 text-primary-foreground" />
          </div>
        )}
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground tracking-tight">{title}</h1>
          {description && (
            <p className="text-muted-foreground mt-1">{description}</p>
          )}
        </div>
      </div>
      {action && (
        <Button onClick={action.onClick} className="gap-2 shadow-sm">
          {action.icon ? <action.icon className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {action.label}
        </Button>
      )}
    </div>
  );
}
