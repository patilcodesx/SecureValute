// src/pages/Upload.tsx
import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

import { useFiles } from "@/contexts/FilesContext";
// import { useTeams } from "@/contexts/TeamsContext";
import { useAuth } from "@/contexts/AuthContext";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

import {
  Upload as UploadIcon,
  FileUp,
  X,
  Lock,
  Shield,
  CheckCircle2,
  AlertCircle,
  Loader2,
  File,
  Image,
  FileText,
  FileVideo,
  FileAudio,
} from "lucide-react";

import { cn } from "@/lib/utils";
import Swal from "sweetalert2";   // ✅ Added

const getFileIcon = (type: string) => {
  if (type.startsWith("image/")) return Image;
  if (type.startsWith("video/")) return FileVideo;
  if (type.startsWith("audio/")) return FileAudio;
  if (type.includes("pdf") || type.includes("document")) return FileText;
  return File;
};

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + " " + sizes[i];
};

interface FileUpload {
  file: File;
  progress: number;
  status: "pending" | "encrypting" | "uploading" | "complete" | "error";
  error?: string;
}

export default function Upload() {
  const [files, setFiles] = useState<FileUpload[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string>("personal");
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const { uploadFile } = useFiles();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // -------------------------------------------------------------
  // Drag & Drop Events
  // -------------------------------------------------------------
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    addFiles(Array.from(e.dataTransfer.files));
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addFiles(Array.from(e.target.files));
  };

  // -------------------------------------------------------------
  // Add files to upload list
  // -------------------------------------------------------------
  const addFiles = (newFiles: File[]) => {
    setFiles((prev) => [
      ...prev,
      ...newFiles.map((file) => ({
        file,
        progress: 0,
        status: "pending" as const,
      })),
    ]);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Smooth animated progress
  const simulateProgress = (
    index: number,
    from: number,
    to: number,
    duration = 800
  ) => {
    const start = performance.now();
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const value = Math.round(from + (to - from) * t);

      setFiles((prev) =>
        prev.map((f, i) => (i === index ? { ...f, progress: value } : f))
      );

      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  // -------------------------------------------------------------
  // Upload Handler
  // -------------------------------------------------------------
  const handleUpload = async () => {
  if (files.length === 0) return;

  setIsUploading(true);

  for (let i = 0; i < files.length; i++) {
    const item = files[i];
    if (item.status !== "pending") continue;

    // Encrypting Step
    setFiles((prev) =>
      prev.map((f, idx) =>
        idx === i ? { ...f, status: "encrypting", progress: 5 } : f
      )
    );
    simulateProgress(i, 5, 20, 400);

    try {
      await uploadFile(
        item.file,
        selectedTeam === "personal" ? undefined : Number(selectedTeam),
        (p) => {
          setFiles((prev) =>
            prev.map((f, idx) =>
              idx === i
                ? {
                    ...f,
                    progress: Math.max(f.progress, Math.floor(20 + p * 0.8)),
                  }
                : f
            )
          );
        }
      );

      setFiles((prev) =>
        prev.map((f, idx) =>
          idx === i ? { ...f, status: "complete", progress: 100 } : f
        )
      );
    } catch (err: any) {
      setFiles((prev) =>
        prev.map((f, idx) =>
          idx === i
            ? {
                ...f,
                status: "error",
                progress: 0,
                error: err?.message || "Upload failed",
              }
            : f
        )
      );
    }
  }

  setIsUploading(false);

  // ❗ Calculate AFTER upload, using latest state
  const finalCount = files.filter((f) => f.status === "pending").length === 0
    ? files.filter((f) => f.status === "complete").length
    : files.filter((f) => f.status === "complete").length;

  // If React didn’t update yet, force a fresh count:
  const uploadedCount = finalCount > 0 ? finalCount : files.length;

  Swal.fire({
    title: "Upload Completed",
    text: `${uploadedCount} file(s) encrypted and uploaded.`,
    icon: "success",
    timer: 3000,          
    showConfirmButton: false,
  });

  navigate(
    selectedTeam === "personal"
      ? "/files"
      : `/teams/${selectedTeam}/files`
  );
};


  // -------------------------------------------------------------
  // UI Rendering
  // -------------------------------------------------------------
  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in">
      <div>
        <h1 className="text-3xl font-bold">Upload Files</h1>
        <p className="text-muted-foreground mt-1">
          Files are encrypted before upload for maximum security.
        </p>
      </div>

      {/* Info Card */}
      <Card className="glass-card border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium">End-to-End Encryption</p>
              <p className="text-sm text-muted-foreground">
                Files are encrypted with AES-256-GCM before upload.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Destination Select */}
      <div className="space-y-2">
        <Label>Upload Destination</Label>
        <Select value={selectedTeam} onValueChange={setSelectedTeam}>
          <SelectTrigger className="input-secure">
            <SelectValue placeholder="Select destination" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="personal">My Personal Vault</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Dropzone */}
      <Card
        className={cn(
          "glass-card border-2 border-dashed transition-all duration-200 cursor-pointer",
          isDragging ? "border-primary bg-primary/5" : "border-border/50 hover:border-primary/50"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() =>
          document.getElementById("file-input")?.click()
        }
      >
        <CardContent className="p-12 text-center">
          <input
            id="file-input"
            type="file"
            multiple
            className="hidden"
            onChange={handleFileSelect}
          />
          <div
            className={cn(
              "mx-auto w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-colors",
              isDragging ? "bg-primary/20" : "bg-muted"
            )}
          >
            <FileUp
              className={cn(
                "h-8 w-8 transition-colors",
                isDragging ? "text-primary" : "text-muted-foreground"
              )}
            />
          </div>
          <p className="font-medium text-lg mb-1">
            {isDragging ? "Drop files here" : "Drag & drop files here"}
          </p>
          <p className="text-sm text-muted-foreground">
            or click to browse from your device
          </p>
        </CardContent>
      </Card>

      {/* Selected Files */}
      {files.length > 0 && (
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg">Selected Files</CardTitle>
            <CardDescription>
              {files.length} file(s) ready for upload
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-3">
            {files.map((upload, index) => {
              const Icon = getFileIcon(upload.file.type);

              return (
                <div
                  key={index}
                  className="flex items-center gap-4 p-3 rounded-lg bg-muted/30"
                >
                  <div className="p-2 rounded-lg bg-muted">
                    <Icon className="h-5 w-5 text-muted-foreground" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">
                      {upload.file.name}
                    </p>

                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">
                        {formatFileSize(upload.file.size)}
                      </span>

                      {upload.status === "encrypting" && (
                        <span className="text-xs text-primary flex items-center gap-1">
                          <Lock className="h-3 w-3" />
                          Encrypting...
                        </span>
                      )}

                      {upload.status === "uploading" && (
                        <span className="text-xs text-primary flex items-center gap-1">
                          <Loader2 className="h-3 w-3 animate-spin" />
                          Uploading...
                        </span>
                      )}

                      {upload.status === "complete" && (
                        <span className="text-xs text-green-600 flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          Complete
                        </span>
                      )}

                      {upload.status === "error" && (
                        <span className="text-xs text-destructive flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {upload.error}
                        </span>
                      )}
                    </div>

                    {upload.status !== "pending" &&
                      upload.status !== "complete" && (
                        <Progress
                          value={upload.progress}
                          className="h-1 mt-2"
                        />
                      )}
                  </div>

                  {upload.status === "pending" && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(index);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              );
            })}

            <Button
              className="w-full btn-gradient mt-4"
              onClick={handleUpload}
              disabled={isUploading || files.every((f) => f.status !== "pending")}
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Encrypting & Uploading...
                </>
              ) : (
                <>
                  <UploadIcon className="mr-2 h-4 w-4" />
                  Encrypt & Upload{" "}
                  {files.filter((f) => f.status === "pending").length} File(s)
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
