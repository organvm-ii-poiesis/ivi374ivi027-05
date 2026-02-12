import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { transformText } from "../src/lib/codex/generator";
import type { StyleDNA } from "../src/lib/codex/analyzer";

const root = process.cwd();
const styleDnaPath = join(root, "src/data/style-dna.json");
const seedsPath = join(root, "src/data/seeds.json");
const outputPath = join(root, "src/content/synthetic-cycle-4.md");

type Seed = { id: string; title: string; source: string; text: string };

async function run() {
  console.log("🔮 Initiating Cycle 4 Generation...");
  
  const dna = JSON.parse(await readFile(styleDnaPath, "utf8")) as StyleDNA;
  const seeds = JSON.parse(await readFile(seedsPath, "utf8")) as Seed[];
  
  const randomSeed = seeds[Math.floor(Math.random() * seeds.length)];
  const syntheticText = transformText(randomSeed.text, dna);

  const markdown = [
    `# Synthetic Cycle 4: @${randomSeed.id.toUpperCase()}`,
    "",
    "> Status: Algorithmic Extrapolation",
    `> Source: ${randomSeed.source} (${randomSeed.title})`,
    "",
    "## Full Text",
    "",
    syntheticText,
    "",
  ].join("\n");

  await writeFile(outputPath, markdown, "utf8");
  console.log(`✅ Synthetic Cycle 4 generated using seed: ${randomSeed.title}`);
}

run().catch(console.error);
