import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Smartphone, Monitor, Globe, LogOut, CheckCircle2 } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function Sessions() {
  const [sessions, setSessions] = useState([]);
  const { toast } = useToast();

  const load = async () => {
    try {
      const res = await apiFetch("/sessions", { method: "GET" });
      setSessions(Array.isArray(res) ? res : []);
    } catch (err) {
      toast({ title: "Error loading sessions", variant: "destructive" });
    }
  };

  const terminate = async (id) => {
    try {
      await apiFetch(`/sessions/${id}`, { method: "DELETE" });
      toast({ title: "Session terminated" });
      load();
    } catch {
      toast({ title: "Could not terminate", variant: "destructive" });
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Active Sessions</h1>

      <Card>
        <CardHeader>
          <CardTitle>Your Devices</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {sessions.map((s) => (
            <div key={s.id} className="p-4 bg-muted/30 rounded-lg flex gap-4">
              <div className="p-3 bg-primary/10 rounded-xl">
                {s.device.toLowerCase().includes("mobile") ? (
                  <Smartphone className="text-primary" />
                ) : (
                  <Monitor className="text-primary" />
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{s.device}</h3>
                  {s.isCurrent && (
                    <Badge className="bg-green-200 text-green-800">
                      <CheckCircle2 /> Current
                    </Badge>
                  )}
                </div>

                <p className="text-sm text-muted-foreground">{s.userAgent}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  <Globe className="h-3 w-3" />
                  {s.ip} • Last active {new Date(s.lastActive).toLocaleString()}
                </p>
              </div>

              {!s.isCurrent && (
                <Button variant="outline" onClick={() => terminate(s.id)}>
                  <LogOut className="mr-2" /> Terminate
                </Button>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
