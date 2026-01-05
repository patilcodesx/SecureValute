// src/pages/SharedView.tsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useFiles } from "@/contexts/FilesContext";
import { Lock, Download, AlertTriangle } from "lucide-react";
import { importKey, base64ToArrayBuffer, decryptFile } from "@/lib/crypto";
import Swal from "sweetalert2";

export default function SharedView() {
  const { token } = useParams();
  const { openSharedFile } = useFiles();
  const { toast } = useToast();

  const [fileData, setFileData] = useState<any>(null);
  const [password, setPassword] = useState("");
  const [needsPassword, setNeedsPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // -----------------------------------------------------
  // LOAD FILE
  // -----------------------------------------------------
  const loadFile = async (overridePassword?: string) => {
    try {
      setError("");
      setLoading(true);

      const res = await openSharedFile(token!, overridePassword);

      // ❌ WRONG PASSWORD
      if (res?.passwordRequired === true && overridePassword) {
        Swal.fire({
          title: "Incorrect password",
          text: "The password you entered is incorrect.",
          icon: "error",
          timer: 2500,
          showConfirmButton: false,
        });

        setNeedsPassword(true);
        setLoading(false);
        return;
      }

      // First time asking password
      if (res?.passwordRequired === true) {
        setNeedsPassword(true);
        setLoading(false);
        return;
      }

      // SUCCESS
      setNeedsPassword(false);
      setFileData(res);
      setLoading(false);
    } catch (err: any) {
      setError("Invalid or expired link");
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUnlock = () => loadFile(password);

  // -----------------------------------------------------
  // DOWNLOAD DECRYPTED FILE
  // -----------------------------------------------------
  const handleDownload = async () => {
    try {
      const { encryptedData, iv, encryptionKey, fileName, type } = fileData || {};

      if (!encryptedData || !iv || !encryptionKey) {
  return Swal.fire({
    title: "File Unavailable",
    text: "This shared file is no longer available. It may have expired or reached its maximum number of opens.",
    icon: "error",
    timer: 4000,
    showConfirmButton: false,
  });
}


      const encBuffer = base64ToArrayBuffer(encryptedData);
      const key = await importKey(encryptionKey);

      const decryptedBuffer = await decryptFile(encBuffer, iv, key);

      const blob = new Blob([decryptedBuffer], {
        type: type || "application/octet-stream",
      });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = fileName || "download";
      a.click();

      URL.revokeObjectURL(url);

      // ✅ SWEET ALERT FOR DOWNLOAD COMPLETED (2 seconds)
      Swal.fire({
        title: "Download Completed",
        text: `${fileName || "File"} downloaded successfully.`,
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });

    } catch (err) {
      console.error("Decrypt error:", err);

      Swal.fire({
        title: "Decryption failed",
        text: "Wrong key or corrupted file.",
        icon: "error",
        timer: 2500,
        showConfirmButton: false,
      });
    }
  };

  // -----------------------------------------------------
  // UI
  // -----------------------------------------------------
  if (error) {
    return (
      <div className="max-w-md mx-auto mt-20">
        <Card className="border-red-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle /> Link Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) return <p className="text-center mt-20">Loading...</p>;

  return (
    <div className="max-w-md mx-auto mt-10">
      <Card>
        <CardHeader>
          <CardTitle>Shared File</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {fileData?.fileName && (
            <p className="text-lg font-semibold">{fileData.fileName}</p>
          )}

          {/* PASSWORD FIELD */}
          {needsPassword && (
            <div className="space-y-2">
              <p className="font-medium flex items-center gap-2">
                <Lock className="h-4 w-4" /> Password required
              </p>

              <Input
                placeholder="Enter password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <Button onClick={handleUnlock} className="w-full">
                Unlock File
              </Button>
            </div>
          )}

          {/* DOWNLOAD BUTTON */}
          {!needsPassword && fileData && (
            <Button onClick={handleDownload} className="w-full">
              <Download className="mr-2 h-4 w-4" /> Download File
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
