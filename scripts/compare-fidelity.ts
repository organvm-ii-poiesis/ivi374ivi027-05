import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { analyzeText, type StyleDNA } from "../src/lib/codex/analyzer";

const root = process.cwd();
const styleDnaPath = join(root, "src/data/style-dna.json");
const syntheticDocPath = join(root, "src/content/synthetic-cycle-4.md");
const reportPath = join(root, "src/data/generation-fidelity-report.json");

async function run() {
  console.log("📊 Conducting Academic Style Comparison...");
  
  const baseline = JSON.parse(await readFile(styleDnaPath, "utf8")) as StyleDNA;
  const syntheticMarkdown = await readFile(syntheticDocPath, "utf8");
  const syntheticDNA = analyzeText(syntheticMarkdown);

  const metrics = [
    { name: "Avg Sentence Length", base: baseline.avgSentenceLength, synth: syntheticDNA.avgSentenceLength },
    { name: "Fragmentation Score", base: baseline.fragmentationScore, synth: syntheticDNA.fragmentationScore },
    { name: "Caps Ratio", base: baseline.glitchPatterns.capsLockRatio, synth: syntheticDNA.glitchPatterns.capsLockRatio },
    { name: "Symbol Density", base: baseline.glitchPatterns.symbolDensity, synth: syntheticDNA.glitchPatterns.symbolDensity }
  ];

  const fidelityMap = metrics.map(m => {
    const delta = Math.abs(m.base - m.synth);
    const accuracy = Math.max(0, 100 - (delta / (m.base || 1)) * 100);
    return { ...m, accuracy };
  });

  const overallFidelity = fidelityMap.reduce((sum, m) => sum + m.accuracy, 0) / fidelityMap.length;

  const report = {
    generatedAt: new Date().toISOString(),
    overallFidelity: `${overallFidelity.toFixed(2)}%`,
    comparison: fidelityMap,
    syntheticStats: syntheticDNA
  };

  await writeFile(reportPath, JSON.stringify(report, null, 2), "utf8");
  
  console.log(`✅ Fidelity Report generated: Overall Style Match = ${overallFidelity.toFixed(2)}%`);
  fidelityMap.forEach(m => {
    console.log(`   - ${m.name}: ${m.accuracy.toFixed(1)}% match`);
  });
}

run().catch(console.error);
