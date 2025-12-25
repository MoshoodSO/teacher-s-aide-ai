import { useState, useCallback } from "react";
import { Upload, FileText, Image, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  onFileSelect: (file: File | null) => void;
  accept?: string;
  label?: string;
  selectedFile?: File | null;
}

export const FileUpload = ({ 
  onFileSelect, 
  accept = ".pdf,.jpg,.jpeg,.png",
  label = "Upload curriculum or scheme of work",
  selectedFile
}: FileUploadProps) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      onFileSelect(file);
    }
  }, [onFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  }, [onFileSelect]);

  const removeFile = useCallback(() => {
    onFileSelect(null);
  }, [onFileSelect]);

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <Image className="w-8 h-8 text-accent" />;
    }
    return <FileText className="w-8 h-8 text-primary" />;
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-foreground mb-2">
        {label}
      </label>
      
      {selectedFile ? (
        <div className="relative p-4 rounded-xl border-2 border-primary/30 bg-primary/5 animate-scale-in">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-card shadow-sm">
              {getFileIcon(selectedFile)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground truncate">{selectedFile.name}</p>
              <p className="text-sm text-muted-foreground">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-primary/10">
                <Check className="w-4 h-4 text-primary" />
              </div>
              <button
                onClick={removeFile}
                className="p-2 rounded-full hover:bg-destructive/10 transition-colors"
              >
                <X className="w-4 h-4 text-destructive" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <label
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={cn(
            "flex flex-col items-center justify-center w-full h-48 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200",
            isDragOver
              ? "border-primary bg-primary/10 scale-[1.02]"
              : "border-border bg-muted/30 hover:border-primary/50 hover:bg-muted/50"
          )}
        >
          <div className="flex flex-col items-center gap-3 p-6">
            <div className={cn(
              "p-4 rounded-full transition-colors",
              isDragOver ? "bg-primary/20" : "bg-muted"
            )}>
              <Upload className={cn(
                "w-8 h-8 transition-colors",
                isDragOver ? "text-primary" : "text-muted-foreground"
              )} />
            </div>
            <div className="text-center">
              <p className="font-medium text-foreground">
                Drop your file here or <span className="text-primary">browse</span>
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Supports PDF, JPG, PNG
              </p>
            </div>
          </div>
          <input
            type="file"
            accept={accept}
            onChange={handleFileInput}
            className="hidden"
          />
        </label>
      )}
    </div>
  );
};
