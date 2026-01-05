import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Plus, Lock, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { apiFetch } from "@/lib/api";

export default function Notes() {
  const [search, setSearch] = useState("");
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // -----------------------------------------
  // Load notes from backend
  // -----------------------------------------
  const loadNotes = async () => {
    try {
      const res = await apiFetch("/notes", { method: "GET" });

      const normalized = (res || []).map((note: any) => ({
        ...note,
        tags: normalizeTags(note.tags),
      }));

      setNotes(normalized);
    } catch (err) {
      console.error("Failed to load notes", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotes();
  }, []);

  // -----------------------------------------
  // Normalize tags → ALWAYS return array
  // -----------------------------------------
  const normalizeTags = (tags: any): string[] => {
    if (Array.isArray(tags)) return tags;

    if (!tags) return [];

    try {
      const parsed = JSON.parse(tags);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  // -----------------------------------------
  // Filter Notes
  // -----------------------------------------
  const filtered = notes.filter((n) =>
    (n.title || "Untitled")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Encrypted Notes</h1>
          <p className="text-muted-foreground">{filtered.length} note(s)</p>
        </div>

        <Link to="/notes/create">
          <Button className="btn-gradient">
            <Plus className="mr-2 h-4 w-4" />
            New Note
          </Button>
        </Link>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search notes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 input-secure"
        />
      </div>

      {/* Loading */}
      {loading ? (
        <Card className="glass-card">
          <CardContent className="py-16 text-center">Loading notes...</CardContent>
        </Card>
      ) : filtered.length === 0 ? (
        // Empty State
        <Card className="glass-card">
          <CardContent className="py-16 text-center">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="font-semibold mb-2">No notes yet</h3>
            <Link to="/notes/create">
              <Button className="btn-gradient">
                <Plus className="mr-2 h-4 w-4" />
                Create Note
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        // Notes Grid
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((note) => {
            const tags = normalizeTags(note.tags);

            return (
              <Link key={note.id} to={`/notes/${note.id}`}>
                <Card className="glass-card hover-lift h-full">
                  <CardContent className="p-4">
                    {/* Icon Row */}
                    <div className="flex items-start justify-between mb-2">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>

                      <Badge
                        variant="outline"
                        className="text-xs border-primary/30 text-primary"
                      >
                        <Lock className="mr-1 h-3 w-3" />
                        Encrypted
                      </Badge>
                    </div>

                    {/* Title */}
                    <h3 className="font-semibold truncate">
                      {note.title || "Untitled"}
                    </h3>

                    {/* Date */}
                    <p className="text-xs text-muted-foreground mt-2">
                      {note.createdAt
                        ? new Date(note.createdAt).toLocaleDateString()
                        : ""}
                    </p>

                    {/* Tags */}
                    {tags.length > 0 && (
                      <div className="flex gap-1 mt-2 flex-wrap">
                        {tags.slice(0, 3).map((tag: string) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="text-xs"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
