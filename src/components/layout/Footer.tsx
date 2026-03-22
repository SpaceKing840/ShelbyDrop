export function Footer() {
  return (
    <footer className="border-t border-gray-800/60 bg-gray-950">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <p className="text-center text-sm text-gray-500">
          anchored on{" "}
          <span className="font-medium text-gray-400">aptos</span>
          {" "}&bull;{" "}
          stored on{" "}
          <span className="font-medium text-gray-400">ShelbyServers</span>
          {" "}&bull;{" "}
          instant global access
        </p>
        <p className="mt-2 text-center text-xs text-gray-600">
          &copy; {new Date().getFullYear()} ShelbyDrop &mdash; Permanent file sharing, powered by Shelby Protocol
        </p>
      </div>
    </footer>
  );
}
