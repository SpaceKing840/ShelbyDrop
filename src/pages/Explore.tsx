import { Compass, Image, Film, FileText, FileIcon } from "lucide-react";

const placeholderDrops = [
  { name: "vacation-photo.jpg", type: "image" as const },
  { name: "presentation.pdf", type: "pdf" as const },
  { name: "demo-reel.mp4", type: "video" as const },
  { name: "project-notes.md", type: "document" as const },
  { name: "sunset-panorama.png", type: "image" as const },
  { name: "quarterly-report.pdf", type: "pdf" as const },
];

const typeIcons = {
  image: Image,
  video: Film,
  pdf: FileText,
  document: FileText,
  unknown: FileIcon,
};

const typeColors = {
  image: "text-blue-400 bg-blue-400/10",
  video: "text-purple-400 bg-purple-400/10",
  pdf: "text-red-400 bg-red-400/10",
  document: "text-yellow-400 bg-yellow-400/10",
  unknown: "text-gray-400 bg-gray-400/10",
};

export function Explore() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white sm:text-3xl">Explore</h1>
        <p className="mt-1 text-sm text-gray-400">
          Discover publicly shared drops on Shelby
        </p>
      </div>

      {/* Coming soon banner */}
      <div className="mb-10 rounded-2xl border border-shelby-500/20 bg-gradient-to-br from-shelby-500/5 to-pink-500/5 p-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-shelby-500/10">
          <Compass className="h-7 w-7 text-shelby-400" />
        </div>
        <h2 className="text-xl font-bold text-white">Public feed coming soon</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-gray-400">
          We're building a discovery feed where you can browse and search publicly shared files.
          For now, share your drop links directly with anyone.
        </p>
      </div>

      {/* Placeholder grid to show the layout */}
      <h3 className="mb-4 text-sm font-medium text-gray-500">Preview of upcoming layout</h3>
      <div className="grid grid-cols-1 gap-6 opacity-60 sm:grid-cols-2 lg:grid-cols-3">
        {placeholderDrops.map((drop, i) => {
          const Icon = typeIcons[drop.type];
          const colors = typeColors[drop.type];

          return (
            <div key={i} className="card overflow-hidden">
              <div className="relative -mx-6 -mt-6 mb-4 flex h-36 items-center justify-center bg-gray-800/30">
                <div className={`flex h-14 w-14 items-center justify-center rounded-xl ${colors}`}>
                  <Icon className="h-7 w-7" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="skeleton h-4 w-3/4 rounded" />
                <div className="skeleton h-3 w-1/2 rounded" />
                <div className="flex gap-2 pt-1">
                  <div className="skeleton h-8 flex-1 rounded-lg" />
                  <div className="skeleton h-8 w-8 rounded-lg" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
