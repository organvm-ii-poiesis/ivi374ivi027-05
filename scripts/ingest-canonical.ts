import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";

import { normalizeText, parseSections } from "../src/lib/content-engine";
import type { CanonicalDoc } from "../src/types/content";

type ManifestDoc = {
  id: string;
  slug: string;
  title: string;
  order: number;
  sourcePdf: string;
  markdownPath: string;
  wordCount: number;
  sections: unknown[];
};

const root = process.cwd();
const manifestPath = join(root, "src/data/canonical-manifest.json");
const processedContentPath = join(root, "src/data/processed-content.json");

function countWords(value: string): number {
  const matches = value.match(/[\p{L}\p{N}'-]+/gu);
  return matches ? matches.length : 0;
}

async function run() {
  const manifestRaw = await readFile(manifestPath, "utf8");
  const manifest = JSON.parse(manifestRaw) as ManifestDoc[];

  const updatedManifest: ManifestDoc[] = [];
  const processedDocs: CanonicalDoc[] = [];

  for (const doc of manifest) {
    const sourcePath = join(root, "public", doc.sourcePdf.replace(/^\//, ""));
    const extraction = spawnSync("pdftotext", ["-layout", "-nopgbrk", sourcePath, "-"], {
      cwd: root,
      encoding: "utf8",
      maxBuffer: 1024 * 1024 * 64,
    });

    if (extraction.status !== 0 || extraction.error) {
      const errOutput = extraction.stderr || extraction.error?.message || "unknown pdftotext failure";
      throw new Error(`Failed to ingest ${doc.slug}: ${errOutput}`);
    }

    const text = normalizeText(extraction.stdout ?? "");
    const markdown = [
      `# ${doc.title}`,
      "",
      `> Source PDF: ${doc.sourcePdf}`,
      "",
      "## Full Text",
      "",
      text,
      "",
    ].join("\n");

    const markdownAbsPath = join(root, doc.markdownPath);
    await mkdir(dirname(markdownAbsPath), { recursive: true });
    await writeFile(markdownAbsPath, markdown, "utf8");

    const sections = parseSections(markdown, doc.slug);
    const wordCount = countWords(text);

    updatedManifest.push({
      ...doc,
      wordCount,
      sections: [],
    });

    processedDocs.push({
      id: doc.id,
      slug: doc.slug,
      title: doc.title,
      order: doc.order,
      sourcePdf: doc.sourcePdf,
      markdownPath: doc.markdownPath,
      wordCount,
      sections,
    });
  }

  await writeFile(manifestPath, `${JSON.stringify(updatedManifest, null, 2)}\n`, "utf8");
  await writeFile(processedContentPath, `${JSON.stringify(processedDocs, null, 2)}\n`, "utf8");
  
  console.log(`Ingested ${updatedManifest.length} canonical docs and generated processed-content.json.`);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
