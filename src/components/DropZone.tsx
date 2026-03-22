import { useCallback, useRef, useState } from "react";
import { Upload, FileIcon, X, Image, Film, FileText } from "lucide-react";
import { formatBytes, getFileType } from "../lib/utils";

interface DropZoneProps {
  files: File[];
  onFilesAdded: (files: File[]) => void;
  onFileRemoved: (index: number) => void;
  disabled?: boolean;
}

function FileTypeIcon({ filename }: { filename: string }) {
  const type = getFileType(filename);
  const className = "h-8 w-8";
  switch (type) {
    case "image":
      return <Image className={`${className} text-blue-400`} />;
    case "video":
      return <Film className={`${className} text-purple-400`} />;
    case "pdf":
      return <FileText className={`${className} text-red-400`} />;
    case "document":
      return <FileText className={`${className} text-yellow-400`} />;
    default:
      return <FileIcon className={`${className} text-gray-400`} />;
  }
}

export function DropZone({ files, onFilesAdded, onFileRemoved, disabled }: DropZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [previews, setPreviews] = useState<Map<string, string>>(new Map());

  const generatePreview = useCallback((file: File) => {
    const type = getFileType(file.name);
    if (type === "image" || type === "video") {
      const url = URL.createObjectURL(file);
      setPreviews((prev) => new Map(prev).set(`${file.name}-${file.size}`, url));
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      if (disabled) return;
      const dropped = Array.from(e.dataTransfer.files);
      dropped.forEach(generatePreview);
      onFilesAdded(dropped);
    },
    [onFilesAdded, disabled, generatePreview],
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selected = Array.from(e.target.files ?? []);
      selected.forEach(generatePreview);
      onFilesAdded(selected);
      e.target.value = "";
    },
    [onFilesAdded, generatePreview],
  );

  const handleRemove = useCallback(
    (index: number) => {
      const file = files[index];
      const key = `${file.name}-${file.size}`;
      const url = previews.get(key);
      if (url) {
        URL.revokeObjectURL(url);
        setPreviews((prev) => {
          const next = new Map(prev);
          next.delete(key);
          return next;
        });
      }
      onFileRemoved(index);
    },
    [files, previews, onFileRemoved],
  );

  return (
    <div className="space-y-6">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => !disabled && inputRef.current?.click()}
        className={`group relative cursor-pointer rounded-2xl border-2 border-dashed p-12 text-center transition-all sm:p-16 ${
          isDragOver
            ? "border-shelby-400 bg-shelby-500/10"
            : "border-gray-700 bg-gray-900/30 hover:border-gray-600 hover:bg-gray-900/50"
        } ${disabled ? "pointer-events-none opacity-50" : ""}`}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          onChange={handleFileInput}
          className="hidden"
        />
        <div className="flex flex-col items-center gap-4">
          <div
            className={`flex h-16 w-16 items-center justify-center rounded-2xl transition-colors ${
              isDragOver ? "bg-shelby-500/20" : "bg-gray-800 group-hover:bg-gray-700"
            }`}
          >
            <Upload
              className={`h-8 w-8 transition-colors ${
                isDragOver ? "text-shelby-400" : "text-gray-400 group-hover:text-gray-300"
              }`}
            />
          </div>
          <div>
            <p className="text-lg font-semibold text-gray-200">
              {isDragOver ? "Release to add files" : "Drag & drop files here"}
            </p>
            <p className="mt-1 text-sm text-gray-500">
              or click to browse &bull; images, videos, PDFs, documents, anything
            </p>
          </div>
        </div>
      </div>

      {files.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-300">
              {files.length} file{files.length !== 1 && "s"} selected
              <span className="ml-2 text-gray-500">
                ({formatBytes(files.reduce((sum, f) => sum + f.size, 0))})
              </span>
            </h3>
          </div>
          <div className="space-y-2">
            {files.map((file, i) => {
              const key = `${file.name}-${file.size}`;
              const previewUrl = previews.get(key);
              const fileType = getFileType(file.name);

              return (
                <div
                  key={`${key}-${i}`}
                  className="flex items-center gap-4 rounded-xl border border-gray-800 bg-gray-900/50 p-3 transition-colors hover:border-gray-700"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gray-800">
                    {previewUrl && fileType === "image" ? (
                      <img
                        src={previewUrl}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : previewUrl && fileType === "video" ? (
                      <video
                        src={previewUrl}
                        className="h-full w-full object-cover"
                        muted
                      />
                    ) : (
                      <FileTypeIcon filename={file.name} />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-200">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500">{formatBytes(file.size)}</p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove(i);
                    }}
                    className="shrink-0 rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-gray-800 hover:text-gray-300"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
