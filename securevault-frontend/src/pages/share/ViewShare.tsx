import { useParams, Link } from 'react-router-dom';
import { useFiles } from '@/contexts/FilesContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { File, Lock, Download, AlertTriangle } from 'lucide-react';

export default function ViewShare() {
  const { shareId } = useParams<{ shareId: string }>();
  const { getShareLink, openShareLink, getFile } = useFiles();
  const link = getShareLink(shareId || '');

  if (!link) return <div className="min-h-screen flex items-center justify-center bg-background"><Card className="glass-card max-w-md"><CardContent className="p-8 text-center"><AlertTriangle className="h-12 w-12 mx-auto mb-4 text-warning" /><h2 className="text-xl font-bold mb-2">Link Not Found</h2><p className="text-muted-foreground">This share link is invalid or has expired.</p></CardContent></Card></div>;

  const file = getFile(link.fileId);
  const isExpired = link.expiresAt && new Date(link.expiresAt) < new Date();
  const maxedOut = link.maxOpens && link.currentOpens >= link.maxOpens;

  if (isExpired || maxedOut) return <div className="min-h-screen flex items-center justify-center bg-background"><Card className="glass-card max-w-md"><CardContent className="p-8 text-center"><AlertTriangle className="h-12 w-12 mx-auto mb-4 text-destructive" /><h2 className="text-xl font-bold mb-2">{isExpired ? 'Link Expired' : 'Max Opens Reached'}</h2><p className="text-muted-foreground">This share link is no longer available.</p></CardContent></Card></div>;

  const handleAccess = () => { openShareLink(shareId || ''); };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <Card className="glass-card max-w-md w-full">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 mx-auto mb-4 flex items-center justify-center"><File className="h-8 w-8 text-primary" /></div>
          <h2 className="text-xl font-bold mb-2">{file?.name || 'Encrypted File'}</h2>
          <p className="text-muted-foreground mb-6 flex items-center justify-center gap-1"><Lock className="h-4 w-4" />End-to-end encrypted</p>
          <Button onClick={handleAccess} className="w-full btn-gradient"><Download className="mr-2 h-4 w-4" />Access File</Button>
          <p className="text-xs text-muted-foreground mt-4">This link has been opened {link.currentOpens} time(s)</p>
        </CardContent>
      </Card>
    </div>
  );
}
