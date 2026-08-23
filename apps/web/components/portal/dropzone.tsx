"use client";

import { useRef, useState } from "react";
import { File as FileIcon, UploadCloud, X } from "lucide-react";

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function Dropzone({
  files,
  onAdd,
  onRemove,
}: {
  files: File[];
  onAdd: (files: File[]) => void;
  onRemove: (index: number) => void;
}) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-4">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          onAdd(Array.from(e.dataTransfer.files));
        }}
        onClick={() => inputRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-12 text-center transition-colors duration-fast ${
          dragging ? "border-emerald bg-mint/40" : "border-pine/45 bg-white hover:bg-mint/10"
        }`}
      >
        <UploadCloud className="text-emerald" size={32} />
        <div>
          <p className="text-sm font-semibold text-pine">Drag & drop files here</p>
          <p className="mt-1 text-xs text-ink/60">or click to browse from your device</p>
        </div>
        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files) onAdd(Array.from(e.target.files));
            e.target.value = "";
          }}
        />
      </div>

      {files.length > 0 && (
        <ul className="space-y-2">
          {files.map((file, i) => (
            <li
              key={`${file.name}-${i}`}
              className="flex items-center justify-between gap-3 rounded-xl border-2 border-pine/25 bg-cream px-4 py-2.5"
            >
              <div className="flex min-w-0 items-center gap-2.5">
                <FileIcon className="shrink-0 text-emerald" size={16} />
                <span className="truncate text-sm text-ink">{file.name}</span>
                <span className="shrink-0 text-xs text-ink/50">{formatBytes(file.size)}</span>
              </div>
              <button
                type="button"
                onClick={() => onRemove(i)}
                className="shrink-0 rounded-full p-1 text-ink/50 transition-colors duration-fast hover:bg-red-50 hover:text-red-600"
                aria-label={`Remove ${file.name}`}
              >
                <X size={16} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
