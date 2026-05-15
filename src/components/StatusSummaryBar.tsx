import { cn } from '@/lib/utils';

export interface StatusItem {
  key: string;
  label: string;
  count: number;
  variant: 'default' | 'success' | 'warning' | 'error' | 'info';
}

interface StatusSummaryBarProps {
  items: StatusItem[];
  active: string;
  onSelect: (key: string) => void;
  className?: string;
}

const styles: Record<StatusItem['variant'], { dot: string; tint: string; ring: string; text: string }> = {
  success: { dot: 'bg-success', tint: 'bg-success/5 hover:bg-success/10 border-success/20', ring: 'ring-success/40 bg-success/15', text: 'text-success' },
  warning: { dot: 'bg-warning', tint: 'bg-warning/5 hover:bg-warning/10 border-warning/20', ring: 'ring-warning/40 bg-warning/15', text: 'text-warning' },
  error:   { dot: 'bg-destructive', tint: 'bg-destructive/5 hover:bg-destructive/10 border-destructive/20', ring: 'ring-destructive/40 bg-destructive/15', text: 'text-destructive' },
  info:    { dot: 'bg-primary', tint: 'bg-primary/5 hover:bg-primary/10 border-primary/20', ring: 'ring-primary/40 bg-primary/15', text: 'text-primary' },
  default: { dot: 'bg-muted-foreground/60', tint: 'bg-muted/40 hover:bg-muted/60 border-border', ring: 'ring-foreground/20 bg-muted', text: 'text-foreground' },
};

export function StatusSummaryBar({ items, active, onSelect, className }: StatusSummaryBarProps) {
  return (
    <div className={cn('grid grid-cols-2 sm:flex sm:flex-wrap gap-2', className)}>
      {items.map((it) => {
        const s = styles[it.variant];
        const isActive = it.key === active;
        return (
          <button
            key={it.key}
            type="button"
            onClick={() => onSelect(it.key)}
            className={cn(
              'group flex items-center gap-2 px-3 py-2 rounded-lg border transition-all text-left flex-1 sm:flex-initial min-w-[110px]',
              s.tint,
              isActive && cn('ring-2', s.ring),
            )}
          >
            <span className={cn('h-2 w-2 rounded-full', s.dot)} aria-hidden />
            <span className="flex-1">
              <span className={cn('block text-[11px] font-medium uppercase tracking-wide', s.text)}>{it.label}</span>
              <span className="block text-lg font-bold leading-tight text-foreground">{it.count}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
