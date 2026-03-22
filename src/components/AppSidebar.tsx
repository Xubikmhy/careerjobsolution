import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Home,
  Briefcase,
  Menu,
  X,
  Trophy,
  Receipt,
  Settings,
  Building2,
  FileText,
  Sparkles,
} from 'lucide-react';
import { SidebarNavLink } from './SidebarNavLink';
import { DarkModeToggle } from './DarkModeToggle';
import { cn } from '@/lib/utils';
import { getAgencySettings } from '@/utils/agencySettings';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const recruitmentLinks = [
  { to: '/candidates', icon: Users, label: 'Candidates' },
  { to: '/jobs', icon: Briefcase, label: 'Job Openings' },
];

const realEstateLinks = [
  { to: '/properties', icon: Home, label: 'Properties' },
  { to: '/tenants', icon: Users, label: 'Tenants' },
];

const operationsLinks = [
  { to: '/placements', icon: Trophy, label: 'Placements' },
  { to: '/accounting', icon: Receipt, label: 'Accounting' },
];

const servicesLinks = [
  { to: '/cv-generate', icon: Sparkles, label: 'AI CV Builder' },
];

export function AppSidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    const settings = getAgencySettings();
    setLogoUrl(settings.logoUrl);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success('Logged out successfully');
    navigate('/auth');
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-lg bg-card shadow-md border border-border"
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-40 h-screen w-64 bg-sidebar transition-transform duration-300 ease-in-out lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="px-4 py-6 border-b border-sidebar-border">
            <Link to="/" className="flex items-center gap-3">
              {logoUrl ? (
                <img src={logoUrl} alt="Logo" className="w-10 h-10 rounded-xl object-contain" />
              ) : (
                <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-glow">
                  <Building2 className="h-5 w-5 text-sidebar-primary-foreground" />
                </div>
              )}
              <div>
                <h1 className="text-base font-bold text-sidebar-foreground leading-tight">Career Job</h1>
                <p className="text-xs text-sidebar-muted">Solution - Pokhara</p>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto">
            {/* Dashboard */}
            <div>
              <SidebarNavLink to="/" icon={LayoutDashboard} onClick={() => setIsOpen(false)}>
                Dashboard
              </SidebarNavLink>
            </div>

            {/* Recruitment Section */}
            <div>
              <h3 className="px-3 mb-2 text-xs font-semibold text-sidebar-muted uppercase tracking-wider">
                Recruitment
              </h3>
              <div className="space-y-1">
                {recruitmentLinks.map((link) => (
                  <SidebarNavLink
                    key={link.to}
                    to={link.to}
                    icon={link.icon}
                    onClick={() => setIsOpen(false)}
                  >
                    {link.label}
                  </SidebarNavLink>
                ))}
              </div>
            </div>

            {/* Real Estate Section */}
            <div>
              <h3 className="px-3 mb-2 text-xs font-semibold text-sidebar-muted uppercase tracking-wider">
                Real Estate
              </h3>
              <div className="space-y-1">
                {realEstateLinks.map((link) => (
                  <SidebarNavLink
                    key={link.to}
                    to={link.to}
                    icon={link.icon}
                    onClick={() => setIsOpen(false)}
                  >
                    {link.label}
                  </SidebarNavLink>
                ))}
              </div>
            </div>

            {/* Operations Section */}
            <div>
              <h3 className="px-3 mb-2 text-xs font-semibold text-sidebar-muted uppercase tracking-wider">
                Operations
              </h3>
              <div className="space-y-1">
                {operationsLinks.map((link) => (
                  <SidebarNavLink
                    key={link.to}
                    to={link.to}
                    icon={link.icon}
                    onClick={() => setIsOpen(false)}
                  >
                    {link.label}
                  </SidebarNavLink>
                ))}
              </div>
            </div>

            {/* Services Section */}
            <div>
              <h3 className="px-3 mb-2 text-xs font-semibold text-sidebar-muted uppercase tracking-wider">
                Services
              </h3>
              <div className="space-y-1">
                {servicesLinks.map((link) => (
                  <SidebarNavLink
                    key={link.to}
                    to={link.to}
                    icon={link.icon}
                    onClick={() => setIsOpen(false)}
                  >
                    {link.label}
                  </SidebarNavLink>
                ))}
              </div>
            </div>

            {/* Settings */}
            <div>
              <h3 className="px-3 mb-2 text-xs font-semibold text-sidebar-muted uppercase tracking-wider">
                System
              </h3>
              <SidebarNavLink to="/settings" icon={Settings} onClick={() => setIsOpen(false)}>
                Settings
              </SidebarNavLink>
            </div>
          </nav>

          {/* Footer */}
          <div className="px-4 py-4 border-t border-sidebar-border space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-sidebar-accent flex items-center justify-center">
                  <span className="text-sm font-medium text-sidebar-foreground">A</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-sidebar-foreground">Admin</p>
                  <p className="text-xs text-sidebar-muted">Agency Staff</p>
                </div>
              </div>
              <DarkModeToggle />
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent rounded-lg transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
