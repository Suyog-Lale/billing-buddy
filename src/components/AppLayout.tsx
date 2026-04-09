import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useBusiness } from '@/contexts/BusinessContext';
import {
  LayoutDashboard, FileText, Users, Package, BarChart3,
  Menu, X, LogOut, ChevronDown, Building2, Plus, Settings, ClipboardList
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/invoices', icon: FileText, label: 'Invoices' },
  { to: '/quotations', icon: ClipboardList, label: 'Quotations' },
  { to: '/parties', icon: Users, label: 'Parties' },
  { to: '/items', icon: Package, label: 'Items' },
  { to: '/reports', icon: BarChart3, label: 'Reports' },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { pathname } = useLocation();
  const { signOut, user } = useAuth();
  const { businesses, currentBusiness, setCurrentBusiness } = useBusiness();

  const NavContent = () => (
    <nav className="flex flex-col gap-1 p-3">
      {navItems.map(item => {
        const active = pathname === item.to || (item.to !== '/' && pathname.startsWith(item.to));
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
              active
                ? 'bg-sidebar-accent text-sidebar-primary'
                : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
            }`}
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:w-64 flex-col bg-sidebar border-r border-sidebar-border">
        <div className="p-4 border-b border-sidebar-border">
          <h1 className="font-heading text-xl font-bold text-sidebar-foreground">
            📋 BillFlow
          </h1>
          <p className="text-xs text-sidebar-foreground/50 mt-1">GST Billing & Inventory</p>
        </div>

        {/* Business Selector */}
        <div className="p-3 border-b border-sidebar-border">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-between text-sidebar-foreground hover:bg-sidebar-accent">
                <span className="flex items-center gap-2 truncate">
                  <Building2 className="h-4 w-4 shrink-0" />
                  <span className="truncate text-sm">{currentBusiness?.name || 'Select Business'}</span>
                </span>
                <ChevronDown className="h-4 w-4 shrink-0" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              {businesses.map(b => (
                <DropdownMenuItem key={b.id} onClick={() => setCurrentBusiness(b)}>
                  {b.name}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/business/new" className="flex items-center gap-2">
                  <Plus className="h-4 w-4" /> Add Business
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <NavContent />

        <div className="mt-auto p-3 border-t border-sidebar-border">
          <div className="flex items-center gap-2 px-3 mb-2">
            <div className="h-8 w-8 rounded-full bg-sidebar-accent flex items-center justify-center text-xs font-bold text-sidebar-primary">
              {user?.email?.[0]?.toUpperCase()}
            </div>
            <span className="text-xs text-sidebar-foreground/70 truncate">{user?.email}</span>
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" asChild className="flex-1 text-sidebar-foreground/70 hover:bg-sidebar-accent">
              <Link to="/settings"><Settings className="h-4 w-4 mr-1" /> Settings</Link>
            </Button>
            <Button variant="ghost" size="sm" onClick={signOut} className="text-sidebar-foreground/70 hover:bg-destructive/20 hover:text-destructive">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-foreground/40" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-sidebar flex flex-col animate-slide-up">
            <div className="p-4 flex items-center justify-between border-b border-sidebar-border">
              <h1 className="font-heading text-lg font-bold text-sidebar-foreground">📋 BillFlow</h1>
              <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)} className="text-sidebar-foreground">
                <X className="h-5 w-5" />
              </Button>
            </div>
            <NavContent />
          </aside>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-card md:hidden">
          <Button variant="ghost" size="icon" onClick={() => setMobileOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="font-heading text-lg font-bold">📋 BillFlow</h1>
          <div className="w-10" />
        </header>
        <div className="flex-1 overflow-auto p-4 md:p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
