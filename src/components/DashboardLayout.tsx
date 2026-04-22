import { AppSidebar } from './AppSidebar';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <main className="lg:ml-64 min-h-screen">
        {/* Extra top padding on mobile so floating menu button doesn't collide with page header */}
        <div className="px-4 pt-16 pb-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
