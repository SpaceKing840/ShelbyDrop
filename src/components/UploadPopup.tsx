import { useState } from "react";
import {
  X,
  ChevronDown,
  ChevronUp,
  Loader2,
  CheckCircle2,
  XCircle,
  Upload,
  Copy,
  FileText,
} from "lucide-react";
import {
  useUploadManager,
  type PendingUpload,
  type UploadStatus,
} from "../hooks/useUploadManager";
import { toast } from "sonner";

/* ------------------------------------------------------------------ */
/*  Status helpers                                                     */
/* ------------------------------------------------------------------ */

function statusLabel(status: UploadStatus): string {
  switch (status) {
    case "pending":
      return "Preparing…";
    case "signing":
      return "Waiting for signature…";
    case "confirming":
      return "Confirming on-chain…";
    case "uploading":
      return "Uploading to Shelby…";
    case "success":
      return "Uploaded!";
    case "error":
      return "Failed";
  }
}

function StatusIcon({ status }: { status: UploadStatus }) {
  if (status === "success")
    return <CheckCircle2 className="h-5 w-5 shrink-0 text-green-400" />;
  if (status === "error")
    return <XCircle className="h-5 w-5 shrink-0 text-red-400" />;
  return <Loader2 className="h-5 w-5 shrink-0 animate-spin text-shelby-400" />;
}

/* ------------------------------------------------------------------ */
/*  Single upload row                                                  */
/* ------------------------------------------------------------------ */

function UploadRow({
  upload,
  onDismiss,
}: {
  upload: PendingUpload;
  onDismiss: () => void;
}) {
  const isTerminal = upload.status === "success" || upload.status === "error";
  const fileLabel =
    upload.fileNames.length === 1
      ? upload.fileNames[0]
      : `${upload.fileNames.length} files`;

  return (
    <div
      className={`flex items-start gap-3 rounded-xl border p-3 transition-all ${
        upload.status === "error"
          ? "border-red-500/20 bg-red-500/5"
          : upload.status === "success"
            ? "border-green-500/20 bg-green-500/5"
            : "border-gray-700/50 bg-gray-800/30"
      }`}
    >
      <StatusIcon status={upload.status} />

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <FileText className="h-3.5 w-3.5 shrink-0 text-gray-500" />
          <p className="truncate text-sm font-medium text-gray-200">{fileLabel}</p>
        </div>
        <p
          className={`mt-0.5 text-xs ${
            upload.status === "error"
              ? "text-red-400"
              : upload.status === "success"
                ? "text-green-400"
                : "text-gray-500"
          }`}
        >
          {upload.status === "error" && upload.error
            ? upload.error.length > 80
              ? upload.error.slice(0, 80) + "…"
              : upload.error
            : statusLabel(upload.status)}
        </p>

        {/* Copy links on success */}
        {upload.status === "success" && upload.shareLinks && (
          <button
            onClick={() => {
              navigator.clipboard.writeText(upload.shareLinks!.join("\n"));
              toast.success("Share link(s) copied!");
            }}
            className="mt-1.5 inline-flex items-center gap-1 rounded-md bg-green-500/10 px-2 py-1 text-xs font-medium text-green-400 transition-colors hover:bg-green-500/20"
          >
            <Copy className="h-3 w-3" />
            Copy link{upload.shareLinks.length > 1 ? "s" : ""}
          </button>
        )}
      </div>

      {isTerminal && (
        <button
          onClick={onDismiss}
          className="shrink-0 rounded-lg p-1 text-gray-500 transition-colors hover:bg-gray-700 hover:text-gray-300"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main popup                                                         */
/* ------------------------------------------------------------------ */

export function UploadPopup() {
  const { pendingUploads, dismissUpload } = useUploadManager();
  const [collapsed, setCollapsed] = useState(false);

  if (pendingUploads.length === 0) return null;

  const activeCount = pendingUploads.filter(
    (u) => u.status !== "success" && u.status !== "error",
  ).length;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80 sm:w-96">
      {/* Header */}
      <button
        onClick={() => setCollapsed((v) => !v)}
        className="flex w-full items-center gap-2 rounded-t-xl border border-gray-700 bg-gray-900/95 px-4 py-2.5 backdrop-blur-lg"
      >
        <Upload className="h-4 w-4 text-shelby-400" />
        <span className="flex-1 text-left text-sm font-semibold text-gray-200">
          Uploads
          {activeCount > 0 && (
            <span className="ml-1.5 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-shelby-500/20 px-1.5 text-xs font-medium text-shelby-400">
              {activeCount}
            </span>
          )}
        </span>
        {collapsed ? (
          <ChevronUp className="h-4 w-4 text-gray-500" />
        ) : (
          <ChevronDown className="h-4 w-4 text-gray-500" />
        )}
      </button>

      {/* Body */}
      {!collapsed && (
        <div className="max-h-80 space-y-2 overflow-y-auto rounded-b-xl border border-t-0 border-gray-700 bg-gray-900/95 p-3 backdrop-blur-lg">
          {pendingUploads.map((upload) => (
            <UploadRow
              key={upload.id}
              upload={upload}
              onDismiss={() => dismissUpload(upload.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
