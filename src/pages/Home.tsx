import { useState, useCallback } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { toast } from "sonner";
import { Upload, Zap, Globe, Shield, Copy, Check, History } from "lucide-react";
import { DropZone } from "../components/DropZone";
import { useUserAccount } from "../hooks/useUserAccount";
import { useUploadManager } from "../hooks/useUploadManager";

export function Home() {
  const { account, signAndSubmitTransaction, connected } = useWallet();
  const { uploads: previousUploads, addUploads } = useUserAccount();
  const { startUpload, pendingUploads } = useUploadManager();
  const [files, setFiles] = useState<File[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleFilesAdded = useCallback((newFiles: File[]) => {
    setFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const handleFileRemoved = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleUpload = useCallback(() => {
    if (!connected || !account || !signAndSubmitTransaction) {
      toast.error("Please connect your wallet first");
      return;
    }
    if (files.length === 0) {
      toast.error("Please add files to upload");
      return;
    }

    // Fire off background upload — user can navigate freely
    startUpload(
      files,
      account.address.toString(),
      signAndSubmitTransaction as (input: { data: unknown; options?: unknown }) => Promise<{ hash: string }>,
      addUploads,
    );

    // Immediately clear the drop zone so the user can queue more
    toast.info("Upload started — sign the transaction in your wallet", {
      duration: 4000,
    });
    setFiles([]);
  }, [connected, account, signAndSubmitTransaction, files, startUpload]);

  const copyLink = useCallback((link: string, index?: number) => {
    navigator.clipboard.writeText(link);
    toast.success("Share link copied!");
    if (index != null) {
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    }
  }, []);

  // Merge recent successful background uploads with the persisted list
  const recentSuccessLinks = pendingUploads
    .filter((u) => u.status === "success" && u.shareLinks)
    .flatMap((u) => u.shareLinks!);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-20 lg:px-8">
      {/* Hero */}
      <div className="mb-12 text-center sm:mb-16">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-shelby-500/30 bg-shelby-500/10 px-4 py-1.5 text-sm font-medium text-shelby-400">
          <Zap className="h-3.5 w-3.5" />
          Powered by Shelby Protocol on Aptos
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
          Drop files here —{" "}
          <span className="bg-gradient-to-r from-shelby-400 to-pink-500 bg-clip-text text-transparent">
            permanent &amp; global
          </span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-400 sm:mt-6">
          Upload any file and get a permanent, uncensorable share link.
          Stored on decentralized hot storage with cryptographic proofs and instant global access.
        </p>
      </div>

      {/* Features */}
      <div className="mb-12 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { icon: Shield, label: "Cryptographic proofs", desc: "Every file is verifiable" },
          { icon: Globe, label: "Global CDN", desc: "Instant access anywhere" },
          { icon: Zap, label: "Never expires", desc: "Permanent storage on-chain" },
        ].map(({ icon: Icon, label, desc }) => (
          <div
            key={label}
            className="flex items-center gap-3 rounded-xl border border-gray-800/60 bg-gray-900/30 px-4 py-3"
          >
            <Icon className="h-5 w-5 shrink-0 text-shelby-400" />
            <div>
              <p className="text-sm font-medium text-gray-200">{label}</p>
              <p className="text-xs text-gray-500">{desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Drop Zone */}
      <DropZone
        files={files}
        onFilesAdded={handleFilesAdded}
        onFileRemoved={handleFileRemoved}
      />

      {/* Upload Button */}
      {files.length > 0 && (
        <div className="mt-6 flex flex-col items-center gap-3">
          {!connected && (
            <p className="text-sm text-yellow-400/80">
              Connect your wallet to upload
            </p>
          )}
          <button
            onClick={handleUpload}
            disabled={!connected || files.length === 0}
            className="btn-primary w-full sm:w-auto"
          >
            <Upload className="h-5 w-5" />
            Upload {files.length} file{files.length !== 1 && "s"} to Shelby
          </button>
        </div>
      )}

      {/* Recent Success Links */}
      {recentSuccessLinks.length > 0 && (
        <div className="mt-8 space-y-3">
          <h3 className="text-sm font-medium text-green-400">
            Recently uploaded — permanent links:
          </h3>
          {recentSuccessLinks.map((link, i) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded-xl border border-green-500/20 bg-green-500/5 p-3"
            >
              <code className="min-w-0 flex-1 truncate text-sm text-gray-300">
                {link}
              </code>
              <button
                onClick={() => copyLink(link)}
                className="shrink-0 rounded-lg bg-green-500/10 px-3 py-1.5 text-xs font-medium text-green-400 transition-colors hover:bg-green-500/20"
              >
                Copy
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Previous Uploads — resume where you left off */}
      {connected && previousUploads.length > 0 && recentSuccessLinks.length === 0 && (
        <div className="mt-12">
          <div className="mb-4 flex items-center gap-2">
            <History className="h-4 w-4 text-gray-500" />
            <h3 className="text-sm font-medium text-gray-400">Previous uploads</h3>
          </div>
          <div className="space-y-2">
            {[...previousUploads].reverse().slice(0, 10).map((record, i) => (
              <div
                key={`${record.blobName}-${record.uploadedAt}`}
                className="flex items-center gap-3 rounded-xl border border-gray-800 bg-gray-900/40 p-3 transition-colors hover:border-gray-700"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-300">{record.blobName}</p>
                  <p className="truncate text-xs text-gray-600">{record.shareLink}</p>
                </div>
                <button
                  onClick={() => copyLink(record.shareLink, i)}
                  className="shrink-0 rounded-lg border border-gray-700 bg-gray-800/50 px-3 py-1.5 text-xs font-medium text-gray-400 transition-colors hover:border-shelby-500 hover:text-white"
                >
                  {copiedIndex === i ? (
                    <Check className="h-3.5 w-3.5 text-green-400" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
