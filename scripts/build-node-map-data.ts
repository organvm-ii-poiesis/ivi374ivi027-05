import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { NarrativeNode, FeedItem, CanonicalDoc } from "../src/types/content";

const root = process.cwd();
const processedContentPath = join(root, "src/data/processed-content.json");
const nodeMapPath = join(root, "src/data/node-map.json");
const feedItemsPath = join(root, "src/data/feed-items.json");
const ontologyPath = join(root, "src/data/ontology.json");

async function run() {
  console.log("📍 Rebuilding Narrative Graph for full corpus...");
  const content = JSON.parse(await readFile(processedContentPath, "utf8")) as CanonicalDoc[];
  const ontology = JSON.parse(await readFile(ontologyPath, "utf8")) as { mappings: Record<string, string> };

  const nodeIndex = new Map<
    string,
    {
      count: number;
      docs: Set<string>;
      sections: Set<string>;
    }
  >();

  const feedItems: FeedItem[] = [];
  let feedOrder = 1;

  for (const doc of content) {
    for (const section of doc.sections) {
      const tokenMatches = section.body.match(/@[A-Za-z0-9]+/g) ?? [];
      const tokenSet = Array.from(new Set(tokenMatches.map((token) => token.toUpperCase())));

      for (const token of tokenSet) {
        if (!nodeIndex.has(token)) {
          nodeIndex.set(token, {
            count: 0,
            docs: new Set(),
            sections: new Set(),
          });
        }

        const current = nodeIndex.get(token);
        if (!current) continue;

        current.count += 1;
        current.docs.add(doc.slug);
        current.sections.add(`${doc.slug}#${section.anchor}`);
      }

      const primaryNode = tokenSet[0] ?? "@MET4";
      feedItems.push({
        id: `feed-${doc.slug}-${feedOrder}`,
        timestampOrder: feedOrder,
        nodeId: primaryNode,
        contentRef: `${doc.slug}#${section.anchor}`,
        mediaRefs: [],
        tags: [doc.slug, section.anchor, ...tokenSet.slice(0, 2)],
      });

      feedOrder += 1;
    }
  }

  const sortedNodes = Array.from(nodeIndex.entries())
    .sort((a, b) => b[1].count - a[1].count)
    .map(([token, data], index, all) => {
      // Use a spiral distribution for better constellation aesthetics with more nodes
      const angle = (Math.PI * 2 * index) / 12; // Rotate every 12 nodes
      const radius = 15 + (index / all.length) * 75; // Grow outwards

      return {
        id: token,
        label: token,
        theme: ontology.mappings[token] ?? "metamorphosis",
        linkedDocSlugs: Array.from(data.docs),
        linkedSections: Array.from(data.sections),
        position: {
          x: Number((50 + Math.cos(angle) * radius).toFixed(3)),
          y: Number((50 + Math.sin(angle) * radius).toFixed(3)),
        },
      } satisfies NarrativeNode;
    });

  await writeFile(nodeMapPath, `${JSON.stringify(sortedNodes, null, 2)}\n`, "utf8");
  await writeFile(feedItemsPath, `${JSON.stringify(feedItems, null, 2)}\n`, "utf8");

  console.log(`✅ Narrative Graph built: ${sortedNodes.length} nodes, ${feedItems.length} feed items.`);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
