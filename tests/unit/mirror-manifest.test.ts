import { getAllMirrorAssets, getMirrorExtensionCounts } from "@/lib/mirror";

describe("mirror manifest", () => {
  it("indexes all mirrored files", () => {
    const assets = getAllMirrorAssets();
    expect(assets.length).toBeGreaterThan(200);
  });

  it("keeps stable sorting and URL shape", () => {
    const assets = getAllMirrorAssets();
    const sorted = [...assets].sort((a, b) => a.relativePath.localeCompare(b.relativePath));
    expect(assets.map((asset) => asset.relativePath)).toEqual(sorted.map((asset) => asset.relativePath));
    expect(assets.every((asset) => asset.downloadUrl.startsWith("/mirror/"))).toBe(true);
  });

  it("reports extension counts", () => {
    const counts = getMirrorExtensionCounts();
    expect(counts.pdf).toBeGreaterThan(50);
    expect(counts.pages).toBeGreaterThan(10);
  });
});
