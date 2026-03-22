# ShelbyDrop

Permanent, decentralized file sharing on [Shelby Protocol](https://shelby.xyz) (Aptos). Drop any file and get an uncensorable share link that never expires.

## Features

- **Drag-and-drop upload** — images, videos, PDFs, documents, anything
- **Permanent storage** — files are stored on Shelby's decentralized hot storage
- **Cryptographic proofs** — every file is verifiable on the Aptos blockchain
- **Instant share links** — copy a link and share with anyone
- **Wallet integration** — connect Petra (or any Aptos wallet) to upload
- **My Drops dashboard** — see all your uploaded files in one place
- **Public viewer** — anyone can view and download your shared files

## Tech Stack

- **Vite + React + TypeScript** — fast dev, modern tooling
- **Tailwind CSS** — utility-first dark theme styling
- **Shelby Protocol SDK** — `@shelby-protocol/sdk` + `@shelby-protocol/react`
- **Aptos Wallet Adapter** — `@aptos-labs/wallet-adapter-react`
- **TanStack React Query** — data fetching and caching
- **React Router** — client-side routing
- **Sonner** — toast notifications
- **Lucide React** — icons

## Prerequisites

- **Node.js** 18+ and npm
- **Aptos wallet** (Petra recommended) — install from [petra.app](https://petra.app)
- **Testnet APT** — fund your wallet via the [Aptos Testnet Faucet](https://aptos.dev/network/faucet)
- **Testnet ShelbyUSD** — request from [Shelby Discord](https://discord.gg/shelbyprotocol)

## Setup

```bash
# Clone and install
git clone <your-repo-url>
cd shelbydrop
npm install

# Configure environment
cp .env.example .env
# Edit .env with your Shelby API key

# Start dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Project Structure

```
src/
  components/
    layout/         Navbar, Footer, Layout shell
    DropZone.tsx    Drag-and-drop file selector
    FileCard.tsx    Card for uploaded blobs
    FilePreview.tsx Type-aware preview renderer
    WalletButton.tsx Wallet connect/disconnect
  pages/
    Home.tsx        Hero + upload flow
    MyDrops.tsx     User's uploaded files
    Explore.tsx     Public discovery (coming soon)
    DropViewer.tsx  Public file viewer
  lib/
    shelby.ts       Shared ShelbyClient instance
    utils.ts        Helpers (formatBytes, getFileType, etc.)
    constants.ts    API URLs, file type mappings
  providers/
    AppProviders.tsx All context providers
```

## How It Works

1. Connect your Aptos wallet (testnet)
2. Drag and drop files onto the upload zone
3. Click "Upload to Shelby" — the SDK handles encoding, on-chain registration, and RPC upload
4. Get permanent share links for every file
5. Anyone with the link can view and download the file

## Deploy to Vercel

```bash
npm install -g vercel
vercel
```

Set the environment variable `VITE_SHELBY_API_KEY` in the Vercel dashboard.

For SPA routing, add a `vercel.json`:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

## License

MIT
