import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { NarrativeNode } from "../src/types/content";

const root = process.cwd();
const nodeMapPath = join(root, "src/data/node-map.json");

async function run() {
  const nodeMap = JSON.parse(await readFile(nodeMapPath, "utf8")) as NarrativeNode[];

  // For this experiment, we mock trending data.
  // In production, this would call the PostHog API to get real view counts.
  const trendingIds = ["@APOLO", "@NARSISVS", "@DAFNE"];

  const updatedNodes = nodeMap.map((node) => {
    const isTrending = trendingIds.includes(node.id);
    return {
      ...node,
      isTrending,
      viewCount: isTrending ? Math.floor(Math.random() * 500) + 100 : Math.floor(Math.random() * 50),
    };
  });

  await writeFile(nodeMapPath, `${JSON.stringify(updatedNodes, null, 2)}
`, "utf8");
  console.log(`Mocked trending data for nodes: ${trendingIds.join(", ")}`);
}

run().catch(console.error);
