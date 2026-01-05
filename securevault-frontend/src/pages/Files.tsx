// src/pages/Files.tsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useFiles } from '@/contexts/FilesContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  File,
  Image,
  FileText,
  FileVideo,
  FileAudio,
  Search,
  Upload,
  MoreVertical,
  Share2,
  Trash2,
  History,
  Lock,
  Shield,
  Grid,
  List,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const getFileIcon = (type: string) => {
  if (type?.startsWith?.('image/')) return Image;
  if (type?.startsWith?.('video/')) return FileVideo;
  if (type?.startsWith?.('audio/')) return FileAudio;
  if (type?.includes?.('pdf') || type?.includes?.('document')) return FileText;
  return File;
};

const formatFileSize = (bytes: number) => {
  if (!bytes || bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export default function Files() {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [deleteDialog, setDeleteDialog] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { getUserFiles, deleteFile, getFile } = useFiles();
  const navigate = useNavigate();
  const { toast } = useToast();

  // normalize list to filter by search (guard null/undefined fields)
  const files = (getUserFiles() || []).filter(f =>
    (f.name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = async (fileId: number) => {
    setIsDeleting(true);
    try {
      const ok = await deleteFile(fileId);
      if (ok) {
        toast({ title: 'Deleted', description: 'File deleted successfully.' });
      } else {
        toast({ title: 'Delete failed', description: 'Could not delete file', variant: 'destructive' });
      }
    } catch (err) {
      console.error('delete error', err);
      toast({ title: 'Delete failed', description: (err as any)?.message ?? 'Unknown error', variant: 'destructive' });
    } finally {
      setIsDeleting(false);
      setDeleteDialog(null);
    }
  };

  const fileToDelete = deleteDialog !== null ? getFile(Number(deleteDialog)) : null;

  return (
    <div className="space-y-6 animate-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">My Files</h1>
          <p className="text-muted-foreground mt-1">
            {files.length} encrypted file(s) in your vault
          </p>
        </div>
        <Link to="/upload">
          <Button className="btn-gradient">
            <Upload className="mr-2 h-4 w-4" />
            Upload Files
          </Button>
        </Link>
      </div>

      {/* Search & View Toggle */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 input-secure"
          />
        </div>
        <div className="flex items-center border border-border rounded-lg p-1">
          <Button
            variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
            size="icon"
            className="h-8 w-8"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'secondary' : 'ghost'}
            size="icon"
            className="h-8 w-8"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {files.length === 0 ? (
        <Card className="glass-card">
          <CardContent className="py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-muted mx-auto mb-4 flex items-center justify-center">
              <Shield className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg mb-2">No files yet</h3>
            <p className="text-muted-foreground mb-4">
              Upload your first file to get started with encrypted storage.
            </p>
            <Link to="/upload">
              <Button className="btn-gradient">
                <Upload className="mr-2 h-4 w-4" />
                Upload Files
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : viewMode === 'grid' ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {files.map((file) => {
            const FileIcon = getFileIcon(file.type || '');
            return (
              <Card key={String(file.id)} className="glass-card hover-lift group">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 rounded-xl bg-primary/10">
                      <FileIcon className="h-6 w-6 text-primary" />
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigate(`/share/create/${file.id}`)}>
                          <Share2 className="mr-2 h-4 w-4" />
                          Share
                        </DropdownMenuItem>
                        {/* <DropdownMenuItem onClick={() => navigate(`/files/${file.id}/versions`)}>
                          <History className="mr-2 h-4 w-4" />
                          Version History
                        </DropdownMenuItem> */}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => setDeleteDialog(Number(file.id))}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <h3 className="font-medium truncate mb-1">{file.name}</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {formatFileSize(Number(file.size))}
                    </span>
                    <Badge variant="outline" className="text-xs border-primary/30 text-primary">
                      <Lock className="mr-1 h-3 w-3" />
                      Encrypted
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {file.uploadedAt ? new Date(file.uploadedAt).toLocaleDateString() : ''}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="glass-card">
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {files.map((file) => {
                const FileIcon = getFileIcon(file.type || '');
                return (
                  <div
                    key={String(file.id)}
                    className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors"
                  >
                    <div className="p-2 rounded-lg bg-primary/10">
                      <FileIcon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">{file.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {formatFileSize(Number(file.size))} • {file.uploadedAt ? new Date(file.uploadedAt).toLocaleDateString() : ''}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs border-primary/30 text-primary hidden sm:flex">
                      <Lock className="mr-1 h-3 w-3" />
                      Encrypted
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigate(`/share/create/${file.id}`)}>
                          <Share2 className="mr-2 h-4 w-4" />
                          Share
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate(`/files/${file.id}/versions`)}>
                          <History className="mr-2 h-4 w-4" />
                          Version History
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => setDeleteDialog(Number(file.id))}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteDialog} onOpenChange={() => setDeleteDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete File</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{fileToDelete?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog(null)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteDialog !== null && handleDelete(Number(deleteDialog))}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
