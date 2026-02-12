import { getAllCanonicalDocs, getCanonicalDocBySlug, getCanonicalManifest } from "@/lib/content";

describe("canonical content", () => {
  it("contains six canonical entries", () => {
    const manifest = getCanonicalManifest();
    expect(manifest).toHaveLength(6);
    expect(manifest.map((doc) => doc.slug)).toEqual([
      "preliminary-pages",
      "intro",
      "sikl-1",
      "sikl-2",
      "sikl-3",
      "bibliography",
    ]);
  });

  it("loads intro with sections and preserved body text", async () => {
    const intro = await getCanonicalDocBySlug("intro");
    expect(intro).not.toBeNull();
    expect(intro?.sections.length).toBeGreaterThan(0);
    expect(intro?.sections[0]?.body.length).toBeGreaterThan(50);
  });

  it("loads all canonical docs with non-zero word counts", async () => {
    const docs = await getAllCanonicalDocs();
    expect(docs.every((doc) => doc.wordCount > 0)).toBe(true);
  });
});
