import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useFiles } from '@/contexts/FilesContext';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Files, Shield, Activity } from 'lucide-react';

export default function Admin() {
  const { getAllUsers, activityLogs } = useAuth();
  const { getAllFiles } = useFiles();
  const users = getAllUsers();
  const files = getAllFiles();

  const stats = [
    { title: 'Total Users', value: users.length, icon: Users, href: '/admin/users' },
    { title: 'Total Files', value: files.length, icon: Files, href: '/admin/files' },
    { title: 'Activity Logs', value: activityLogs.length, icon: Activity, href: '/activity' },
  ];

  return (
    <div className="space-y-6 animate-in">
      <div><h1 className="text-3xl font-bold">Admin Panel</h1><p className="text-muted-foreground">System overview and management</p></div>
      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <Link key={stat.href} to={stat.href}>
            <Card className="glass-card hover-lift">
              <CardContent className="p-6">
                <div className="flex items-center justify-between"><div className="p-3 rounded-xl bg-primary/10"><stat.icon className="h-6 w-6 text-primary" /></div><p className="text-3xl font-bold">{stat.value}</p></div>
                <h3 className="font-semibold mt-4">{stat.title}</h3>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
