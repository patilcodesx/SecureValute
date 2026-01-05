// src/components/layout/Topbar.tsx
import { Bell, Search, Shield, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export function Topbar() {
  const { securityAlerts = [], markAlertRead, user } = useAuth();
  const navigate = useNavigate();

  const unreadAlerts = securityAlerts.filter((a) => !a.isRead);

  const getSeverityColor = (s: string) => {
    switch (s) {
      case "critical":
        return "bg-destructive text-destructive-foreground";
      case "high":
        return "bg-warning text-warning-foreground";
      case "medium":
        return "bg-primary/20 text-primary";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <header className="h-16 border-b border-border bg-card/50 backdrop-blur-xl flex items-center justify-between px-6">
      <div className="flex items-center gap-4 flex-1 max-w-md">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search files, notes, passwords..."
            className="pl-10 bg-muted/50 border-border/50"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-success/10 border border-success/20">
          <Shield className="h-4 w-4 text-success" />
          <span className="text-xs text-success font-medium">Encrypted</span>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {unreadAlerts.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-destructive text-white rounded-full h-5 w-5 text-xs flex items-center justify-center">
                  {unreadAlerts.length}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-80">
            <div className="flex items-center justify-between px-4 py-2">
              <span className="font-semibold">Security Alerts</span>
              {unreadAlerts.length > 0 && (
                <Badge variant="destructive">{unreadAlerts.length} new</Badge>
              )}
            </div>

            <DropdownMenuSeparator />

            {securityAlerts.length === 0 ? (
              <div className="px-4 py-8 text-center text-muted-foreground">
                <Shield className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No security alerts</p>
              </div>
            ) : (
              securityAlerts.slice(0, 5).map((alert) => (
                <DropdownMenuItem
                  key={alert.id}
                  className="flex items-start gap-3 p-3 cursor-pointer"
                  onClick={() => {
                    markAlertRead(alert.id);
                    navigate("/security");
                  }}
                >
                  <div className={`p-1.5 rounded ${getSeverityColor(alert.severity)}`}>
                    <AlertTriangle className="h-3.5 w-3.5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${!alert.isRead ? "font-medium" : ""}`}>
                      {alert.message}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(alert.timestamp).toLocaleString()}
                    </p>
                  </div>

                  {!alert.isRead && <span className="w-2 h-2 bg-primary rounded-full" />}
                </DropdownMenuItem>
              ))
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
