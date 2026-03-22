import { ShelbyClient } from "@shelby-protocol/sdk/browser";
import { APTOS_NETWORK } from "./constants";

export const shelbyClient = new ShelbyClient({
  network: APTOS_NETWORK,
  apiKey: import.meta.env.VITE_SHELBY_API_KEY ?? "",
});
