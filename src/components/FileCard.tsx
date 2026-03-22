import { Link } from "react-router-dom";
import { Copy, ExternalLink, Image, Film, FileText, FileIcon, Check } from "lucide-react";
import { useState } from "react";
import { getFileType, getBlobUrl, getShareLink } from "../lib/utils";
import { toast } from "sonner";

interface FileCardProps {
  blobName: string;
  account: string;
  size?: number;
  registeredAt?: string;
}

function FileTypeIcon({ filename, className }: { filename: string; className?: string }) {
  const type = getFileType(filename);
  const base = className ?? "h-10 w-10";
  switch (type) {
    case "image":
      return <Image className={`${base} text-blue-400`} />;
    case "video":
      return <Film className={`${base} text-purple-400`} />;
    case "pdf":
      return <FileText className={`${base} text-red-400`} />;
    case "document":
      return <FileText className={`${base} text-yellow-400`} />;
    default:
      return <FileIcon className={`${base} text-gray-400`} />;
  }
}

export function FileCard({ blobName, account, size, registeredAt }: FileCardProps) {
  const [copied, setCopied] = useState(false);
  const fileType = getFileType(blobName);
  const blobUrl = getBlobUrl(account, blobName);
  const shareLink = getShareLink(account, blobName);
  const viewerLink = `/drop/${account}/${encodeURIComponent(blobName)}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    toast.success("Share link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="card group overflow-hidden">
      {/* Preview area */}
      <div className="relative -mx-6 -mt-6 mb-4 flex h-40 items-center justify-center overflow-hidden bg-gray-800/50">
        {fileType === "image" ? (
          <img
            src={blobUrl}
            alt={blobName}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
              (e.target as HTMLImageElement).nextElementSibling?.classList.remove("hidden");
            }}
          />
        ) : null}
        {fileType === "video" ? (
          <video
            src={blobUrl}
            className="h-full w-full object-cover"
            muted
            preload="metadata"
          />
        ) : null}
        {fileType !== "image" && fileType !== "video" && (
          <FileTypeIcon filename={blobName} className="h-14 w-14" />
        )}
        {(fileType === "image" || fileType === "video") && (
          <div className="hidden">
            <FileTypeIcon filename={blobName} className="h-14 w-14" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="space-y-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-gray-200" title={blobName}>
            {blobName}
          </p>
          <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
            {size != null && <span>{formatSize(size)}</span>}
            {registeredAt && <span>&bull; {formatDate(registeredAt)}</span>}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-gray-700 bg-gray-800/50 px-3 py-2 text-xs font-medium text-gray-300 transition-all hover:border-shelby-500 hover:text-white"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-green-400" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
            {copied ? "Copied!" : "Copy Link"}
          </button>
          <Link
            to={viewerLink}
            className="flex items-center justify-center rounded-lg border border-gray-700 bg-gray-800/50 px-3 py-2 text-gray-300 transition-all hover:border-shelby-500 hover:text-white"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

function formatSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function formatDate(timestamp: string): string {
  const ms = parseInt(timestamp) / 1000;
  return new Date(ms).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}
