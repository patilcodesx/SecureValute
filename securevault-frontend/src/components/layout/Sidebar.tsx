import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard,
  Upload,
  Files,
  Users,
  Shield,
  Lock,
  FileText,
  Key,
  Activity,
  AlertTriangle,
  Smartphone,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  History,
  Bomb,
  UserCog,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  adminOnly?: boolean;
}

const mainNavItems: NavItem[] = [
  { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { title: 'Upload', href: '/upload', icon: Upload },
  { title: 'My Files', href: '/files', icon: Files },
  // { title: 'Teams', href: '/teams', icon: Users },
];

const securityNavItems: NavItem[] = [
  { title: 'Encrypted Notes', href: '/notes', icon: FileText },
  { title: 'Password Vault', href: '/vault/passwords', icon: Key },
  { title: 'Sessions', href: '/sessions', icon: Smartphone },
  { title: 'Activity Log', href: '/activity', icon: Activity },
  { title: 'Security Alerts', href: '/security', icon: AlertTriangle },
  { title: '2FA Setup', href: '/2fa/setup', icon: Shield },
  // { title: 'Self-Destruct', href: '/self-destruct', icon: Bomb },
];

const adminNavItems: NavItem[] = [
  { title: 'Admin Panel', href: '/admin', icon: UserCog, adminOnly: true },
  { title: 'Manage Users', href: '/admin/users', icon: Users, adminOnly: true },
  { title: 'All Files', href: '/admin/files', icon: Files, adminOnly: true },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  const NavItem = ({ item }: { item: NavItem }) => {
    if (item.adminOnly && user?.role !== 'admin') return null;

    return (
      <NavLink
        to={item.href}
        className={cn(
          'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
          'hover:bg-secondary/80 hover:text-foreground',
          isActive(item.href)
            ? 'bg-primary/10 text-primary border border-primary/20'
            : 'text-muted-foreground'
        )}
      >
        <item.icon className={cn('h-5 w-5 flex-shrink-0', collapsed && 'mx-auto')} />
        {!collapsed && <span>{item.title}</span>}
      </NavLink>
    );
  };

  return (
    <aside
      className={cn(
        'flex flex-col h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-sidebar-border">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Lock className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg">SecureVault</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="h-8 w-8"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <div className="space-y-6">
          {/* Main Navigation */}
          <div className="space-y-1">
            {!collapsed && (
              <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Main
              </p>
            )}
            {mainNavItems.map((item) => (
              <NavItem key={item.href} item={item} />
            ))}
          </div>

          <Separator className="bg-sidebar-border" />

          {/* Security */}
          <div className="space-y-1">
            {!collapsed && (
              <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Security
              </p>
            )}
            {securityNavItems.map((item) => (
              <NavItem key={item.href} item={item} />
            ))}
          </div>

          {/* Admin */}
          {user?.role === 'admin' && (
            <>
              <Separator className="bg-sidebar-border" />
              <div className="space-y-1">
                {!collapsed && (
                  <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Admin
                  </p>
                )}
                {adminNavItems.map((item) => (
                  <NavItem key={item.href} item={item} />
                ))}
              </div>
            </>
          )}
        </div>
      </ScrollArea>

      {/* User Section */}
      <div className="p-3 border-t border-sidebar-border">
        <NavLink
          to="/profile"
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
            'hover:bg-secondary/80',
            isActive('/profile') ? 'bg-primary/10 text-primary' : 'text-muted-foreground'
          )}
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-semibold text-primary">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
          )}
        </NavLink>

        <Button
          variant="ghost"
          className={cn(
            'w-full mt-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10',
            collapsed ? 'px-0' : 'justify-start'
          )}
          onClick={logout}
        >
          <LogOut className={cn('h-4 w-4', !collapsed && 'mr-2')} />
          {!collapsed && 'Sign Out'}
        </Button>
      </div>
    </aside>
  );
}
