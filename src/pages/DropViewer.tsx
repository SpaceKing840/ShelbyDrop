import { useParams, Link } from "react-router-dom";
import { Download, Copy, ArrowLeft, Check, Share2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { FilePreview } from "../components/FilePreview";
import { getBlobUrl, getShareLink, truncateAddress, getFileType } from "../lib/utils";

export function DropViewer() {
  const { account, blobName } = useParams<{ account: string; blobName: string }>();
  const [copied, setCopied] = useState(false);

  if (!account || !blobName) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-lg text-gray-400">Invalid drop link</p>
        <Link to="/" className="mt-4 text-shelby-400 hover:underline">
          Go home
        </Link>
      </div>
    );
  }

  const decodedName = decodeURIComponent(blobName);
  const blobUrl = getBlobUrl(account, decodedName);
  const shareLink = getShareLink(account, decodedName);
  const fileType = getFileType(decodedName);

  const handleCopy = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    toast.success("Share link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      {/* Back nav */}
      <Link
        to="/"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-gray-400 transition-colors hover:text-gray-200"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to home
      </Link>

      {/* File info bar */}
      <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-gray-800 bg-gray-900/50 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div className="min-w-0">
          <h1 className="truncate text-xl font-bold text-white" title={decodedName}>
            {decodedName}
          </h1>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-gray-400">
            <span className="inline-flex items-center gap-1 rounded-md bg-gray-800 px-2 py-0.5 text-xs font-medium uppercase text-gray-300">
              {fileType}
            </span>
            <span className="text-gray-600">&bull;</span>
            <span className="font-mono text-xs text-gray-500">
              {truncateAddress(account, 8)}
            </span>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            onClick={handleCopy}
            className="btn-secondary text-sm"
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-400" />
            ) : (
              <Share2 className="h-4 w-4" />
            )}
            {copied ? "Copied!" : "Share"}
          </button>
          <a
            href={blobUrl}
            download={decodedName}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary text-sm"
          >
            <Download className="h-4 w-4" />
            Download
          </a>
        </div>
      </div>

      {/* Preview */}
      <FilePreview blobUrl={blobUrl} filename={decodedName} />

      {/* Metadata */}
      <div className="mt-6 rounded-2xl border border-gray-800 bg-gray-900/50 p-5">
        <h3 className="mb-3 text-sm font-medium text-gray-400">File Details</h3>
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-gray-500">Filename</span>
            <span className="font-medium text-gray-200">{decodedName}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-500">Owner</span>
            <span className="font-mono text-xs text-gray-300">
              {truncateAddress(account, 12)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-500">Storage</span>
            <span className="text-gray-300">Shelby Protocol (Aptos Testnet)</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-500">Direct URL</span>
            <button
              onClick={() => {
                navigator.clipboard.writeText(blobUrl);
                toast.success("Direct URL copied!");
              }}
              className="flex items-center gap-1 text-shelby-400 hover:text-shelby-300"
            >
              <Copy className="h-3 w-3" />
              Copy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
