import { Image, Film, FileText, FileIcon } from "lucide-react";
import { getFileType, type FileCategory } from "../lib/utils";

interface FilePreviewProps {
  blobUrl: string;
  filename: string;
}

function PlaceholderIcon({ type }: { type: FileCategory }) {
  const className = "h-20 w-20";
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

export function FilePreview({ blobUrl, filename }: FilePreviewProps) {
  const fileType = getFileType(filename);

  if (fileType === "image") {
    return (
      <div className="flex items-center justify-center overflow-hidden rounded-2xl border border-gray-800 bg-gray-900/50">
        <img
          src={blobUrl}
          alt={filename}
          className="max-h-[70vh] w-full object-contain"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = "none";
            target.parentElement?.classList.add("py-20");
            const fallback = document.createElement("div");
            fallback.className = "flex flex-col items-center gap-3";
            fallback.innerHTML = `<p class="text-gray-400 text-sm">Preview unavailable</p>`;
            target.parentElement?.appendChild(fallback);
          }}
        />
      </div>
    );
  }

  if (fileType === "video") {
    return (
      <div className="overflow-hidden rounded-2xl border border-gray-800 bg-gray-900/50">
        <video
          src={blobUrl}
          controls
          className="max-h-[70vh] w-full"
          preload="metadata"
        >
          Your browser does not support the video tag.
        </video>
      </div>
    );
  }

  if (fileType === "pdf") {
    return (
      <div className="overflow-hidden rounded-2xl border border-gray-800 bg-gray-900/50">
        <iframe
          src={blobUrl}
          title={filename}
          className="h-[70vh] w-full border-0"
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-gray-800 bg-gray-900/50 py-20">
      <PlaceholderIcon type={fileType} />
      <div className="text-center">
        <p className="text-lg font-medium text-gray-300">{filename}</p>
        <p className="mt-1 text-sm text-gray-500">
          Preview not available for this file type
        </p>
      </div>
    </div>
  );
}
