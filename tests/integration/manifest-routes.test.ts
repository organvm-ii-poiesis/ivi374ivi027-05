import { describe, expect, it } from "vitest";

import { GET as canonicalGET } from "@/app/api/manifest/canonical/route";
import { GET as mirrorGET } from "@/app/api/manifest/mirror/route";
import { getCanonicalManifest } from "@/lib/content";
import { getAllMirrorAssets } from "@/lib/mirror";

describe("manifest routes", () => {
  it("returns every canonical document in reading order", async () => {
    const response = canonicalGET();
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("application/json");
    const data = await response.json();
    const expected = getCanonicalManifest().map((doc) => ({
      id: doc.id,
      slug: doc.slug,
      title: doc.title,
      order: doc.order,
      wordCount: doc.wordCount,
      sectionCount: doc.sections.length,
      readerUrl: `/read/${encodeURIComponent(doc.slug)}`,
    }));
    expect(expected.length).toBeGreaterThanOrEqual(6);
    expect(data).toEqual(expected);
  });

  it("does not include manuscript bodies or local paths in canonical metadata", async () => {
    const data = await canonicalGET().json();
    for (const doc of data) {
      expect(Object.keys(doc).sort()).toEqual(
        ["id", "slug", "title", "order", "wordCount", "sectionCount", "readerUrl"].sort(),
      );
    }
  });

  it("returns the complete existing archive with verification fields", async () => {
    const response = mirrorGET();
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("application/json");
    const expected = getAllMirrorAssets().map((asset) => ({
      id: asset.id,
      fileName: asset.fileName,
      ext: asset.ext,
      sizeBytes: asset.sizeBytes,
      downloadUrl: asset.downloadUrl,
      sha256: asset.sha256,
    }));
    expect(expected.length).toBeGreaterThan(0);
    expect(await response.json()).toEqual(expected);
  });

  it("exposes only archive metadata and same-site mirror URLs", async () => {
    const data = await mirrorGET().json();
    for (const asset of data) {
      expect(Object.keys(asset).sort()).toEqual(
        ["id", "fileName", "ext", "sizeBytes", "downloadUrl", "sha256"].sort(),
      );
      expect(asset.downloadUrl).toMatch(/^\/mirror\//);
      expect(asset.sha256).toMatch(/^[a-f0-9]{64}$/);
      expect(asset.sizeBytes).toBeGreaterThanOrEqual(0);
    }
  });
});
