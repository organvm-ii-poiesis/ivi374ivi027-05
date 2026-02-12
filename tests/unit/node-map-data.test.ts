import { getCanonicalManifest } from "@/lib/content";
import { getFeedItems, getNarrativeNodes } from "@/lib/nodes";

describe("node map data", () => {
  it("contains node entities with linked docs", () => {
    const nodes = getNarrativeNodes();
    expect(nodes.length).toBeGreaterThan(5);
    expect(nodes.every((node) => node.linkedDocSlugs.length > 0)).toBe(true);
  });

  it("only references canonical document slugs", () => {
    const validSlugs = new Set(getCanonicalManifest().map((doc) => doc.slug));
    const nodes = getNarrativeNodes();

    expect(
      nodes.every((node) => node.linkedDocSlugs.every((slug) => validSlugs.has(slug))),
    ).toBe(true);
  });

  it("provides feed items that reference section anchors", () => {
    const items = getFeedItems();
    expect(items.length).toBeGreaterThan(5);
    expect(items.every((item) => item.contentRef.includes("#"))).toBe(true);
  });
});
