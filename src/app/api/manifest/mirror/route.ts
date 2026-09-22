import { getAllMirrorAssets } from "@/lib/mirror";

/** Describes existing archive downloads without adding new publication targets. */
export function GET() {
  const assets = getAllMirrorAssets().map((asset) => ({
    id: asset.id,
    fileName: asset.fileName,
    ext: asset.ext,
    sizeBytes: asset.sizeBytes,
    downloadUrl: asset.downloadUrl,
    sha256: asset.sha256,
  }));

  return Response.json(assets);
}
