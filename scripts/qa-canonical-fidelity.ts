import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

type ManifestDoc = {
  id: string;
  slug: string;
  title: string;
  order: number;
  sourcePdf: string;
  markdownPath: string;
  wordCount: number;
};

type FidelityReportDoc = {
  slug: string;
  title: string;
  extractedWordCount: number;
  sourceWordCount: number;
  absoluteDelta: number;
  ratio: number;
  topSuspiciousSpans: string[];
};

type FidelityReport = {
  generatedAt: string;
  thresholdRatio: number;
  failingDocs: string[];
  docs: FidelityReportDoc[];
};

const root = process.cwd();
const thresholdRatio = 0.08;

const canonicalManifestPath = join(root, "src/data/canonical-manifest.json");
const outputPath = join(root, "src/data/canonical-fidelity-report.json");

function normalize(value: string): string {
  return value
    .replace(/\r\n?/g, "\n")
    .replace(/\f/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function countWords(value: string): number {
  const matches = value.match(/[\p{L}\p{N}'-]+/gu);
  return matches ? matches.length : 0;
}

function suspiciousSpans(text: string): string[] {
  const lines = text.split("\n");
  const suspicious = new Set<string>();

  for (const line of lines) {
    const compact = line.trim();
    if (!compact) {
      continue;
    }

    if (/^\d{1,3}$/.test(compact)) {
      suspicious.add(`Isolated page number-like token: "${compact}"`);
    }

    if (/\s{3,}/.test(line)) {
      suspicious.add(`Heavy spacing detected: "${compact.slice(0, 80)}"`);
    }

    if (/[@#][A-Z0-9]{2,}/.test(compact)) {
      suspicious.add(`Stylized marker: "${compact.slice(0, 80)}"`);
    }

    if (suspicious.size >= 6) {
      break;
    }
  }

  return Array.from(suspicious).slice(0, 5);
}

function extractPdfText(absPdfPath: string): string {
  const result = spawnSync("pdftotext", ["-layout", "-nopgbrk", absPdfPath, "-"], {
    encoding: "utf8",
    maxBuffer: 1024 * 1024 * 64,
  });

  if (result.status !== 0 || result.error) {
    throw new Error(result.stderr || result.error?.message || `Failed to read ${absPdfPath}`);
  }

  return result.stdout ?? "";
}

async function run() {
  const manifest = JSON.parse(await readFile(canonicalManifestPath, "utf8")) as ManifestDoc[];

  const docs: FidelityReportDoc[] = [];

  for (const doc of manifest.sort((a, b) => a.order - b.order)) {
    const markdown = await readFile(join(root, doc.markdownPath), "utf8");
    const cleanedMarkdown = normalize(markdown.replace(/^#.*$/gm, "").replace(/^>.*$/gm, ""));

    const sourcePdfAbsPath = join(root, "public", doc.sourcePdf.replace(/^\//, ""));
    const sourcePdfText = normalize(extractPdfText(sourcePdfAbsPath));

    const extractedWordCount = countWords(cleanedMarkdown);
    const sourceWordCount = countWords(sourcePdfText);
    const absoluteDelta = Math.abs(extractedWordCount - sourceWordCount);
    const ratio = sourceWordCount === 0 ? 0 : absoluteDelta / sourceWordCount;

    docs.push({
      slug: doc.slug,
      title: doc.title,
      extractedWordCount,
      sourceWordCount,
      absoluteDelta,
      ratio,
      topSuspiciousSpans: suspiciousSpans(cleanedMarkdown),
    });
  }

  const failingDocs = docs.filter((doc) => doc.ratio > thresholdRatio).map((doc) => doc.slug);

  const report: FidelityReport = {
    generatedAt: new Date().toISOString(),
    thresholdRatio,
    failingDocs,
    docs,
  };

  await writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

  if (failingDocs.length > 0) {
    throw new Error(
      `Canonical fidelity threshold exceeded for: ${failingDocs.join(", ")} (max allowed ratio ${thresholdRatio})`,
    );
  }

  console.log(`Fidelity QA passed for ${docs.length} docs.`);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
