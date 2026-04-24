import { useState } from 'react';
import { AppSidebar } from './AppSidebar';
import { QuickAddFAB } from './QuickAddFAB';
import { GlobalSearch } from './GlobalSearch';
import { useGlobalShortcuts } from '@/hooks/useGlobalShortcuts';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  useGlobalShortcuts(() => setSearchOpen((o) => !o));

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <main className="lg:ml-64 min-h-screen">
        {/* Top utility bar — global search trigger */}
        <div className="sticky top-0 z-30 backdrop-blur bg-background/80 border-b border-border px-4 lg:px-8 h-12 flex items-center justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSearchOpen(true)}
            className="gap-2 text-muted-foreground hover:text-foreground ml-12 lg:ml-0"
          >
            <Search className="h-4 w-4" />
            <span className="hidden sm:inline">Search…</span>
            <kbd className="hidden md:inline-flex pointer-events-none h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
              <span className="text-xs">⌘</span>K
            </kbd>
          </Button>
        </div>
        <div className="px-4 py-6 pb-24 lg:p-8 lg:pb-24">{children}</div>
      </main>
      <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />
      <QuickAddFAB />
    </div>
  );
}
