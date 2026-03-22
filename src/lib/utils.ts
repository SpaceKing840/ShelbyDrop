import { FILE_TYPE_MAP, SHELBY_API_BASE } from "./constants";

export type FileCategory = "image" | "video" | "pdf" | "document" | "unknown";

export function getFileExtension(filename: string): string {
  return filename.split(".").pop()?.toLowerCase() ?? "";
}

export function getFileType(filename: string): FileCategory {
  const ext = getFileExtension(filename);
  return FILE_TYPE_MAP[ext] ?? "unknown";
}

export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
}

export function getBlobUrl(account: string, blobName: string): string {
  return `${SHELBY_API_BASE}/blobs/${account}/${encodeURIComponent(blobName)}`;
}

export function getShareLink(account: string, blobName: string): string {
  return `${window.location.origin}/drop/${account}/${encodeURIComponent(blobName)}`;
}

export function truncateAddress(address: string, chars = 6): string {
  if (address.length <= chars * 2 + 2) return address;
  return `${address.slice(0, chars)}...${address.slice(-4)}`;
}

export function formatDate(timestamp: number | string): string {
  const date = new Date(typeof timestamp === "string" ? parseInt(timestamp) : timestamp);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
