import { describe, expect, it, vi } from "vitest";

import { verifyMirrorAssets } from "@/lib/mirror-integrity";
import { buildMirrorDownloadUrl } from "@/lib/mirror-url";

const digest = "a".repeat(64);

function asset(relativePath: string) {
  return { relativePath, downloadUrl: buildMirrorDownloadUrl(relativePath), sha256: digest };
}

describe("mirror asset verification", () => {
  it.each(["draft/ordinary.pdf", "draft/@KALISTO.pages", "draft/#cre4tvs-:-login.pdf"])(
    "accepts the generator's encoded URL and reads the original filename: %s",
    async (relativePath) => {
      const checksum = vi.fn<(path: string) => Promise<string>>().mockResolvedValue(digest);
      const result = await verifyMirrorAssets([asset(relativePath)], checksum);
      expect(checksum).toHaveBeenCalledExactlyOnceWith(relativePath);
      expect(result).toEqual({
        totalAssets: 1,
        verifiedAssets: 1,
        checksumMismatches: [],
        unreadableFiles: [],
        badDownloadUrls: [],
      });
    },
  );

  it("rejects the old whole-path encoding instead of accepting broken fragment URLs", async () => {
    const entry = asset("draft/#cre4tvs-:-login.pdf");
    entry.downloadUrl = `/mirror/${encodeURI(entry.relativePath)}`;
    const checksum = vi.fn<(path: string) => Promise<string>>().mockResolvedValue(digest);
    const result = await verifyMirrorAssets([entry], checksum);
    expect(result.badDownloadUrls).toEqual([entry.relativePath]);
    expect(result.verifiedAssets).toBe(0);
    expect(checksum).not.toHaveBeenCalled();
  });

  it("rejects a different URL target even when the checksum matches", async () => {
    const entry = { ...asset("draft/ordinary.pdf"), downloadUrl: "https://example.invalid/ordinary.pdf" };
    const checksum = vi.fn<(path: string) => Promise<string>>().mockResolvedValue(digest);
    const result = await verifyMirrorAssets([entry], checksum);
    expect(result.badDownloadUrls).toEqual([entry.relativePath]);
    expect(result.verifiedAssets).toBe(0);
    expect(checksum).not.toHaveBeenCalled();
  });

  it("does not count a readable file with a mismatching checksum as verified", async () => {
    const entry = asset("changed.pdf");
    const result = await verifyMirrorAssets([entry], async () => "b".repeat(64));
    expect(result.checksumMismatches).toEqual([entry.relativePath]);
    expect(result.unreadableFiles).toEqual([]);
    expect(result.verifiedAssets).toBe(0);
  });

  it("retains unreadable-file failures", async () => {
    const entry = asset("missing.pdf");
    const result = await verifyMirrorAssets([entry], async () => { throw new Error("ENOENT"); });
    expect(result.unreadableFiles).toEqual([entry.relativePath]);
    expect(result.verifiedAssets).toBe(0);
  });

  it("counts only successful checks in a mixed archive and does not mutate entries", async () => {
    const entries = [
      asset("good.pdf"),
      asset("changed.pdf"),
      asset("missing.pdf"),
      { ...asset("bad-url.pdf"), downloadUrl: "/other/bad-url.pdf" },
    ];
    const original = structuredClone(entries);
    const result = await verifyMirrorAssets(entries, async (path) => {
      if (path === "missing.pdf") throw new Error("ENOENT");
      return path === "changed.pdf" ? "b".repeat(64) : digest;
    });
    expect(result).toEqual({
      totalAssets: 4,
      verifiedAssets: 1,
      checksumMismatches: ["changed.pdf"],
      unreadableFiles: ["missing.pdf"],
      badDownloadUrls: ["bad-url.pdf"],
    });
    expect(entries).toEqual(original);
  });
});
