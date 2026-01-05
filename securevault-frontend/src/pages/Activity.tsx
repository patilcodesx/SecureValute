import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity as ActivityIcon } from 'lucide-react';

export default function Activity() {
  const { activityLogs } = useAuth();

  return (
    <div className="space-y-6 animate-in">
      <div><h1 className="text-3xl font-bold">Activity Log</h1><p className="text-muted-foreground">Your recent security activity</p></div>
      <Card className="glass-card">
        <CardHeader><CardTitle><ActivityIcon className="inline mr-2 h-5 w-5" />Recent Activity</CardTitle></CardHeader>
        <CardContent>
          {activityLogs.length === 0 ? <p className="text-center py-8 text-muted-foreground">No activity recorded</p> : (
            <div className="space-y-3">
              {activityLogs.slice(0, 50).map((log) => (
                <div key={log.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                  <div className={`p-2 rounded-lg ${log.severity === 'critical' ? 'bg-destructive/10 text-destructive' : log.severity === 'warning' ? 'bg-warning/10 text-warning' : 'bg-primary/10 text-primary'}`}><ActivityIcon className="h-4 w-4" /></div>
                  <div className="flex-1"><p className="text-sm">{log.details}</p><p className="text-xs text-muted-foreground mt-1">{new Date(log.timestamp).toLocaleString()} • {log.device}</p></div>
                  <Badge variant="outline">{log.action.replace('_', ' ')}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
