import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AptosWalletAdapterProvider } from "@aptos-labs/wallet-adapter-react";
import { ShelbyClientProvider } from "@shelby-protocol/react";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "sonner";
import type { PropsWithChildren } from "react";
import { shelbyClient } from "../lib/shelby";
import { APTOS_NETWORK } from "../lib/constants";
import { UploadManagerProvider } from "../hooks/useUploadManager";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2,
      retry: 2,
    },
  },
});

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <QueryClientProvider client={queryClient}>
      <AptosWalletAdapterProvider
        autoConnect
        dappConfig={{
          network: APTOS_NETWORK,
        }}
        onError={(error) => {
          console.error("Wallet error:", error);
        }}
      >
        <ShelbyClientProvider client={shelbyClient}>
          <UploadManagerProvider>
            <BrowserRouter>
              {children}
              <Toaster
                theme="dark"
                position="bottom-right"
                toastOptions={{
                  style: {
                    background: "#1f2937",
                    border: "1px solid #374151",
                    color: "#f3f4f6",
                  },
                }}
              />
            </BrowserRouter>
          </UploadManagerProvider>
        </ShelbyClientProvider>
      </AptosWalletAdapterProvider>
    </QueryClientProvider>
  );
}
