import { createHash } from "node:crypto";
import { readFile, readdir, stat, writeFile } from "node:fs/promises";
import { join, relative, sep } from "node:path";

type AssetExtension =
  | "pdf"
  | "pages"
  | "numbers"
  | "docx"
  | "zip"
  | "txt"
  | "json"
  | "jpg"
  | "jpeg"
  | "png"
  | "gif"
  | "webp"
  | "unknown";

type MirrorAsset = {
  id: string;
  relativePath: string;
  fileName: string;
  ext: AssetExtension;
  sizeBytes: number;
  modifiedAt: string;
  sourceFolder: string;
  downloadUrl: string;
  sha256: string;
};

const root = process.cwd();
const mirrorRoot = join(root, "public/mirror");
const manifestPath = join(root, "src/data/mirror-manifest.json");

const knownExtensions = new Set<AssetExtension>([
  "pdf",
  "pages",
  "numbers",
  "docx",
  "zip",
  "txt",
  "json",
  "jpg",
  "jpeg",
  "png",
  "gif",
  "webp",
  "unknown",
]);

async function walk(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const abs = join(dir, entry.name);
    if (entry.isDirectory()) {
      const nested = await walk(abs);
      files.push(...nested);
      continue;
    }

    if (entry.isFile()) {
      files.push(abs);
    }
  }

  return files;
}

function toPosix(input: string): string {
  return input.split(sep).join("/");
}

function toId(pathValue: string): string {
  return createHash("sha1").update(pathValue).digest("hex").slice(0, 16);
}

function resolveExtension(fileName: string): AssetExtension {
  const dotIndex = fileName.lastIndexOf(".");
  const raw = dotIndex >= 0 ? fileName.slice(dotIndex + 1).toLowerCase() : "unknown";
  if (knownExtensions.has(raw as AssetExtension)) {
    return raw as AssetExtension;
  }
  return "unknown";
}

async function checksum(path: string): Promise<string> {
  const content = await readFile(path);
  return createHash("sha256").update(content).digest("hex");
}

async function run() {
  const files = await walk(mirrorRoot);

  const assets: MirrorAsset[] = [];

  for (const filePath of files) {
    const fileStat = await stat(filePath);
    const relPath = toPosix(relative(mirrorRoot, filePath));
    const parts = relPath.split("/");
    const fileName = parts[parts.length - 1];
    const ext = resolveExtension(fileName);

    assets.push({
      id: toId(relPath),
      relativePath: relPath,
      fileName,
      ext,
      sizeBytes: fileStat.size,
      modifiedAt: fileStat.mtime.toISOString(),
      sourceFolder: parts[0] ?? "",
      downloadUrl: `/mirror/${encodeURI(relPath)}`,
      sha256: await checksum(filePath),
    });
  }

  assets.sort((a, b) => a.relativePath.localeCompare(b.relativePath));

  await writeFile(manifestPath, `${JSON.stringify(assets, null, 2)}\n`, "utf8");
  console.log(`Wrote mirror manifest with ${assets.length} assets.`);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
