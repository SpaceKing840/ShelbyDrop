import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type PropsWithChildren,
} from "react";
import {
  AccountAddress,
} from "@aptos-labs/ts-sdk";
import {
  createBlobKey,
  createDefaultErasureCodingProvider,
  expectedTotalChunksets,
  generateCommitments,
  ShelbyBlobClient,
} from "@shelby-protocol/sdk/browser";
import { shelbyClient } from "../lib/shelby";
import { getShareLink } from "../lib/utils";
import { toast } from "sonner";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type UploadStatus = "pending" | "signing" | "confirming" | "uploading" | "success" | "error";

export interface PendingUpload {
  id: string;
  fileNames: string[];
  fileSizes: number[];
  status: UploadStatus;
  error?: string;
  shareLinks?: string[];
  startedAt: number;
}

/** Called on upload success so the caller can persist records to localStorage */
export type OnPersistFn = (records: { blobName: string; shareLink: string; uploadedAt: number; fileSize: number }[]) => void;

interface UploadManagerCtx {
  pendingUploads: PendingUpload[];
  startUpload: (
    files: File[],
    accountAddress: string,
    signAndSubmitTransaction: (input: { data: unknown; options?: unknown }) => Promise<{ hash: string }>,
    onPersist?: OnPersistFn,
  ) => void;
  dismissUpload: (id: string) => void;
  /** Callbacks that pages can register to be notified on completion */
  onUploadComplete: (cb: () => void) => () => void;
}

const UploadManagerContext = createContext<UploadManagerCtx | null>(null);

export function useUploadManager() {
  const ctx = useContext(UploadManagerContext);
  if (!ctx) throw new Error("useUploadManager must be used within UploadManagerProvider");
  return ctx;
}

/* ------------------------------------------------------------------ */
/*  Direct REST polling for transaction confirmation                   */
/* ------------------------------------------------------------------ */

const FULLNODE_URL = "https://api.testnet.aptoslabs.com/v1";

/**
 * Poll the fullnode REST API directly for a transaction hash.
 *
 * This bypasses the Aptos SDK's `waitForTransaction` which has its own
 * internal timeout that can compound with our retry logic and fail
 * prematurely on testnet when propagation is slow.
 *
 * Flow:
 *  1. Wait 2 s for the tx to propagate across nodes.
 *  2. Poll GET /v1/transactions/by_hash/{hash} with exponential back-off.
 *  3. If the response contains a `type` field, the tx exists on-chain.
 *     - If `success` is false  → throw with VM error details.
 *     - Otherwise              → resolved successfully.
 *  4. If still "transaction_not_found" after 120 s, throw a user-friendly error.
 */
async function waitForTransactionWithRetry(hash: string, maxWaitMs = 120_000): Promise<void> {
  // Initial delay — let the tx propagate across testnet nodes
  await new Promise((r) => setTimeout(r, 2_000));

  const start = Date.now();
  let delay = 2_000;

  while (Date.now() - start < maxWaitMs) {
    try {
      const res = await fetch(`${FULLNODE_URL}/transactions/by_hash/${hash}`);
      if (res.ok) {
        const data = await res.json();
        if (data.type) {
          // Transaction exists on-chain
          if (data.success === false) {
            throw new Error(
              `Transaction failed on-chain: ${data.vm_status || "unknown VM error"}`,
            );
          }
          return; // confirmed!
        }
      }
      // 404 or missing type → not yet indexed, keep retrying
    } catch (err) {
      // Re-throw our own "failed on-chain" errors
      if (err instanceof Error && err.message.startsWith("Transaction failed")) throw err;
      // Network / fetch errors → retry
    }

    await new Promise((r) => setTimeout(r, delay));
    delay = Math.min(delay * 1.5, 10_000);
  }

  throw new Error(
    "Transaction was submitted but could not be confirmed after 2 minutes. " +
    "The Aptos testnet may be congested — your upload may still complete once the network catches up. " +
    "Tx hash: " + hash,
  );
}

/* ------------------------------------------------------------------ */
/*  Provider                                                           */
/* ------------------------------------------------------------------ */

let _uploadId = 0;

export function UploadManagerProvider({ children }: PropsWithChildren) {
  const [pendingUploads, setPendingUploads] = useState<PendingUpload[]>([]);
  const completionCallbacks = useRef<Set<() => void>>(new Set());

  /* Helpers to update a single upload entry */
  const updateUpload = useCallback((id: string, patch: Partial<PendingUpload>) => {
    setPendingUploads((prev) =>
      prev.map((u) => (u.id === id ? { ...u, ...patch } : u)),
    );
  }, []);

  const onUploadComplete = useCallback((cb: () => void) => {
    completionCallbacks.current.add(cb);
    return () => { completionCallbacks.current.delete(cb); };
  }, []);

  /* ---------------------------------------------------------------- */
  /*  Core upload logic — runs in a fire-and-forget promise            */
  /* ---------------------------------------------------------------- */

  const startUpload = useCallback(
    (
      files: File[],
      accountAddress: string,
      signAndSubmitTransaction: (input: { data: unknown; options?: unknown }) => Promise<{ hash: string }>,
      onPersist?: OnPersistFn,
    ) => {
      const id = `upload_${++_uploadId}_${Date.now()}`;
      const entry: PendingUpload = {
        id,
        fileNames: files.map((f) => f.name),
        fileSizes: files.map((f) => f.size),
        status: "pending",
        startedAt: Date.now(),
      };
      setPendingUploads((prev) => [entry, ...prev]);

      // Fire-and-forget — runs in background
      (async () => {
        try {
          /* 1. Read file data */
          const blobs = await Promise.all(
            files.map(async (file) => ({
              blobName: file.name,
              blobData: new Uint8Array(await file.arrayBuffer()),
            })),
          );

          /* 2. Check which blobs need registration */
          const existingBlobs = await shelbyClient.coordination.getBlobs({
            where: {
              blob_name: {
                _in: blobs.map((b) =>
                  createBlobKey({ account: accountAddress, blobName: b.blobName }),
                ),
              },
            },
          });

          const blobsToRegister = blobs.filter(
            (blob) =>
              !existingBlobs.some(
                (existing: { name: string }) =>
                  existing.name ===
                  createBlobKey({ account: accountAddress, blobName: blob.blobName }),
              ),
          );

          /* 3. Register commitments on-chain (if needed) */
          if (blobsToRegister.length > 0) {
            updateUpload(id, { status: "signing" });

            const provider = await createDefaultErasureCodingProvider();
            const blobCommitments = await Promise.all(
              blobsToRegister.map((blob) => generateCommitments(provider, blob.blobData)),
            );

            const chunksetSize = provider.config.erasure_k * provider.config.chunkSizeBytes;

            const payload = ShelbyBlobClient.createBatchRegisterBlobsPayload({
              account: AccountAddress.from(accountAddress),
              expirationMicros: (Date.now() + 365 * 24 * 60 * 60 * 1000) * 1000,
              blobs: blobsToRegister.map((blob, index) => ({
                blobName: blob.blobName,
                blobSize: blob.blobData.length,
                blobMerkleRoot: blobCommitments[index].blob_merkle_root,
                numChunksets: expectedTotalChunksets(blob.blobData.length, chunksetSize),
              })),
              encoding: provider.config.enumIndex,
            });

            // This opens the wallet popup for the user to sign
            const txResult = await signAndSubmitTransaction({ data: payload });

            updateUpload(id, { status: "confirming" });

            // Custom retry loop — much more resilient than the SDK's default
            await waitForTransactionWithRetry(txResult.hash);
          }

          /* 4. Upload blob data to Shelby RPC */
          updateUpload(id, { status: "uploading" });

          await Promise.all(
            blobs.map((blob) =>
              shelbyClient.rpc.putBlob({
                account: accountAddress,
                blobName: blob.blobName,
                blobData: blob.blobData,
              }),
            ),
          );

          /* 5. Success! */
          const links = files.map((f) => getShareLink(accountAddress, f.name));
          updateUpload(id, { status: "success", shareLinks: links });
          toast.success(
            `${files.length} file${files.length !== 1 ? "s" : ""} uploaded permanently!`,
          );

          // Persist to localStorage via the caller's hook
          if (onPersist) {
            onPersist(
              files.map((f, i) => ({
                blobName: f.name,
                shareLink: links[i],
                uploadedAt: Date.now(),
                fileSize: f.size,
              })),
            );
          }

          // Notify any listeners (e.g. MyDrops refetch)
          completionCallbacks.current.forEach((cb) => cb());
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : "Upload failed";
          updateUpload(id, { status: "error", error: message });
          toast.error(`Upload failed: ${message}`);
        }
      })();
    },
    [updateUpload],
  );

  const dismissUpload = useCallback((id: string) => {
    setPendingUploads((prev) => prev.filter((u) => u.id !== id));
  }, []);

  return (
    <UploadManagerContext.Provider
      value={{ pendingUploads, startUpload, dismissUpload, onUploadComplete }}
    >
      {children}
    </UploadManagerContext.Provider>
  );
}
