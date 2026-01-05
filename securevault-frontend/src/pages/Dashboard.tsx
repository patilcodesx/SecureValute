import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useFiles } from '@/contexts/FilesContext';
// import { useTeams } from '@/contexts/TeamsContext';
import { useNotes } from '@/contexts/NotesContext';
import { useVault } from '@/contexts/VaultContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Files,
  Upload,
  Users,
  FileText,
  Key,
  Shield,
  Activity,
  AlertTriangle,
  ArrowRight,
  Lock,
  TrendingUp,
  Clock,
} from 'lucide-react';

export default function Dashboard() {
  const { user, sessions, activityLogs, securityAlerts } = useAuth();
  const { getUserFiles } = useFiles();

  // ⭐ FIXED — Use ALL TEAMS instead of getUserTeams()
  // const { teams: allTeams } = useTeams();
  // const teams = allTeams || [];

  const { getUserNotes } = useNotes();
  const { getUserPasswords } = useVault();

  const files = getUserFiles();
  const notes = getUserNotes();
  const passwords = getUserPasswords();

  const recentActivity = Array.isArray(activityLogs) ? activityLogs.slice(0, 5) : [];
  const unreadAlerts = securityAlerts.filter(a => !a.isRead).length;

  const stats = [
    {
      title: 'Encrypted Files',
      value: files.length,
      icon: Files,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      href: '/files',
    },
    // {
    //   title: 'Team Workspaces',
    //   // value: teams.length, // ⭐ FIXED COUNT
    //   icon: Users,
    //   color: 'text-accent',
    //   bgColor: 'bg-accent/10',
    //   href: '/teams',
    // },
    {
      title: 'Secure Notes',
      value: notes.length,
      icon: FileText,
      color: 'text-success',
      bgColor: 'bg-success/10',
      href: '/notes',
    },
    {
      title: 'Saved Passwords',
      value: passwords.length,
      icon: Key,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
      href: '/vault/passwords',
    },
  ];

  const quickActions = [
    { title: 'Upload Files', icon: Upload, href: '/upload', variant: 'default' as const },
    { title: 'Create Note', icon: FileText, href: '/notes/create', variant: 'outline' as const },
    { title: 'Add Password', icon: Key, href: '/vault/passwords', variant: 'outline' as const },
    { title: 'Create Team', icon: Users, href: '/teams/create', variant: 'outline' as const },
  ];

  return (
    <div className="space-y-6 animate-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {user?.name?.split(' ')[0]}</h1>
          <p className="text-muted-foreground mt-1">
            Your secure vault is protected and ready.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="security-badge">
            <Shield className="h-3.5 w-3.5" />
            <span>AES-256 Active</span>
          </div>
          {user?.twoFactorEnabled && (
            <div className="security-badge">
              <Lock className="h-3.5 w-3.5" />
              <span>2FA Enabled</span>
            </div>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <Link key={i} to={stat.href}>
            <Card className="glass-card hover-lift cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </p>
                    <p className="text-3xl font-bold mt-1">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Quick Actions */}
        <Card className="glass-card lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
            <CardDescription>Common tasks at your fingertips</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {quickActions.map((action, i) => (
              <Link key={i} to={action.href} className="block">
                <Button variant={action.variant} className="w-full justify-start gap-3">
                  <action.icon className="h-4 w-4" />
                  {action.title}
                </Button>
              </Link>
            ))}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="glass-card lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Recent Activity</CardTitle>
              <CardDescription>Your latest actions</CardDescription>
            </div>
            <Link to="/activity">
              <Button variant="ghost" size="sm" className="text-primary">
                View all
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentActivity.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No recent activity</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentActivity.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div
                      className={`p-2 rounded-lg ${
                        log.severity === 'critical'
                          ? 'bg-destructive/10 text-destructive'
                          : log.severity === 'warning'
                          ? 'bg-warning/10 text-warning'
                          : 'bg-primary/10 text-primary'
                      }`}
                    >
                      <Activity className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{log.details}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(log.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs shrink-0">
                      {log.action.replace('_', ' ')}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Security Overview */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Security Status */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Security Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-success/10 border border-success/20">
              <div className="flex items-center gap-3">
                <Lock className="h-5 w-5 text-success" />
                <span className="font-medium">Encryption</span>
              </div>
              <Badge className="bg-success text-success-foreground">Active</Badge>
            </div>

            <div
              className={`flex items-center justify-between p-3 rounded-lg ${
                user?.twoFactorEnabled
                  ? 'bg-success/10 border border-success/20'
                  : 'bg-warning/10 border border-warning/20'
              }`}
            >
              <div className="flex items-center gap-3">
                <Shield
                  className={`h-5 w-5 ${
                    user?.twoFactorEnabled ? 'text-success' : 'text-warning'
                  }`}
                />
                <span className="font-medium">Two-Factor Auth</span>
              </div>
              {user?.twoFactorEnabled ? (
                <Badge className="bg-success text-success-foreground">Enabled</Badge>
              ) : (
                <Link to="/2fa/setup">
                  <Badge className="bg-warning text-warning-foreground cursor-pointer">
                    Enable Now
                  </Badge>
                </Link>
              )}
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">Active Sessions</span>
              </div>
              <Badge variant="secondary">
                {sessions.filter((s) => s.userId === user?.id).length}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Security Alerts */}
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              Security Alerts
              {unreadAlerts > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {unreadAlerts} new
                </Badge>
              )}
            </CardTitle>
            <Link to="/security">
              <Button variant="ghost" size="sm" className="text-primary">
                View all
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {securityAlerts.slice(0, 3).length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Shield className="h-8 w-8 mx-auto mb-2 opacity-50 text-success" />
                <p>No security alerts</p>
                <p className="text-sm">Your vault is secure</p>
              </div>
            ) : (
              <div className="space-y-3">
                {securityAlerts.slice(0, 3).map((alert) => (
                  <div
                    key={alert.id}
                    className={`flex items-start gap-3 p-3 rounded-lg ${
                      alert.severity === 'critical'
                        ? 'bg-destructive/10'
                        : alert.severity === 'high'
                        ? 'bg-warning/10'
                        : 'bg-muted/50'
                    }`}
                  >
                    <AlertTriangle
                      className={`h-4 w-4 mt-0.5 ${
                        alert.severity === 'critical'
                          ? 'text-destructive'
                          : alert.severity === 'high'
                          ? 'text-warning'
                          : 'text-muted-foreground'
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${!alert.isRead ? 'font-medium' : ''}`}>
                        {alert.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(alert.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
