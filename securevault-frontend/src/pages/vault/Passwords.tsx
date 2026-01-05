import { useState } from "react";
import { useVault } from "@/contexts/VaultContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

import {
  Key,
  Plus,
  Search,
  Eye,
  EyeOff,
  Copy,
  Trash2,
  Lock,
  Globe,
} from "lucide-react";
import Swal from "sweetalert2";

function Passwords() {
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);

  // UPDATE PASSWORD STATES
  const [editOpen, setEditOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<any>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editUsername, setEditUsername] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [editUrl, setEditUrl] = useState("");

  // CREATE STATES
  const [title, setTitle] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [url, setUrl] = useState("");
  // const category = "General";

  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, string>>({});

  const { 
    getUserPasswords, 
    createPassword, 
    decryptPassword, 
    deletePassword, 
    updatePassword 
  } = useVault();

  const { toast } = useToast();

  const passwords = getUserPasswords().filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase())
  );

  // ------------------------------------------------
  // CREATE PASSWORD
  // ------------------------------------------------
  const handleCreate = async () => {
    if (!title || !password) {
      toast({
        title: "Required",
        description: "Title and password are required.",
        variant: "destructive",
      });
      return;
    }

    await createPassword({ title, username, password, url });

    toast({ title: "Saved", description: "Password stored securely." });

    setTitle("");
    setUsername("");
    setPassword("");
    setUrl("");

    setDialogOpen(false);
  };

  // ------------------------------------------------
  // SHOW / HIDE PASSWORD
  // ------------------------------------------------
  const togglePassword = async (id: string, entry: any) => {
    if (visiblePasswords[id]) {
      const updated = { ...visiblePasswords };
      delete updated[id];
      setVisiblePasswords(updated);
      return;
    }

    const decrypted = await decryptPassword(entry);
    setVisiblePasswords((prev) => ({ ...prev, [id]: decrypted }));
  };

  // Copy
  const copyPassword = async (entry: any) => {
    const decrypted = await decryptPassword(entry);
    navigator.clipboard.writeText(decrypted);
    toast({ title: "Copied", description: "Password copied to clipboard." });
  };

  // ------------------------------------------------
  // OPEN UPDATE MODAL
  // ------------------------------------------------
  const openUpdateModal = async (entry: any) => {
    setEditTarget(entry);
    setEditTitle(entry.title);
    setEditUsername(entry.username || "");
    setEditUrl(entry.url || "");

    const decrypted = await decryptPassword(entry);
    setEditPassword(decrypted);

    setEditOpen(true);
  };

  return (
    <div className="space-y-6 animate-in">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Password Vault</h1>
          <p className="text-muted-foreground">{passwords.length} password(s)</p>
        </div>

        {/* CREATE PASSWORD DIALOG */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="btn-gradient">
              <Plus className="mr-2 h-4 w-4" />
              Add Password
            </Button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Password</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label>Username / Email</Label>
                <Input value={username} onChange={(e) => setUsername(e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label>Password</Label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>URL (optional)</Label>
                <Input value={url} onChange={(e) => setUrl(e.target.value)} />
              </div>
            </div>

            <DialogFooter>
              <Button onClick={handleCreate} className="btn-gradient">
                <Lock className="mr-2 h-4 w-4" />
                Save Encrypted
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* SEARCH */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search passwords..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* EMPTY STATE */}
      {passwords.length === 0 ? (
        <Card className="glass-card">
          <CardContent className="py-16 text-center">
            <Key className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="font-semibold mb-2">No passwords saved</h3>
            <p className="text-muted-foreground">Add your first password to get started.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {passwords.map((entry) => (
            <Card key={entry.id} className="glass-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-primary/10">
                    <Key className="h-5 w-5 text-primary" />
                  </div>

                  {/* DETAILS */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold">{entry.title}</h3>

                    {entry.username && (
                      <p className="text-sm text-muted-foreground">{entry.username}</p>
                    )}

                    {entry.url && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Globe className="h-3 w-3" />
                        {entry.url}
                      </p>
                    )}

                    {/* PASSWORD VISIBILITY */}
                    <div className="mt-2 flex items-center gap-2">
                      <code className="text-sm bg-muted px-2 py-1 rounded font-mono">
                        {visiblePasswords[entry.id] || "••••••••"}
                      </code>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => togglePassword(entry.id.toString(), entry)}
                      >
                        {visiblePasswords[entry.id] ? (
                          <EyeOff className="h-3 w-3" />
                        ) : (
                          <Eye className="h-3 w-3" />
                        )}
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => copyPassword(entry)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  <Badge variant="outline" className="border-primary/30 text-primary">
                    <Lock className="mr-1 h-3 w-3" /> Encrypted
                  </Badge>

                  {/* UPDATE BUTTON */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-yellow-500"
                    onClick={() => openUpdateModal(entry)}
                  >
                    ✏️
                  </Button>

                  {/* DELETE BUTTON */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive"
                    onClick={() => {
                      setDeleteTarget(entry);
                      setConfirmOpen(true);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* DELETE DIALOG */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Password?</DialogTitle>
          </DialogHeader>

          <p className="text-muted-foreground">
            Delete <b>{deleteTarget?.title}</b>? This cannot be undone.
          </p>

          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                await deletePassword(deleteTarget.id);
                toast({ title: "Deleted", description: "Password removed." });
                setConfirmOpen(false);
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* UPDATE DIALOG */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Password</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label>Title</Label>
              <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
            </div>

            <div>
              <Label>Username</Label>
              <Input value={editUsername} onChange={(e) => setEditUsername(e.target.value)} />
            </div>

            <div>
              <Label>Password</Label>
              <Input
                type="password"
                value={editPassword}
                onChange={(e) => setEditPassword(e.target.value)}
              />
            </div>

            <div>
              <Label>URL</Label>
              <Input value={editUrl} onChange={(e) => setEditUrl(e.target.value)} />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>

            <Button
  className="bg-yellow-500 hover:bg-yellow-600 text-white"
  onClick={async () => {
    try {
      await updatePassword(editTarget.id, {
        title: editTitle,
        username: editUsername,
        password: editPassword,
        url: editUrl,
      });

      Swal.fire({
        icon: "success",
        title: "Password Updated Successfully!",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
      });

      setEditOpen(false);
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: "Something went wrong while updating.",
      });
    }
  }}
>
  Save Changes
</Button>


          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Passwords;
