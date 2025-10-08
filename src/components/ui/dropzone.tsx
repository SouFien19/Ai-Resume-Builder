import * as React from "react";
import { cn } from "@/lib/utils";

export interface DropzoneProps {
  onDrop: (file: File) => void;
  accept?: string;
  children?: React.ReactNode;
  className?: string;
}

export function Dropzone({ onDrop, accept = "application/pdf", children, className }: DropzoneProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = React.useState(false);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file && (!accept || file.type === accept)) {
      onDrop(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => {
    setDragActive(false);
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && (!accept || file.type === accept)) {
      onDrop(file);
    }
  };

  return (
    <div
      className={cn(
        "border border-dashed rounded-md p-4 text-sm text-muted-foreground bg-muted/20 hover:bg-muted/30 transition cursor-pointer flex flex-col items-center justify-center",
        dragActive && "bg-primary/10 border-primary",
        className
      )}
      onClick={handleClick}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      tabIndex={0}
      role="button"
      aria-label="Upload PDF resume"
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleChange}
      />
      {children || <span>Drag & drop your PDF here, or click to upload</span>}
    </div>
  );
}
