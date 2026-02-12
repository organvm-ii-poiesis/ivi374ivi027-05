import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { parseSections } from "../src/lib/content-engine";

const root = process.cwd();
const syntheticDocPath = join(root, "src/content/synthetic-cycle-4.md");
const exportPath = join(root, "src/data/social-signals.json");

async function run() {
  console.log("📤 Harvesting Publishable Signals...");
  
  const markdown = await readFile(syntheticDocPath, "utf8");
  const sections = parseSections(markdown, "cycle-4");

  const signals = sections.flatMap(section => {
    // Split into smaller fragments suitable for social media (e.g. < 280 chars)
    const sentences = section.body.split(/[.!?\n]+/);
    
    return sentences
      .map(s => s.trim())
      .filter(s => s.length > 40 && s.length < 240)
      .map(text => ({
        platform: "Bluesky/X",
        text: `${text}\n\n#MET4 #METAMORPHOSES`,
        metadata: {
          source: "Cycle 4 (Synthetic)",
          section: section.title
        }
      }));
  });

  await writeFile(exportPath, JSON.stringify(signals.slice(0, 10), null, 2), "utf8");
  console.log(`✅ Exported ${Math.min(signals.length, 10)} publishable signals to src/data/social-signals.json`);
}

run().catch(console.error);
