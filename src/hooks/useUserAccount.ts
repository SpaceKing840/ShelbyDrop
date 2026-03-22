import { useCallback, useEffect, useState } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";

const STORAGE_PREFIX = "shelbydrop_";

export interface UploadRecord {
  blobName: string;
  shareLink: string;
  uploadedAt: number; // ms timestamp
  fileSize?: number;
}

export interface UserProfile {
  address: string;
  firstConnected: number;
  uploads: UploadRecord[];
}

function getUserKey(address: string) {
  return `${STORAGE_PREFIX}user_${address}`;
}

function loadProfile(address: string): UserProfile | null {
  try {
    const raw = localStorage.getItem(getUserKey(address));
    if (!raw) return null;
    return JSON.parse(raw) as UserProfile;
  } catch {
    return null;
  }
}

function saveProfile(profile: UserProfile) {
  localStorage.setItem(getUserKey(profile.address), JSON.stringify(profile));
}

/**
 * Manages a per-wallet user profile stored in localStorage.
 * Creates a new profile on first connection.
 * Persists upload records so users can resume where they left off.
 */
export function useUserAccount() {
  const { account, connected } = useWallet();
  const [profile, setProfile] = useState<UserProfile | null>(null);

  // Load or create profile when wallet connects
  useEffect(() => {
    if (!connected || !account) {
      setProfile(null);
      return;
    }

    const address = account.address.toString();
    const existing = loadProfile(address);

    if (existing) {
      setProfile(existing);
    } else {
      const newProfile: UserProfile = {
        address,
        firstConnected: Date.now(),
        uploads: [],
      };
      saveProfile(newProfile);
      setProfile(newProfile);
    }
  }, [connected, account]);

  // Add one or more upload records
  const addUploads = useCallback(
    (records: UploadRecord[]) => {
      setProfile((prev) => {
        if (!prev) return prev;
        const updated: UserProfile = {
          ...prev,
          uploads: [...prev.uploads, ...records],
        };
        saveProfile(updated);
        return updated;
      });
    },
    [],
  );

  // Convenience: get uploads list (empty array when not connected)
  const uploads = profile?.uploads ?? [];

  return { profile, uploads, addUploads };
}
