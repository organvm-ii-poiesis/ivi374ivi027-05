import { buildMirrorDownloadUrl } from "./mirror-url";

type MirrorIntegrityAsset = {
  relativePath: string;
  downloadUrl: string;
  sha256: string;
};

export type MirrorIntegrityResult = {
  totalAssets: number;
  verifiedAssets: number;
  checksumMismatches: string[];
  unreadableFiles: string[];
  badDownloadUrls: string[];
};

/** Verify every URL and checksum; unreadable or mismatched assets never count as verified. */
export async function verifyMirrorAssets(
  assets: readonly MirrorIntegrityAsset[],
  checksum: (relativePath: string) => Promise<string>,
): Promise<MirrorIntegrityResult> {
  const result: MirrorIntegrityResult = {
    totalAssets: assets.length,
    verifiedAssets: 0,
    checksumMismatches: [],
    unreadableFiles: [],
    badDownloadUrls: [],
  };

  for (const asset of assets) {
    const expectedDownloadUrl = buildMirrorDownloadUrl(asset.relativePath);
    if (!asset.downloadUrl.startsWith("/mirror/") || asset.downloadUrl !== expectedDownloadUrl) {
      result.badDownloadUrls.push(asset.relativePath);
      continue;
    }

    try {
      const digest = await checksum(asset.relativePath);
      if (digest !== asset.sha256) {
        result.checksumMismatches.push(asset.relativePath);
      } else {
        result.verifiedAssets += 1;
      }
    } catch {
      result.unreadableFiles.push(asset.relativePath);
    }
  }

  return result;
}
