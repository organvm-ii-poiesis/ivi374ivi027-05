import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { transformText } from "../src/lib/codex/generator";
import { parseSections } from "../src/lib/content-engine";
import type { StyleDNA } from "../src/lib/codex/analyzer";
import type { CanonicalDoc } from "../src/types/content";

const root = process.cwd();
const styleDnaPath = join(root, "src/data/style-dna.json");
const corpusManifestPath = join(root, "src/data/corpus-manifest.json");
const processedContentPath = join(root, "src/data/processed-content.json");

type CorpusEntry = {
  sikl: number;
  book: number;
  myths: { id: string; title: string; summary: string }[];
};

async function run() {
  console.log("🌀 Expanding MET4MORFOSES to the Full Corpus (Books 4-15)...");
  
  const dna = JSON.parse(await readFile(styleDnaPath, "utf8")) as StyleDNA;
  const corpus = JSON.parse(await readFile(corpusManifestPath, "utf8")) as CorpusEntry[];
  const existingProcessed = JSON.parse(await readFile(processedContentPath, "utf8")) as CanonicalDoc[];

  // Filter out existing Sikls to avoid duplicates
  const filteredProcessed = existingProcessed.filter(d => !d.slug.startsWith("sikl-") || parseInt(d.slug.split("-")[1]) <= 3);
  const newProcessedDocs: CanonicalDoc[] = [...filteredProcessed];

  for (const entry of corpus) {
    const slug = `sikl-${entry.sikl}`;
    console.log(`   Generating ${slug} (Book ${entry.book})...`);

    const fullContent = entry.myths.map(myth => {
      const seed = `Ovid, Book ${entry.book}: ${myth.title}. ${myth.summary}`;
      return transformText(seed, dna);
    }).join("\n\n");

    const markdown = [
      `# Sikl ${entry.sikl}: Book ${entry.book}`,
      "",
      `> Status: Algorithmic Expansion`,
      `> Source: Ovid, Metamorphoses Book ${entry.book}`,
      "",
      "## Full Text",
      "",
      fullContent,
      "",
    ].join("\n");

    const markdownPath = `src/content/${slug}.md`;
    await writeFile(join(root, markdownPath), markdown, "utf8");

    const sections = parseSections(markdown, slug);

    newProcessedDocs.push({
      id: `canonical-${slug}`,
      slug,
      title: `Sikl ${entry.sikl}`,
      order: entry.sikl + 2, 
      sourcePdf: `[SYNTHETIC]`,
      markdownPath,
      wordCount: fullContent.split(/\s+/).length,
      sections,
    });
  }

  newProcessedDocs.sort((a, b) => a.order - b.order);

  await writeFile(processedContentPath, JSON.stringify(newProcessedDocs, null, 2), "utf8");
  console.log(`✅ Processed Content updated with ${corpus.length} new Sikls.`);
}

run().catch(console.error);
