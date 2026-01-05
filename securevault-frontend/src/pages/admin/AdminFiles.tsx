import { useFiles } from '@/contexts/FilesContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Files, Trash2, Lock, File } from 'lucide-react';

export default function AdminFiles() {
  const { getAllFiles, deleteFile } = useFiles();
  const { getAllUsers } = useAuth();
  const files = getAllFiles();
  const users = getAllUsers();

  const getUploader = (userId: string) => users.find(u => u.id === userId)?.name || 'Unknown';
  const formatSize = (bytes: number) => { const k = 1024; const i = Math.floor(Math.log(bytes) / Math.log(k)); return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + ['B', 'KB', 'MB', 'GB'][i]; };

  return (
    <div className="space-y-6 animate-in">
      <div><h1 className="text-3xl font-bold">All Files</h1><p className="text-muted-foreground">{files.length} file(s) in system</p></div>
      <Card className="glass-card">
        <CardHeader><CardTitle><Files className="inline mr-2 h-5 w-5" />System Files</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {files.length === 0 ? <p className="text-center py-8 text-muted-foreground">No files uploaded</p> : files.map((file) => (
            <div key={file.id} className="flex items-center gap-4 p-4 rounded-lg bg-muted/30">
              <div className="p-2 rounded-lg bg-primary/10"><File className="h-5 w-5 text-primary" /></div>
              <div className="flex-1"><p className="font-medium truncate">{file.name}</p><p className="text-sm text-muted-foreground">Uploaded by {getUploader(file.uploadedBy)} • {formatSize(file.size)}</p></div>
              <Badge variant="outline" className="border-primary/30 text-primary"><Lock className="mr-1 h-3 w-3" />Encrypted</Badge>
              <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteFile(file.id)}><Trash2 className="h-4 w-4" /></Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
