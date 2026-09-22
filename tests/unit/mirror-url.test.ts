import { describe, expect, it } from "vitest";

import manifest from "@/data/mirror-manifest.json";
import { buildMirrorDownloadUrl } from "@/lib/mirror-url";

describe("mirror download URLs", () => {
  it.each([
    "draft/ordinary.pdf",
    "draft with spaces/@KALISTO.pages",
    "draft/#cre4tvs-:-#repli-:-login.pdf",
    "draft/question?.pdf",
    "draft/100% complete.pdf",
    "draft/@ATHAMAS & @INO .pages",
    "draft/plus+semicolon;colon:.zip",
    "draft/écho 日本語.pdf",
  ])("round-trips the exact filename without a query or fragment: %s", (relativePath) => {
    const url = new URL(buildMirrorDownloadUrl(relativePath), "https://example.invalid");
    expect(url.origin).toBe("https://example.invalid");
    expect(url.search).toBe("");
    expect(url.hash).toBe("");
    expect(decodeURIComponent(url.pathname)).toBe(`/mirror/${relativePath}`);
  });

  it("encodes the Pages filename that failed against the production server", () => {
    expect(buildMirrorDownloadUrl("draft/@KALISTO.pages")).toBe("/mirror/draft/%40KALISTO.pages");
  });

  it("keeps every checked-in manifest URL consistent with the generator", () => {
    expect(manifest.length).toBeGreaterThan(0);
    for (const asset of manifest) {
      expect(asset.downloadUrl, asset.relativePath).toBe(buildMirrorDownloadUrl(asset.relativePath));
    }
  });
});
