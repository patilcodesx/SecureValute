import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Trash2, Shield, Crown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AdminUsers() {
  const { getAllUsers, deleteUser, user: currentUser } = useAuth();
  const { toast } = useToast();
  const users = getAllUsers();

  const handleDelete = (userId: string) => {
    if (userId === currentUser?.id) { toast({ title: 'Error', description: 'Cannot delete yourself', variant: 'destructive' }); return; }
    deleteUser(userId);
    toast({ title: 'User deleted' });
  };

  return (
    <div className="space-y-6 animate-in">
      <div><h1 className="text-3xl font-bold">Manage Users</h1><p className="text-muted-foreground">{users.length} registered user(s)</p></div>
      <Card className="glass-card">
        <CardHeader><CardTitle><Users className="inline mr-2 h-5 w-5" />All Users</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {users.map((u) => (
            <div key={u.id} className="flex items-center gap-4 p-4 rounded-lg bg-muted/30">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center"><span className="font-semibold text-primary">{u.name?.charAt(0)}</span></div>
              <div className="flex-1"><p className="font-medium">{u.name}</p><p className="text-sm text-muted-foreground">{u.email}</p></div>
              <Badge className={u.role === 'admin' ? 'bg-warning/10 text-warning' : ''}>{u.role === 'admin' ? <Crown className="mr-1 h-3 w-3" /> : <Shield className="mr-1 h-3 w-3" />}{u.role}</Badge>
              {u.twoFactorEnabled && <Badge variant="outline" className="border-success/30 text-success">2FA</Badge>}
              {u.id !== currentUser?.id && <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(u.id)}><Trash2 className="h-4 w-4" /></Button>}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
