import { readdir, writeFile } from "node:fs/promises";
import { join, extname } from "node:path";

const root = process.cwd();
const mirrorPath = join(root, "public/mirror");
const outputPath = join(root, "src/data/artifacts.json");

type Artifact = {
  id: string;
  path: string;
  filename: string;
  type: "image" | "design" | "document";
  associatedNode?: string;
};

const HANDLE_MAP: Record<string, string> = {
  "Hermaphroditus": "@HERMAFRODITVS",
  "Apollo": "@APOLO",
  "Daphne": "@DAFNE",
  "Phaeton": "@FETVN",
  "Narcissus": "@NARSISVS",
  "Echo": "@EKO",
  "Perseus": "@PERSEVS",
  "Tiresias": "@TIRESIAS",
  "Minyades": "@MINYADES",
  "Pyramus": "@PYRAMVS",
  "Thisbe": "@THISBE",
  "Athamas": "@ATHAMAS",
  "Ino": "@INO",
  "Helios": "@HELIOS",
  "Leucothoe": "@LUCOTHO",
  "Minerva": "@MINERVA",
  "Muses": "@MVS",
  "Venus": "@VENVS",
  "Mars": "@MARS",
  "Pentheus": "@PENTEVS",
  "Bacchus": "@BAKVS",
};

async function getFiles(dir: string): Promise<string[]> {
  const dirents = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(dirents.map((dirent) => {
    const res = join(dir, dirent.name);
    return dirent.isDirectory() ? getFiles(res) : res;
  }));
  return files.flat();
}

async function run() {
  console.log("🎨 Scanning for Visual Artifacts with enhanced heuristics...");
  
  const allFiles = await getFiles(mirrorPath);
  const artifacts: Artifact[] = [];

  for (const file of allFiles) {
    const ext = extname(file).toLowerCase();
    if (![".jpg", ".jpeg", ".png", ".pdf", ".numbers", ".pages"].includes(ext)) continue;
    
    if (file.includes("sixth draft") || file.includes("fifth draft") || file.includes("fourth draft")) continue;

    const relativePath = file.replace(join(root, "public"), "");
    const filename = file.split("/").pop() || "";
    const basename = filename.split(".")[0];
    
    let associatedNode: string | undefined;
    
    // 1. Direct handle match
    const handleMatch = filename.match(/@([A-Z]+)/);
    if (handleMatch) {
      associatedNode = `@${handleMatch[1]}`;
    }

    // 2. Name-to-Handle map
    if (!associatedNode) {
      for (const [name, handle] of Object.entries(HANDLE_MAP)) {
        if (basename.toLowerCase().includes(name.toLowerCase())) {
          associatedNode = handle;
          break;
        }
      }
    }

    artifacts.push({
      id: `artifact-${filename.replace(/[^a-zA-Z0-9]/g, "-")}`,
      path: relativePath,
      filename,
      type: [".pdf", ".numbers", ".pages"].includes(ext) ? "document" : "image",
      associatedNode
    });
  }

  await writeFile(outputPath, JSON.stringify(artifacts, null, 2), "utf8");
  console.log(`✅ Mapped ${artifacts.length} visual artifacts.`);
}

run().catch(console.error);
