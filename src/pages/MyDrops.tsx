import { useEffect } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useAccountBlobs } from "@shelby-protocol/react";
import { FileCard } from "../components/FileCard";
import { Wallet, FolderOpen, Upload, AlertCircle, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { shelbyClient } from "../lib/shelby";
import { useUserAccount } from "../hooks/useUserAccount";
import { useUploadManager } from "../hooks/useUploadManager";

function SkeletonCard() {
  return (
    <div className="card overflow-hidden">
      <div className="skeleton -mx-6 -mt-6 mb-4 h-40" />
      <div className="space-y-3">
        <div className="skeleton h-4 w-3/4" />
        <div className="skeleton h-3 w-1/2" />
        <div className="flex gap-2">
          <div className="skeleton h-9 flex-1" />
          <div className="skeleton h-9 w-9" />
        </div>
      </div>
    </div>
  );
}

/** Ghost card for uploads that are still processing */
function PendingCard({ fileNames, status }: { fileNames: string[]; status: string }) {
  const label =
    status === "signing"
      ? "Awaiting signature…"
      : status === "confirming"
        ? "Confirming on-chain…"
        : status === "uploading"
          ? "Uploading…"
          : "Preparing…";

  return (
    <div className="card group animate-pulse overflow-hidden opacity-50">
      {/* Preview placeholder */}
      <div className="relative -mx-6 -mt-6 mb-4 flex h-40 items-center justify-center bg-gray-800/30">
        <Loader2 className="h-10 w-10 animate-spin text-shelby-400/50" />
      </div>

      {/* Info */}
      <div className="space-y-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-gray-400">
            {fileNames.length === 1 ? fileNames[0] : `${fileNames.length} files`}
          </p>
          <p className="mt-1 text-xs text-shelby-400/70">{label}</p>
        </div>

        {/* Disabled action buttons */}
        <div className="flex items-center gap-2">
          <div className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-gray-700/50 bg-gray-800/30 px-3 py-2 text-xs font-medium text-gray-600">
            Processing…
          </div>
        </div>
      </div>
    </div>
  );
}

export function MyDrops() {
  const { account, connected } = useWallet();
  const { uploads: cachedUploads } = useUserAccount();

  if (!connected || !account) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-800">
            <Wallet className="h-8 w-8 text-gray-500" />
          </div>
          <h2 className="text-2xl font-bold text-white">Connect your wallet</h2>
          <p className="max-w-md text-gray-400">
            Connect your Aptos wallet to see your uploaded files.
          </p>
        </div>
      </div>
    );
  }

  return <DropsGrid account={account.address.toString()} cachedUploadCount={cachedUploads.length} />;
}

function DropsGrid({ account, cachedUploadCount }: { account: string; cachedUploadCount: number }) {
  const { pendingUploads, onUploadComplete } = useUploadManager();

  const {
    data: blobs,
    isLoading,
    error,
    refetch,
  } = useAccountBlobs({
    client: shelbyClient,
    account,
  });

  // Refetch when a background upload completes
  useEffect(() => {
    return onUploadComplete(() => {
      refetch();
    });
  }, [onUploadComplete, refetch]);

  // Only show non-terminal (in-progress) uploads as ghost cards
  const activeUploads = pendingUploads.filter(
    (u) => u.status !== "success" && u.status !== "error",
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white sm:text-3xl">My Drops</h1>
            {cachedUploadCount > 0 && (
              <span className="rounded-full bg-shelby-500/10 px-2.5 py-0.5 text-xs font-medium text-shelby-400">
                {cachedUploadCount} upload{cachedUploadCount !== 1 && "s"}
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-gray-400">
            Your permanently stored files on Shelby
          </p>
        </div>
        <Link to="/" className="btn-primary text-sm">
          <Upload className="h-4 w-4" />
          New Drop
        </Link>
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {error && (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <AlertCircle className="h-10 w-10 text-red-400" />
          <div>
            <p className="font-medium text-white">Failed to load your drops</p>
            <p className="text-sm text-gray-400">{(error as Error).message}</p>
          </div>
          <button onClick={() => refetch()} className="btn-secondary text-sm">
            Try Again
          </button>
        </div>
      )}

      {!isLoading && !error && blobs && blobs.length === 0 && activeUploads.length === 0 && (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-800">
            <FolderOpen className="h-8 w-8 text-gray-500" />
          </div>
          <div>
            <p className="text-lg font-medium text-white">No drops yet</p>
            <p className="text-sm text-gray-400">
              Upload your first file to get started
            </p>
          </div>
          <Link to="/" className="btn-primary text-sm">
            <Upload className="h-4 w-4" />
            Upload Files
          </Link>
        </div>
      )}

      {/* Grid: pending ghost cards first, then confirmed blobs */}
      {(activeUploads.length > 0 || (!isLoading && !error && blobs && blobs.length > 0)) && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Pending uploads as ghost cards */}
          {activeUploads.map((upload) => (
            <PendingCard
              key={upload.id}
              fileNames={upload.fileNames}
              status={upload.status}
            />
          ))}

          {/* Confirmed blobs */}
          {blobs?.map((blob: { name: string; size?: number; registered_at_micros?: string }) => (
            <FileCard
              key={blob.name}
              blobName={blob.name}
              account={account}
              size={blob.size}
              registeredAt={blob.registered_at_micros}
            />
          ))}
        </div>
      )}
    </div>
  );
}
