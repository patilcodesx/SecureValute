import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save, Lock } from "lucide-react";

import {
  encryptData,
  generateEncryptionKey,
  exportKey,
  importKey,
} from "@/lib/crypto";

import { apiFetch } from "@/lib/api";

export default function CreateNote() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");

  const navigate = useNavigate();
  const { toast } = useToast();

  // ------------------------------------------------
  // Load AES key from localStorage OR generate one
  // ------------------------------------------------
  const loadEncryptionKey = async (): Promise<CryptoKey> => {
    const savedKey = localStorage.getItem("securevault_note_key");

    if (savedKey) {
      return importKey(savedKey);
    }

    const newKey = await generateEncryptionKey();
    const exported = await exportKey(newKey);
    localStorage.setItem("securevault_note_key", exported);
    return newKey;
  };

  // ------------------------------------------------
  // Submit encrypted note to backend
  // ------------------------------------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast({
        title: "Missing Title",
        description: "Please enter a title for your note.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Load or generate encryption key
      const key = await loadEncryptionKey();

      // AES encrypt the content locally (E2E)
      const { encrypted, iv } = await encryptData(content, key);

      // Convert tags to JSON array string
      const tagArray = tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      // Prepare payload for backend
      const payload = {
        title,
        encryptedContent: encrypted,
        iv,
        tags: JSON.stringify(tagArray),
      };

      // POST note to backend
      const saved = await apiFetch("/notes", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      toast({
        title: "Note Created",
        description: "Your encrypted note has been securely stored.",
      });

      // Navigate to note detail page
      navigate(`/notes/${saved.id}`);

    } catch (err) {
      console.error("Create Note Error:", err);
      toast({
        title: "Encryption Error",
        description: "Failed to save this encrypted note.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/notes">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>

        <div>
          <h1 className="text-3xl font-bold">Create Note</h1>
          <p className="text-muted-foreground">
            Your note is encrypted locally (AES-256) before upload.
          </p>
        </div>
      </div>

      {/* Card */}
      <Card className="glass-card">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Title */}
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Note title"
                className="input-secure"
                required
              />
            </div>

            {/* Content */}
            <div className="space-y-2">
              <Label>Content</Label>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your encrypted note..."
                className="input-secure min-h-[200px]"
              />
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label>Tags (comma separated)</Label>
              <Input
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="personal, work, important"
                className="input-secure"
              />
            </div>

            {/* Notice */}
            <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 flex items-center gap-2 text-sm">
              <Lock className="h-4 w-4 text-primary" />
              <span>This note is AES-256 encrypted before upload.</span>
            </div>

            {/* Submit */}
            <Button type="submit" className="w-full btn-gradient">
              <Save className="mr-2 h-4 w-4" />
              Save Encrypted Note
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
