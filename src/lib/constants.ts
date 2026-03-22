import { Network } from "@aptos-labs/ts-sdk";

const networkEnv = (import.meta.env.VITE_NETWORK ?? "testnet").toLowerCase();

export const APTOS_NETWORK: Network =
  networkEnv === "mainnet" ? Network.MAINNET
  : networkEnv === "devnet" ? Network.DEVNET
  : Network.TESTNET;

const derivedApiBase =
  APTOS_NETWORK === Network.MAINNET
    ? "https://api.shelby.xyz/shelby/v1"
    : `https://api.${networkEnv}.shelby.xyz/shelby/v1`;

export const SHELBY_API_BASE: string =
  import.meta.env.VITE_SHELBY_API_BASE || derivedApiBase;

export const FILE_TYPE_MAP: Record<string, "image" | "video" | "pdf" | "document" | "unknown"> = {
  jpg: "image",
  jpeg: "image",
  png: "image",
  gif: "image",
  webp: "image",
  svg: "image",
  bmp: "image",
  mp4: "video",
  webm: "video",
  mov: "video",
  avi: "video",
  mkv: "video",
  pdf: "pdf",
  doc: "document",
  docx: "document",
  txt: "document",
  md: "document",
  csv: "document",
  xls: "document",
  xlsx: "document",
};
