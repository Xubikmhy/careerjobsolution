import { NavLink as RouterNavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface SidebarNavLinkProps {
  to: string;
  icon: LucideIcon;
  children: React.ReactNode;
  onClick?: () => void;
  badge?: number;
}

export function SidebarNavLink({ to, icon: Icon, children, onClick, badge }: SidebarNavLinkProps) {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <RouterNavLink
      to={to}
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
        isActive
          ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-md'
          : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground'
      )}
    >
      <Icon className="h-5 w-5 flex-shrink-0" />
      <span className="flex-1">{children}</span>
      {badge !== undefined && badge > 0 && (
        <span className="ml-auto inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 rounded-full bg-destructive text-destructive-foreground text-[10px] font-semibold">
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </RouterNavLink>
  );
}
