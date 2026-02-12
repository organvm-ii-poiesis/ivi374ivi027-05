"use client";

import { useMemo, useState } from "react";
import { useDeferredValue } from "react";

import { formatBytes } from "@/lib/mirror";
import { trackEvent } from "@/lib/analytics";
import type { MirrorAsset } from "@/types/content";

type Props = {
  assets: MirrorAsset[];
  extensions: string[];
};

export function ArchiveBrowser({ assets, extensions }: Props) {
  const [query, setQuery] = useState("");
  const [ext, setExt] = useState("all");
  const deferredQuery = useDeferredValue(query);

  const indexedAssets = useMemo(
    () =>
      assets.map((asset) => ({
        ...asset,
        searchIndex: `${asset.fileName} ${asset.relativePath} ${asset.sourceFolder}`.toLowerCase(),
      })),
    [assets],
  );

  const filtered = useMemo(() => {
    const q = deferredQuery.trim().toLowerCase();

    return indexedAssets.filter((asset) => {
      if (ext !== "all" && asset.ext !== ext) {
        return false;
      }

      if (!q) {
        return true;
      }

      return asset.searchIndex.includes(q);
    });
  }, [deferredQuery, ext, indexedAssets]);

  return (
    <section className="archive-shell" aria-label="Archive downloads">
      <div className="archive-controls">
        <label htmlFor="archive-query">Search archive</label>
        <input
          id="archive-query"
          onChange={(event) => setQuery(event.target.value)}
          placeholder="file, folder, extension"
          type="search"
          value={query}
        />

        <label htmlFor="archive-ext">Filter by extension</label>
        <select id="archive-ext" onChange={(event) => setExt(event.target.value)} value={ext}>
          <option value="all">All</option>
          {extensions.map((extension) => (
            <option key={extension} value={extension}>
              {extension}
            </option>
          ))}
        </select>
      </div>

      <p className="eyebrow">{filtered.length} files shown</p>

      <ul className="archive-list">
        {filtered.map((asset) => (
          <li key={asset.id}>
            <a
              download
              href={asset.downloadUrl}
              onClick={() => {
                void trackEvent({
                  eventName: "download_started",
                  mode: "archive",
                  metadata: { path: asset.relativePath, ext: asset.ext || "none" },
                });

                window.setTimeout(() => {
                  void trackEvent({
                    eventName: "download_completed",
                    mode: "archive",
                    metadata: { path: asset.relativePath, ext: asset.ext || "none" },
                  });
                }, 1800);
              }}
            >
              {asset.fileName}
            </a>
            <span>{asset.relativePath}</span>
            <span>{formatBytes(asset.sizeBytes)}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
