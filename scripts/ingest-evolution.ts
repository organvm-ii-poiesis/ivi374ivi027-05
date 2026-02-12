import { readdirSync, writeFile } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { normalizeText, parseSections } from "../src/lib/content-engine";
import type { EvolutionaryDoc } from "../src/types/content";

const root = process.cwd();
const evolutionMapPath = join(root, "src/data/evolution-map.json");

const DRAFTS = [
  { num: 4, path: "2018-02-14 - met4 - fourth draft", date: "2018-02-14" },
  { num: 5, path: "2018-02-14 - met4 - fifth draft", date: "2018-02-19" },
  { num: 6, path: "2018-03-20 - met4 - sixth draft", date: "2018-03-20" },
];

const SLUGS = ["intro", "sikl-1", "sikl-2", "sikl-3"];

const FILENAME_MAP: Record<string, string[]> = {
  "intro": ["met4-intro.pdf", "2018-02-12-met4-intro.pdf", "2018-02-19-met4-intro.pdf", "2018-03-20-met4-intro.pdf"],
  "sikl-1": ["met4-cycle-1.pdf", "2018-02-14-met4-cycle-1.pdf", "2018-02-19-met4-cycle-1.pdf", "2018-03-20-met4-cycle-1.pdf"],
  "sikl-2": ["met4-cycle-2.pdf", "2018-02-14-met4-cycle-2.pdf", "2018-02-19-met4-cycle-2.pdf", "2018-03-20-met4-cycle-2.pdf"],
  "sikl-3": ["met4-cycle-3.pdf", "2018-02-14-met4-cycle-3.pdf", "2018-02-19-met4-cycle-3.pdf", "2018-03-20-met4-cycle-3.pdf"],
};

function extractText(sourcePath: string): string {
  const extraction = spawnSync("pdftotext", ["-layout", "-nopgbrk", sourcePath, "-"], {
    encoding: "utf8",
    maxBuffer: 1024 * 1024 * 64,
  });
  return extraction.stdout ?? "";
}

function countWords(value: string): number {
  const matches = value.match(/[\p{L}\p{N}'-]+/gu);
  return matches ? matches.length : 0;
}

async function run() {
  console.log("⏳ Building The Time Machine (Evolutionary Ingestion)...");
  
  const evolution: EvolutionaryDoc[] = [];

  for (const slug of SLUGS) {
    const doc: EvolutionaryDoc = {
      slug,
      title: slug.charAt(0).toUpperCase() + slug.slice(1),
      versions: []
    };

    for (const draft of DRAFTS) {
      const possibleNames = FILENAME_MAP[slug] || [];
      let foundPath = "";
      
      const draftFolder = join(root, "public", "mirror", draft.path);
      const files = readdirSync(draftFolder);
      
      for (const name of possibleNames) {
        if (files.includes(name)) {
          foundPath = join(draftFolder, name);
          break;
        }
      }

      if (foundPath) {
        console.log(`   Processing ${slug} Draft ${draft.num}...`);
        const rawText = extractText(foundPath);
        const normalized = normalizeText(rawText);
        const sections = parseSections(normalized, `${slug}-d${draft.num}`);
        
        doc.versions.push({
          draft: draft.num,
          date: draft.date,
          sourcePdf: foundPath.replace(join(root, "public"), ""),
          wordCount: countWords(normalized),
          sections
        });
      }
    }
    evolution.push(doc);
  }

  writeFile(evolutionMapPath, JSON.stringify(evolution, null, 2), "utf8", () => {});
  console.log(`✅ Evolution Map generated at src/data/evolution-map.json`);
}

run().catch(console.error);
