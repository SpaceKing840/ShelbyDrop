import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Wallet, LogOut, ChevronDown, X } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { truncateAddress } from "../lib/utils";

const PETRA_WALLET_NAME = "Petra";
const PETRA_INSTALL_URL = "https://petra.app";

export function WalletButton() {
  const { connect, disconnect, connected, account, wallet, wallets } = useWallet();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleConnectPetra = async () => {
    // Find Petra among detected wallets
    const petraWallet = (wallets ?? []).find(
      (w) => w.name.toLowerCase() === PETRA_WALLET_NAME.toLowerCase()
    );

    if (!petraWallet) {
      // Petra is not installed — show install prompt
      setShowInstallModal(true);
      return;
    }

    try {
      setIsConnecting(true);
      await connect(petraWallet.name);
    } catch (err) {
      console.error("Failed to connect Petra:", err);
    } finally {
      setIsConnecting(false);
    }
  };

  if (connected && account) {
    return (
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center gap-2 rounded-xl border border-gray-700 bg-gray-800/60 px-4 py-2.5 text-sm font-medium text-gray-200 transition-all hover:border-shelby-500 hover:bg-gray-800"
        >
          <div className="h-2 w-2 rounded-full bg-green-400" />
          <span>{truncateAddress(account.address.toString())}</span>
          <ChevronDown className="h-4 w-4 text-gray-400" />
        </button>

        {showDropdown && (
          <div className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-xl border border-gray-700 bg-gray-900 shadow-xl">
            <div className="border-b border-gray-800 px-4 py-3">
              <p className="text-xs text-gray-400">Connected with</p>
              <p className="text-sm font-medium text-white">{wallet?.name ?? "Wallet"}</p>
              <p className="mt-0.5 font-mono text-xs text-gray-500">
                {truncateAddress(account.address.toString(), 10)}
              </p>
            </div>
            <button
              onClick={() => {
                disconnect();
                setShowDropdown(false);
              }}
              className="flex w-full items-center gap-2 px-4 py-3 text-sm text-red-400 transition-colors hover:bg-gray-800/50"
            >
              <LogOut className="h-4 w-4" />
              Disconnect
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <button
        onClick={handleConnectPetra}
        disabled={isConnecting}
        className="btn-primary flex items-center gap-2 text-sm"
      >
        <Wallet className="h-4 w-4" />
        {isConnecting ? "Connecting…" : "Connect Wallet"}
      </button>

      {/* Install Petra prompt — only shown when Petra is not detected */}
      {showInstallModal &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm"
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowInstallModal(false);
            }}
          >
            <div className="mx-4 w-full max-w-sm overflow-hidden rounded-2xl border border-gray-700 bg-gray-900 shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-gray-800 px-5 py-4">
                <h2 className="text-lg font-semibold text-white">Petra Wallet Required</h2>
                <button
                  onClick={() => setShowInstallModal(false)}
                  className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-800 hover:text-gray-200"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-shelby-500/10">
                  <Wallet className="h-8 w-8 text-shelby-400" />
                </div>
                <p className="text-sm font-medium text-gray-300">
                  Petra Wallet is not installed
                </p>
                <p className="mt-2 text-xs text-gray-500">
                  Install the Petra browser extension to connect and start using ShelbyDrop.
                </p>
                <a
                  href={PETRA_INSTALL_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-shelby-500 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-shelby-600"
                >
                  Install Petra Wallet
                </a>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
