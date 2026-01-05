import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Shield, CheckCircle2, XCircle, Key } from "lucide-react";

export default function TwoFactorSetup() {
  const { user, enable2FA, disable2FA } = useAuth();
  const [secret, setSecret] = useState<string | null>(null);
  const { toast } = useToast();

  const handleEnable = async () => {
    const newSecret = await enable2FA();
    if (newSecret) setSecret(newSecret);

    toast({
      title: "2FA Enabled",
      description: "Two-factor authentication is now active."
    });
  };

  const handleDisable = () => {
    disable2FA();
    setSecret(null);

    toast({ title: "2FA Disabled" });
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 animate-in">
      <div>
        <h1 className="text-3xl font-bold">Two-Factor Authentication</h1>
        <p className="text-muted-foreground">Add an extra layer of security</p>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" /> 2FA Status
          </CardTitle>
          <CardDescription>
            Protect your account with an additional verification step
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div
            className={`p-4 rounded-lg ${
              user?.twoFactorEnabled
                ? "bg-success/10 border border-success/20"
                : "bg-warning/10 border border-warning/20"
            }`}
          >
            <div className="flex items-center gap-3">
              {user?.twoFactorEnabled ? (
                <CheckCircle2 className="h-6 w-6 text-success" />
              ) : (
                <XCircle className="h-6 w-6 text-warning" />
              )}

              <div>
                <p className="font-semibold">
                  {user?.twoFactorEnabled ? "2FA is Enabled" : "2FA is Disabled"}
                </p>
                <p className="text-sm opacity-80">
                  {user?.twoFactorEnabled
                    ? "Your account has enhanced security"
                    : "Enable 2FA for better protection"}
                </p>
              </div>
            </div>
          </div>

          {secret && !user?.twoFactorEnabled && (
            <div className="p-4 rounded-lg bg-muted/50 border">
              <p className="text-sm font-medium mb-2">Your 2FA Secret:</p>
              <code className="text-2xl font-mono tracking-wider">{secret}</code>
              <p className="text-xs text-muted-foreground mt-2">
                Scan this using your authenticator app.
              </p>
            </div>
          )}

          {user?.twoFactorEnabled ? (
            <Button variant="destructive" onClick={handleDisable}>
              <XCircle className="mr-2 h-4 w-4" /> Disable 2FA
            </Button>
          ) : (
            <Button className="btn-gradient" onClick={handleEnable}>
              <Key className="mr-2 h-4 w-4" /> Enable 2FA
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
