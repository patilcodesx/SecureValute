import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Shield, CheckCircle2 } from 'lucide-react';

export default function Security() {
  const { securityAlerts, markAlertRead } = useAuth();

  const getSeverityStyle = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'high': return 'bg-warning/10 text-warning border-warning/20';
      case 'medium': return 'bg-primary/10 text-primary border-primary/20';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <div className="space-y-6 animate-in">
      <div><h1 className="text-3xl font-bold">Security Alerts</h1><p className="text-muted-foreground">{securityAlerts.filter(a => !a.isRead).length} unread alert(s)</p></div>
      <Card className="glass-card">
        <CardHeader><CardTitle><AlertTriangle className="inline mr-2 h-5 w-5" />Alert History</CardTitle></CardHeader>
        <CardContent>
          {securityAlerts.length === 0 ? (
            <div className="text-center py-8"><Shield className="h-12 w-12 mx-auto mb-4 text-success" /><h3 className="font-semibold mb-2">All Clear</h3><p className="text-muted-foreground">No security alerts</p></div>
          ) : (
            <div className="space-y-3">
              {securityAlerts.map((alert) => (
                <div key={alert.id} className={`flex items-start gap-3 p-4 rounded-lg border ${getSeverityStyle(alert.severity)}`}>
                  <AlertTriangle className="h-5 w-5 mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2"><p className={`font-medium ${!alert.isRead ? '' : 'opacity-70'}`}>{alert.message}</p>{!alert.isRead && <Badge variant="destructive" className="text-xs">New</Badge>}</div>
                    <p className="text-xs opacity-70 mt-1">{new Date(alert.timestamp).toLocaleString()}</p>
                  </div>
                  {!alert.isRead && <Button variant="ghost" size="sm" onClick={() => markAlertRead(alert.id)}><CheckCircle2 className="mr-1 h-3 w-3" />Mark Read</Button>}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
