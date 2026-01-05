import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useFiles } from "@/contexts/FilesContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Share2, ArrowLeft, Link as LinkIcon, Copy } from "lucide-react";

export default function CreateShare() {
  const { fileId } = useParams<{ fileId: string }>();
  const [expiresIn, setExpiresIn] = useState(24);
  const [maxOpens, setMaxOpens] = useState<number | undefined>(undefined);
  const [password, setPassword] = useState("");
  const [shareLink, setShareLink] = useState<string | null>(null);

  const { getFile, createShareLink } = useFiles();
  const { toast } = useToast();

  const file = getFile(fileId || "");

  if (!file)
    return (
      <div className="text-center py-16">
        <Link to="/files">
          <Button>Back</Button>
        </Link>
      </div>
    );

  const handleCreate = async () => {
    try {
      const payload = {
        fileId,
        expiresInHours: expiresIn, // ✅ FIXED — matches backend
        maxOpens: maxOpens ?? null,
        password: password || null,
      };

      const result = await createShareLink(payload);

      const url = `${window.location.origin}/share/${result.token}`;
      setShareLink(url);

      toast({
        title: "Share link created",
        description: "You can copy and share this link.",
      });
    } catch (err) {
      toast({
        title: "Failed",
        description: "Could not create share link",
        variant: "destructive",
      });
    }
  };

  const copyLink = () => {
    if (shareLink) {
      navigator.clipboard.writeText(shareLink);
      toast({ title: "Copied!" });
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 animate-in">
      <div className="flex items-center gap-4">
        <Link to="/files">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>

        <div>
          <h1 className="text-2xl font-bold">Share File</h1>
          <p className="text-muted-foreground">{file.name}</p>
        </div>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle>
            <Share2 className="inline mr-2 h-5 w-5" />
            Share Settings
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Expires in (hours)</Label>
            <Input
              type="number"
              value={expiresIn}
              min={1}
              onChange={(e) => setExpiresIn(Number(e.target.value))}
            />
          </div>

          <div className="space-y-2">
            <Label>Max opens (optional)</Label>
            <Input
              type="number"
              value={maxOpens || ""}
              onChange={(e) =>
                setMaxOpens(e.target.value ? Number(e.target.value) : undefined)
              }
              placeholder="Unlimited"
            />
          </div>

          <div className="space-y-2">
            <Label>Password (optional)</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Leave empty for no password"
            />
          </div>

          {shareLink ? (
            <div className="p-4 rounded-lg bg-success/10 border border-success/20">
              <p className="text-sm font-medium mb-2">Share Link:</p>
              <div className="flex items-center gap-2">
                <Input value={shareLink} readOnly className="font-mono text-xs" />
                <Button size="icon" onClick={copyLink}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <Button onClick={handleCreate} className="w-full btn-gradient">
              <LinkIcon className="mr-2 h-4 w-4" />
              Generate Share Link
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
