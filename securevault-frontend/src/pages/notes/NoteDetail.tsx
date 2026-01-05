import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Trash2, Lock, Loader2, Pencil } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { decryptData, importKey, encryptData } from "@/lib/crypto";
import Swal from "sweetalert2";

export default function NoteDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [note, setNote] = useState<any>(null);
  const [content, setContent] = useState<string | null>(null);
  const [editText, setEditText] = useState<string>("");
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNote();
  }, [id]);

  // -----------------------------------------
  // Load + Decrypt Note
  // -----------------------------------------
  const loadNote = async () => {
    try {
      const data = await apiFetch(`/notes/${id}`, { method: "GET" });
      if (!data) throw new Error("Note not found");

      setNote(data);

      const savedKey = localStorage.getItem("securevault_note_key");
      if (!savedKey) throw new Error("Missing encryption key");

      const key = await importKey(savedKey);

      const decrypted = await decryptData(data.encryptedContent, data.iv, key);
      setContent(decrypted);
      setEditText(decrypted); // Pre-fill for editing
    } catch (err) {
      console.error("Decryption failed:", err);

      Swal.fire({
        icon: "error",
        title: "Decryption Error",
        text: "Unable to decrypt note. Wrong key or corrupted data.",
      });

      setContent("[Decryption failed]");
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------------------
  // Delete Note (with SweetAlert confirmation)
  // -----------------------------------------
  const handleDelete = async () => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This note will be permanently deleted.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (!result.isConfirmed) return;

    try {
      await apiFetch(`/notes/${id}`, { method: "DELETE" });

      Swal.fire({
        icon: "success",
        title: "Deleted!",
        text: "Your note has been removed.",
        timer: 1500,
        showConfirmButton: false,
      });

      navigate("/notes");
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Delete Failed",
        text: "Unable to delete note.",
      });
    }
  };

  // -----------------------------------------
  // Update Note (AES-GCM re-encryption)
  // -----------------------------------------
  const handleUpdate = async () => {
    try {
      const savedKey = localStorage.getItem("securevault_note_key");
      if (!savedKey) throw new Error("Missing encryption key");

      const key = await importKey(savedKey);

      // Re-encrypt fresh content
      const { encrypted, iv } = await encryptData(editText, key);

      await apiFetch(`/notes/${id}`, {
        method: "PUT",
        body: JSON.stringify({
          title: note.title,
          encryptedContent: encrypted,
          iv,
          tags: note.tags,
        }),
      });

      Swal.fire({
        icon: "success",
        title: "Note Updated Successfully!",
        timer: 2000,
        showConfirmButton: false,
      });

      setContent(editText);
      setIsEditing(false);

    } catch (err) {
      console.error(err);

      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: "Could not update the note.",
      });
    }
  };

  if (!note) {
    return (
      <div className="text-center py-16">
        <Link to="/notes">
          <Button>Back to Notes</Button>
        </Link>
      </div>
    );
  }

  // -----------------------------------------
  // Ensure tags array
  // -----------------------------------------
  const tags = (() => {
    if (Array.isArray(note.tags)) return note.tags;
    try {
      const parsed = JSON.parse(note.tags || "[]");
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  })();

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/notes">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>

          <div>
            <h1 className="text-2xl font-bold">{note.title}</h1>
            <p className="text-sm text-muted-foreground">
              Updated {new Date(note.updatedAt).toLocaleString()}
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          {/* Update Button */}
          <Button
            className="bg-yellow-500 hover:bg-yellow-600 text-white"
            size="sm"
            onClick={() => setIsEditing(true)}
          >
            <Pencil className="mr-2 h-4 w-4" /> Update
          </Button>

          {/* Delete Button */}
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
          >
            <Trash2 className="mr-2 h-4 w-4" /> Delete
          </Button>
        </div>
      </div>

      {/* Tags */}
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="border-primary/30 text-primary">
          <Lock className="mr-1 h-3 w-3" /> Decrypted
        </Badge>

        {tags.map((t: string) => (
          <Badge key={t} variant="secondary">{t}</Badge>
        ))}
      </div>

      {/* Content */}
      <Card className="glass-card">
        <CardContent className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : isEditing ? (
            <>
              <textarea
                className="w-full p-3 border rounded-lg bg-white text-black min-h-[200px]"
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
              />

              <div className="flex gap-3 mt-4">
                <Button
                  className="bg-yellow-600 hover:bg-yellow-700 text-white"
                  onClick={handleUpdate}
                >
                  Save Changes
                </Button>

                <Button variant="secondary" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
              </div>
            </>
          ) : (
            <p className="whitespace-pre-wrap">{content || "No content"}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
