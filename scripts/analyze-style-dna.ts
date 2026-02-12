import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { analyzeText, mergeDNA, type StyleDNA } from "../src/lib/codex/analyzer";
import type { CanonicalDoc } from "../src/types/content";

const root = process.cwd();
const processedContentPath = join(root, "src/data/processed-content.json");
const styleDnaPath = join(root, "src/data/style-dna.json");

async function run() {
  console.log("🧬 Analyzing Style DNA...");
  
  const content = JSON.parse(await readFile(processedContentPath, "utf8")) as CanonicalDoc[];
  
  const docDNAs: StyleDNA[] = [];

  for (const doc of content) {
    // Reconstruct full text from sections for analysis
    const fullText = doc.sections.map(s => s.body).join("\n\n");
    const dna = analyzeText(fullText);
    docDNAs.push(dna);
    console.log(`   Processed ${doc.slug}: Found ${Object.keys(dna.entityRegistry).length} entities.`);
  }

  const projectDNA = mergeDNA(docDNAs);

  await writeFile(styleDnaPath, JSON.stringify(projectDNA, null, 2), "utf8");
  console.log(`✅ Style DNA generated at src/data/style-dna.json`);
  console.log(`   Unique Entities: ${Object.keys(projectDNA.entityRegistry).length}`);
  console.log(`   Avg Sentence Length: ${projectDNA.avgSentenceLength.toFixed(2)} words`);
}

run().catch(console.error);
